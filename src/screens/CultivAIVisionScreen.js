import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert, ScrollView} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { getLocation } from "../services/locationService";
import { getWeather, translateWeatherDescription } from "../services/weatherService";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_VISION_API_KEY = "AIzaSyDPMd9wzk2OJOaBph5LNCZt5OQsrSj4HnU";
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

const CultivAIVisionScreen = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      const weatherData = await getWeather(latitude, longitude);
      setWeather(weatherData);
    } catch (error) {
      Alert.alert("Error", "Error al obtener datos del clima");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

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

return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
            <Text style={styles.title}>CultivAI Vision</Text>
            {weather && (
                <Text style={styles.weatherText}>
                    Clima actual: {translateWeatherDescription(weather.weather[0].description)}, {weather.main.temp}°C
                </Text>
            )}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.image} />}
            {loading && <ActivityIndicator size="large" color="#28a745" />}
            {prediction && (
                <View style={styles.predictionContainer}>
                    <Text style={styles.predictionText}>{prediction.description}</Text>
                </View>
            )}
            {recommendation && (
                <View style={styles.recommendationContainer}>
                    <Text style={styles.recommendationTitle}>Recomendación:</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
            )}
        </View>
    </ScrollView>
);

};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FAFFFA",
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    weatherText: {
      fontSize: 18,
      marginBottom: 10,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#28a745",
      padding: 15,
      borderRadius: 10,
      marginBottom: 20,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      marginLeft: 10,
    },
    image: {
      width: 250,
      height: 250,
      borderRadius: 10,
      marginBottom: 20,
    },
    predictionContainer: {
      backgroundColor: "#EAEAEA",
      padding: 15,
      borderRadius: 10,
    },
    predictionText: {
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
    recommendationContainer: {
      backgroundColor: "#EAF7EA",
      padding: 15,
      borderRadius: 10,
      marginTop: 10,
    },
    recommendationTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    recommendationText: {
      fontSize: 16,
    },
  });
  
  export default CultivAIVisionScreen;
  
  
  
  



