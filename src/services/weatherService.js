import api from "./api";

export const getWeather = async (latitude, longitude) => {
  try {
    const response = await api.get(`/weather/?latitude=${latitude}&longitude=${longitude}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener el clima");
  }
};

export const translateWeatherDescription = (description) => {
  const translations = {
    "clear sky": "Cielo despejado",
    "few clouds": "Pocas nubes",
    "scattered clouds": "Nubes dispersas",
    "broken clouds": "Nubes fragmentadas",
    "shower rain": "Lluvia ligera",
    "rain": "Lluvia",
    "thunderstorm": "Tormenta",
    "snow": "Nieve",
    "mist": "Neblina",
    "light rain": "Lluvia ligera",
  };

  return translations[description] || description;
};
