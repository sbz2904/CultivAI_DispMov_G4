import axios from 'axios';

const API_KEY = '1e53941ecd82227342e548ec70553384';

const weatherTranslations = {
    "clear sky": "Cielo despejado",
    "few clouds": "Pocas nubes",
    "scattered clouds": "Nubes dispersas",
    "broken clouds": "Nubes rotas",
    "shower rain": "Chubascos",
    "rain": "Lluvia",
    "thunderstorm": "Tormenta eléctrica",
    "snow": "Nieve",
    "mist": "Niebla",
    "light rain": "Lluvia ligera",
    "overcast clouds": "Nublado"
  };
  
  export const translateWeatherDescription = (description) => {
    return weatherTranslations[description] || description;
  };

export const getWeather = async (latitude, longitude) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener clima:", error);
    throw error;
  }
};
