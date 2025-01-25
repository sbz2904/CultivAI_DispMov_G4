import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Button, TouchableOpacity, ScrollView } from 'react-native';
import { getLocation } from '../services/locationService';
import { getWeather, translateWeatherDescription } from '../services/weatherService';
import { getUserById } from '../services/userService';
import { getSembríoById } from '../services/sembriosService';

const HomeScreen = ({ route, navigation }) => {
  const { userId } = route.params; // ID del usuario pasado como parámetro
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userSembríos, setUserSembríos] = useState([]);

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
              <Text style={styles.text}>Nombre de usuario: {userData.nombre}</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  weatherContainer: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  userInfo: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#e6f7ff",
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
