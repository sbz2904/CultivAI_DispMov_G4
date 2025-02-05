import api from "./api";

export const askChatbot = async (message, weatherData) => {
  try {
    const response = await api.post("/chatbot", { message, weather_data: weatherData });
    return response.data;
  } catch (error) {
    throw new Error("Error al comunicarse con el chatbot");
  }
};
