import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { getLocation } from '../services/locationService';
import { getWeather, translateWeatherDescription } from '../services/weatherService';

const HomeScreen = () => {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchLocationAndWeather = async () => {
    try {
      // Obtener ubicación
      const { latitude, longitude } = await getLocation();
      setLocation({ latitude, longitude });

      // Obtener clima
      const weatherData = await getWeather(latitude, longitude);
      setWeather(weatherData);
      setErrorMsg(null); // Limpiar errores anteriores
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  useEffect(() => {
    fetchLocationAndWeather();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CultivAI</Text>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : location ? (
        <View>
          <Text style={styles.text}>Ubicación: {weather?.name}, {weather?.sys.country}</Text>
          <Text style={styles.text}>Temperatura: {weather?.main.temp} °C</Text>
          <Text style={styles.text}>Sensación Térmica: {weather?.main.feels_like} °C</Text>
          <Text style={styles.text}>Clima: {translateWeatherDescription(weather?.weather[0].description)}</Text>
          <Text style={styles.text}>Velocidad del Viento: {weather?.wind.speed} m/s</Text>
          <Text style={styles.text}>Humedad: {weather?.main.humidity}%</Text>
          <Text style={styles.text}>Nubosidad: {weather?.clouds.all}%</Text>
        </View>
      ) : (
        <Text style={styles.text}>Fetching location...</Text>
      )}
      <Button title="Recargar Ubicación y Clima" onPress={fetchLocationAndWeather} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
});

export default HomeScreen;
