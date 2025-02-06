import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLocation } from "../services/locationService";
import { getWeather, translateWeatherDescription } from "../services/weatherService";
import api from "../services/api"; // ✅ Se usa api.js para conectar con el backend
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import bgImage from "../../assets/back.jpeg";
import SettingsButton from "../components/SettingsButton";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userData, setUserData] = useState({});
  const [userSembríos, setUserSembríos] = useState([]);

  // Ocultar la barra de navegación
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchLocationAndWeather = async () => {
    try {
      const { latitude, longitude } = await getLocation();
      setLocation({ latitude, longitude });

      const weatherData = await getWeather(latitude, longitude);
      setWeather(weatherData);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg("Error al obtener datos del clima");
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`); // ✅ Petición al backend con api.js
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

      {/* Clima */}
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        weather && (
          <ImageBackground source={bgImage} style={styles.weatherContainer} imageStyle={styles.weatherImage}>
            <View style={styles.weatherOverlay}>
              <View style={styles.weatherRow}>
                <Ionicons name="location" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {weather.name}, {weather.sys.country}
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="weather-cloudy" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {translateWeatherDescription(weather.weather[0].description)}
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <FontAwesome5 name="temperature-high" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {weather.main.temp}°C (Sensación: {weather.main.feels_like}°C)
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="weather-windy" size={22} color="white" />
                <Text style={styles.weatherText}>Viento: {weather.wind.speed} m/s</Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="water-percent" size={22} color="white" />
                <Text style={styles.weatherText}>Humedad: {weather.main.humidity}%</Text>
              </View>
            </View>
          </ImageBackground>
        )
      )}

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
    color: "#000",
    marginBottom: 20,
  },
  weatherContainer: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 20,
  },
  weatherImage: {
    borderRadius: 25,
  },
  weatherOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 25,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    color: "#fff",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Inter-SemiBold",
    color: "#1b1b1b",
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
    color: "#1eab56",
  },
  noCultivosText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#28a745",
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