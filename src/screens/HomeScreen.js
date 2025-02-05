import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLocation } from "../services/locationService";
import { getWeather, translateWeatherDescription } from "../services/weatherService";
import { getUserById } from "../services/userService";
import { getSembríoById } from "../services/sembriosService";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import bgImage from "../../assets/back.jpeg";
import SettingsButton from "../components/SettingsButton";

const HomeScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userData, setUserData] = useState(null);
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
      setErrorMsg(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      const user = await getUserById(userId);
      setUserData(user);

      const sembríosIds = user.sembríos || [];
      const sembríosData = await Promise.all(
        sembríosIds.map(async (id) => {
          const sembrío = await getSembríoById(id);
          return { id, nombre: sembrío.nombre, icon: sembrío.icon, detalles: sembrío.detalles };
        })
      );
      setUserSembríos(sembríosData);
    } catch (error) {
      console.error("Error al obtener los datos del usuario o sembríos:", error);
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
      {/* Encabezado */}
      <Text style={styles.headerText}>Hola, {userData?.nombre || "Usuario"}</Text>

      {/* Ubicación y Clima */}
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        weather && (
          <ImageBackground source={bgImage} style={styles.weatherContainer} imageStyle={styles.weatherImage}>
            <View style={styles.weatherOverlay}>
              <View style={styles.weatherRow}>
                <Ionicons name="location" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {weather?.name}, {weather?.sys.country}
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="weather-cloudy" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {translateWeatherDescription(weather?.weather[0].description)}
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <FontAwesome5 name="temperature-high" size={22} color="white" />
                <Text style={styles.weatherText}>
                  {weather?.main.temp}°C (Sensación: {weather?.main.feels_like}°C)
                </Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="weather-windy" size={22} color="white" />
                <Text style={styles.weatherText}>Viento: {weather?.wind.speed} m/s</Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="water-percent" size={22} color="white" />
                <Text style={styles.weatherText}>Humedad: {weather?.main.humidity}%</Text>
              </View>
              <View style={styles.weatherRow}>
                <MaterialCommunityIcons name="weather-fog" size={22} color="white" />
                <Text style={styles.weatherText}>Nubosidad: {weather?.clouds.all}%</Text>
              </View>
            </View>
          </ImageBackground>
        )
      )}

      {/* Sección de Cultivos */}
      <Text style={styles.sectionTitle}>Mis Cultivos</Text>
        {/* Botón para seleccionar nuevos cultivos */}
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
            <ImageBackground
              source={{ uri: sembrío.icon }}
              style={styles.cultivoBackground}
              imageStyle={styles.cultivoImage}
              blurRadius={8} // 🔥 Aplica el blur
            >
              <Text style={styles.cultivoText}>{sembrío.nombre}</Text>
              <TouchableOpacity
                style={styles.cultivoButton}
                onPress={() =>
                  navigation.navigate("SembríoDetalles", {
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
    flex: 0.8, // 🔥 Para que ocupe todo el `cultivoBox`
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
