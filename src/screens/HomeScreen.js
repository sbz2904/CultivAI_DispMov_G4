import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, Button, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getLocation } from '../services/locationService';
import { getWeather, translateWeatherDescription } from '../services/weatherService';
import { getUserById } from '../services/userService';
import { getSembríoById } from '../services/sembriosService';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import bgImage from '../../assets/back.jpeg';
import SettingsButton from '../components/SettingsButton';

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
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CultivAI</Text>

      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        <>
          {/* Datos del clima */}
          {weather && (
            <View style={styles.weatherContainer}>
              <Text style={styles.text}>Nombre de usuario: {userData?.nombre}</Text>
              <Text style={styles.text}>Ubicación: {weather?.name}, {weather?.sys.country}</Text>
              <Text style={styles.text}>Temperatura: {weather?.main.temp} °C</Text>
              <Text style={styles.text}>Sensación Térmica: {weather?.main.feels_like} °C</Text>
              <Text style={styles.text}>Clima: {translateWeatherDescription(weather?.weather[0].description)}</Text>
              <Text style={styles.text}>Velocidad del Viento: {weather?.wind.speed} m/s</Text>
              <Text style={styles.text}>Humedad: {weather?.main.humidity}%</Text>
              <Text style={styles.text}>Nubosidad: {weather?.clouds.all}%</Text>
              <Button title="Recargar Ubicación y Clima" onPress={fetchLocationAndWeather} />
            </View>
          )}

          {/* Datos del usuario */}
          {userData && (
            <View style={styles.userInfo}>
              <Text style={styles.subtitle}>Mis Sembríos:</Text>
              {userSembríos.length > 0 ? (
                userSembríos.map((sembrío, index) => (
                  <View key={index} style={styles.box}>
                    {/* Ícono del sembrío */}
                    <Image source={{ uri: sembrío.icon }} style={styles.icon} />
                    {/* Nombre del sembrío */}
                    <Text style={styles.text}>{sembrío.nombre}</Text>
                    {/* Botón para ver más detalles */}
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() =>
                        navigation.navigate('SembríoDetalles', {
                          sembríoId: sembrío.id,
                          sembríoNombre: sembrío.nombre,
                          sembríoDetalles: sembrío.detalles,
                        })
                      }
                    >
                      <Text style={styles.buttonText}>Ver más detalles</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.text}>No hay sembríos asociados.</Text>
              )}
            </View>
          )}
        </>
      )}

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
                blurRadius={8}
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
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  weatherContainer: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  weatherText: {
    marginLeft: 10,
    fontSize: 16,
    color: "white",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: "#3cba54",
    padding: 10,
    marginBottom: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: 18,
    color: "white",
  },
  cultivoBox: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
    height: 120,
  },
  cultivoBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cultivoImage: {
    borderRadius: 10,
  },
  cultivoText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  cultivoButton: {
    backgroundColor: "#fff",
    padding: 5,
    marginTop: 10,
    borderRadius: 5,
  },
  cultivoButtonText: {
    fontSize: 16,
    color: "#3cba54",
  },
  noCultivosText: {
    textAlign: "center",
    fontSize: 18,
  },
});

export default HomeScreen;

