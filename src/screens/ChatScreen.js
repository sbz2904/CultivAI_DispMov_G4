import React, { useState } from "react";
import { StyleSheet, View, TextInput, Text, ScrollView, TouchableOpacity } from "react-native";
import api from "../services/api"; // ✅ Se usa api.js para conectar con el backend
import { getWeather } from "../services/weatherService";
import { getLocation } from "../services/locationService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const FontFamily = {
  robotoRegular: "Roboto-Regular",
  robotoBold: "Roboto-Bold",
  sFProText: "SF Pro Text",
};
const FontSize = {
  size_base: 16,
  size_5xl: 24,
  size_2xs: 11,
};
const Color = {
  colorWhite: "#fff",
  colorGray_100: "rgba(0, 0, 0, 0.25)",
  colorBlack: "#000",
};
const Border = {
  br_5xs: 8,
};

const ChatScreen = () => {
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      // Obtener la ubicación y clima
      const { latitude, longitude } = await getLocation();
      const weatherData = await getWeather(latitude, longitude);

      // Enviar el mensaje al chatbot usando api.js
      const response = await api.post("/chatbot", {
        message: userInput,
        weather_data: weatherData,
      });

      // Actualizar el chat con el mensaje del usuario y la respuesta del bot
      setChatLog([...chatLog, { user: userInput, bot: response.data.response }]);
      setUserInput(""); // Limpia la entrada del usuario
    } catch (error) {
      setErrorMsg("Hubo un problema al procesar tu mensaje.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Mensajes del Chat */}
      <ScrollView style={styles.chatContainer}>
        {chatLog.map((log, index) => (
          <View key={index} style={styles.messageContainer}>
            <View style={styles.userMessage}>
              <Text style={styles.userText}>Tú: {log.user}</Text>
            </View>
            <View style={styles.botMessage}>
              <Text style={styles.botText}>
                {log.bot && typeof log.bot === "string" ? `Bot: ${log.bot}` : "Bot: No tengo una respuesta adecuada."}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {/* Entrada de texto y botón de enviar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="gray"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Estilos de ChatScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: Border.br_5xs,
    maxWidth: "80%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EAEAEA",
    padding: 10,
    borderRadius: Border.br_5xs,
    maxWidth: "80%",
  },
  userText: {
    fontFamily: FontFamily.robotoBold,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  botText: {
    fontFamily: FontFamily.robotoRegular,
    fontSize: FontSize.size_base,
    color: Color.colorBlack,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Border.br_5xs,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: FontSize.size_base,
    fontFamily: FontFamily.robotoRegular,
    color: "#333",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: Border.br_5xs,
  },
});

export default ChatScreen;
