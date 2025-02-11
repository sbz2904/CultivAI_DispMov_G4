import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { getLocation } from "../services/locationService";
import api from "../services/api";
import { getWeather, translateWeatherDescription } from "../services/weatherService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useUser } from "../context/UserContext";

const GOOGLE_VISION_API_KEY = "AIzaSyA7-guwoTeZ8bkh-Ooxb_KyVwEBh1I9_kA";
const GOOGLE_VISION_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;
const GEMINI_API_KEY = "AIzaSyCkXZNDIA_AF9Ruk3aM2SCz4qMIgT5-3mQ";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const validLabels = ["corn", "wheat", "broccoli", "lettuce", "carrot", "tomato", "potato", "soybean", "rice", "barley"];

const labelTranslations = {
  "corn": "Maíz",
  "wheat": "Trigo",
  "broccoli": "Brócoli",
  "lettuce": "Lechuga",
  "carrot": "Zanahoria",
  "tomato": "Tomate",
  "potato": "Papa",
  "soybean": "Soja",
  "rice": "Arroz",
  "barley": "Cebada"
};

const translateLabel = (label) => labelTranslations[label.toLowerCase()] || label;

const CultivAIVisionScreen = (route) => {
  const { userId } = useUser();
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchWeather();
    navigation.setOptions({ headerShown: false });
  }, [navigation]);


  const fetchWeather = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      const weatherData = await getWeather(latitude, longitude);
      setWeather(weatherData);
    } catch (error) {
      Alert.alert("Error", "Error al obtener datos del clima");
    }
  };

  const pickImage = async (fromCamera) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la cámara.');
      return;
    }
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      setLoading(true);
      setPrediction(null);
      setRecommendation(null);
      
      const imgB64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      
      const response = await fetch(GOOGLE_VISION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imgB64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
            },
          ],
        }),
      });
      
      const data = await response.json();
      console.log("Respuesta de Google Vision:", data);
      
      const validPrediction = data.responses[0]?.labelAnnotations?.find(pred => validLabels.includes(pred.description.toLowerCase()));
      
      if (!validPrediction) {
        throw new Error("No se encontraron cultivos válidos en la imagen");
      }
      
      const translatedLabel = translateLabel(validPrediction.description);
      setPrediction({ description: translatedLabel });
      fetchRecommendation(translatedLabel);
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la imagen. Asegúrate de seleccionar una imagen de un cultivo válido.");
      console.error("Error en la clasificación:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async (plantIssue) => {
    try {
        if (!weather) {
            throw new Error("Datos del clima no disponibles");
        }

        const context = `
            Actualmente, en tu ubicación (${weather?.name || "desconocida"}),
            la temperatura es de ${weather?.main?.temp || "desconocida"}°C,
            la humedad es del ${weather?.main?.humidity || "desconocida"}%,
            y el clima se describe como "${weather?.weather[0]?.description || "desconocido"}".
            Solo responde preguntas relacionadas con la agricultura.
        `;

        const prompt = `
            ${context}
            ¿Qué recomendaciones puedes darme para el cultivo de ${plantIssue} en estas condiciones?
        `;

        const result = await model.generateContent(prompt);
        const candidates = result?.response?.candidates;
        if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
            throw new Error("No se encontraron candidatos en la respuesta de la API.");
        }

        const botResponse = candidates[0]?.content?.parts?.[0]?.text;
        if (!botResponse || typeof botResponse !== "string") {
            throw new Error("El texto del candidato no es válido.");
        }

        // Eliminar asteriscos
        const cleanedResponse = botResponse.replace(/\*/g, '').trim();
        setRecommendation(cleanedResponse);
    } catch (error) {
        console.error("Error al obtener recomendación", error);
    }
};

const addSembrio = async () => {
  if (!prediction) return;

  const sembrioNombre = prediction.description;

  try {
    // Buscar si el sembrío existe en la lista de disponibles
    const response = await api.get("/sembrios/");
    const sembrio = response.data.find((s) => s.nombre.toLowerCase() === sembrioNombre.toLowerCase());

    if (!sembrio) {
      Alert.alert("Error", "El sembrío no está disponible en la base de datos.");
      return;
    }

    // Verificar si el usuario ya tiene el sembrío
    const userResponse = await api.get(`/users/${userId}`);
    const userSembríos = userResponse.data.sembrios || [];

    if (userSembríos.includes(sembrio._id)) {
      Alert.alert("Información", "¡Ya tienes este sembrío!");
      return;
    }

    // Confirmación para agregar el sembrío
    Alert.alert(
      "Añadir sembrío",
      `¿Quieres añadir ${sembrioNombre} a tus sembríos?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, añadir",
          onPress: async () => {
            try {
              await api.put(`/sembrios/users/${userId}/sembrios`, {
                sembrios: [...userSembríos, sembrio._id],
              });
              Alert.alert("Éxito", "Sembrío añadido correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo añadir el sembrío.");
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error("Error al añadir sembrío:", error);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>CultivAI Vision</Text>


        {/* Botones de selección de imagen y cámara */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
            <MaterialCommunityIcons name="folder-upload" size={30} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Subir foto</Text>

          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={30} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Tomar foto</Text>
        </View>

        {/* Imagen seleccionada */}
        {image && <Image source={{ uri: image }} style={styles.image} />}

        {/* Indicador de carga */}
        {loading && <ActivityIndicator size="large" color="#2E7D32" />}

        {/* Predicción de la imagen */}
        {prediction && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionText}>{prediction.description}</Text>
          </View>
        )}

        {/* Recomendación basada en la imagen */}
        {recommendation && (
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendationTitle}>Recomendación:</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        )}

        {/* Botón para añadir el sembrío */}
        {prediction && (
          <TouchableOpacity style={styles.iconButton} onPress={addSembrio}>
            <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "#FDFDFD",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDFDFD", // Fondo blanco puro
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#02974A",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  iconButton: {
    backgroundColor: "#0EB93F",
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  buttonLabel: {
    textAlign: "center",
    color: "#02974A",
    fontSize: 14,
    marginTop: 5,
  },

  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },

  predictionContainer: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginTop: 10,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#02974A",
  },

  recommendationContainer: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    marginTop: 10,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#02974A",
  },
  recommendationText: {
    fontSize: 16,
    color: "#02974A",
  },
});

export default CultivAIVisionScreen;