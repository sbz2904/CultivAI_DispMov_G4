import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLocation } from "../services/locationService";
import { getWeather} from "../services/weatherService";
import api from "../services/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SettingsButton from "../components/SettingsButton";
import { useUser } from "../context/UserContext";

const GEMINI_API_KEY = "AIzaSyCkXZNDIA_AF9Ruk3aM2SCz4qMIgT5-3mQ";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId } = useUser();
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userData, setUserData] = useState({});
  const [recommendation, setRecommendation] = useState("Cargando recomendación...");
  const [userSembríos, setUserSembríos] = useState([]);

  // Ocultar la barra de navegación
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    fetchLocationAndWeather();
    fetchUserData();
  }, [navigation]);

  const fetchLocationAndWeather = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      setLocation({ latitude, longitude });
      const weatherData = await getWeather(latitude, longitude);
      setWeather(weatherData);
      fetchRecommendation(weatherData);
    } catch (error) {
      setRecommendation("No se pudo obtener la recomendación del día.");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);

      const sembríosIds = response.data.sembrios || [];
      const sembríosData = await Promise.all(
        sembríosIds.map(async (id) => {
          const sembrioResponse = await api.get(`/sembrios/${id}`);
          return {
            id,
            nombre: sembrioResponse.data.nombre,
            icon: sembrioResponse.data.icon,
            detalles: sembrioResponse.data.detalles,
          };
        })
      );
      setUserSembríos(sembríosData);
    } catch (error) {
      setErrorMsg("Error al obtener datos del usuario o sembríos");
    }
  };

  const fetchRecommendation = async (weatherData) => {
    try {
      if (!weatherData) {
        throw new Error("Datos del clima no disponibles");
      }
      const context = `
        En tu ubicación (${weatherData.name}), la temperatura es de ${weatherData.main.temp}°C,
        la humedad es del ${weatherData.main.humidity}%, y el clima se describe como "${weatherData.weather[0].description}".
        Solo responde preguntas relacionadas con la agricultura.
      `;

      const prompt = `
        ${context}
        ¿Qué recomendaciones puedes darme para cuidar mis sembríos en estas condiciones climáticas?, que la recomendación tenga máximo 1 linea.
      `;

      const result = await model.generateContent(prompt);
      const candidates = result?.response?.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("No se encontraron recomendaciones.");
      }
      const botResponse = candidates[0]?.content?.parts?.[0]?.text;
      setRecommendation(botResponse.replace(/\*/g, '').trim());
    } catch (error) {
      setRecommendation("No se pudo obtener la recomendación del día.");
    }
  };


  useEffect(() => {
    fetchLocationAndWeather();
    fetchUserData();
  }, [userId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SettingsButton userId={userId} />
      <Text style={styles.headerText}>Hola, {userData.nombre || "Usuario"}</Text>
      <View style={styles.recommendationContainer}>
        <Text style={styles.recommendationTitle}>Recomendación del Día</Text>
          <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>

      {/* Cultivos */}
      <Text style={styles.sectionTitle}>Mis Cultivos</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("SelectSembríos", { userId })}
      >
        <Text style={styles.addButtonText}>Añadir Cultivos</Text>
      </TouchableOpacity>
      <View style={styles.cultivosContainer}>
        {userSembríos.length > 0 ? (
          userSembríos.map((sembrío, index) => (
            <View key={index} style={styles.cultivoBox}>
              <ImageBackground source={{ uri: sembrío.icon }} style={styles.cultivoBackground} imageStyle={styles.cultivoImage}>
                <Text style={styles.cultivoText}>{sembrío.nombre}</Text>
                <TouchableOpacity
                  style={styles.cultivoButton}
                  onPress={() =>
                    navigation.navigate("SembríoDetalles", {
                      userId: userId,
                      sembríoId: sembrío.id,
                      sembríoNombre: sembrío.nombre,
                      sembríoDetalles: sembrío.detalles,
                    })
                  }
                >
                  <Text style={styles.cultivoButtonText}>Ver más</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          ))
        ) : (
          <Text style={styles.noCultivosText}>No hay cultivos registrados.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    marginTop: 70,
  },
  headerText: {
    fontSize: 30,
    fontFamily: "Montserrat-SemiBold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  weatherContainer: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  recommendationContainer: {
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  recommendationTitle: {
    fontSize: 18,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: "#1B5E20",
    textAlign: "center",
  },
  sectionTitle: {
    paddingVertical: 10,
    fontSize: 24,
    fontFamily: "Inter-SemiBold",
    color: "#2E7D32",
    marginBottom: 15,
    textAlign: "center",
  },
  cultivosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cultivoBox: {
    width: "48%", // 📏 Hace que haya dos por fila
    aspectRatio: 1, // 📐 Hace que sean cuadrados
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cultivoBackground: {
    width: "130%",
    height: "130%",
    borderRadius: 10,
    marginBottom: 5,
    marginTop: -30,
    alignContent: "center",
    alignItems: "center",
    flex: 0.8, // 🔥 Para que ocupe todo el cultivoBox
    justifyContent: "center",
    alignItems: "center",
  },
  cultivoImage: {
    borderRadius: 15,
    opacity: 0.5, // 🔥 Reduce un poco la opacidad para mejor contraste con el texto
  },
  cultivoIcon: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  cultivoText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 40,
    marginBottom: -60,
    textAlign: "center",
  },
  cultivoButton: {
    marginTop: 80,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  cultivoButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  noCultivosText: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 1,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default HomeScreen;