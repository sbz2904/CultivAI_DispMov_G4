import api from "./api";

export const askChatbot = async (message, weather_data) => {
  try {
    const response = await api.post("/chatbot", { message, weather_data });
    return response.data;
  } catch (error) {
    throw new Error("Error al comunicarse con el chatbot");
  }
};
