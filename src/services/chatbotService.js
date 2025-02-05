import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa la API con tu clave
const genAI = new GoogleGenerativeAI("AIzaSyCkXZNDIA_AF9Ruk3aM2SCz4qMIgT5-3mQ");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askChatbot = async (message, weatherData) => {
  try {
    const context = `
      Actualmente, en tu ubicación (${weatherData?.name || "desconocida"}),
      la temperatura es de ${weatherData?.main?.temp || "desconocida"}°C,
      la humedad es del ${weatherData?.main?.humidity || "desconocida"}%,
      y el clima se describe como "${weatherData?.weather[0]?.description || "desconocido"}".
      Solo responde preguntas relacionadas con la agricultura.
    `;

    const prompt = `
      ${context}
      Pregunta del usuario: ${message}
    `;

    // Llamada al modelo generativo
    const result = await model.generateContent(prompt);

    // Verifica si hay candidatos y extrae el texto del primer candidato
    const candidates = result?.response?.candidates;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      throw new Error("No se encontraron candidatos en la respuesta de la API.");
    }

    // Extraer el texto del primer candidato
    const botResponse = candidates[0]?.content?.parts?.[0]?.text;
    if (!botResponse || typeof botResponse !== "string") {
      throw new Error("El texto del candidato no es válido.");
    }

    return botResponse.trim(); // Asegúrate de eliminar espacios innecesarios
  } catch (error) {
    return "No se pudo obtener una respuesta en este momento.";
  }
};
