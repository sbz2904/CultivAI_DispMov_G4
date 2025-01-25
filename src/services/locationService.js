import * as Location from 'expo-location';

export const getLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se denegó el permiso para acceder a la ubicación');
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    return { latitude, longitude };
  } catch (error) {
    console.error("Error al obtener ubicación:", error);
    throw error;
  }
};
