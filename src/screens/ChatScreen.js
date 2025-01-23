import React, { useState } from "react";
import { StyleSheet, View, TextInput, Button, Text, ScrollView } from "react-native";
import { askChatbot } from "../services/chatbotService";
import { getWeather } from "../services/weatherService";
import { getLocation } from "../services/locationService";

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

      // Enviar el mensaje al chatbot
      const botResponse = await askChatbot(userInput, weatherData);

      // Actualizar el chat con el mensaje del usuario y la respuesta del bot
      setChatLog([...chatLog, { user: userInput, bot: botResponse }]);
      setUserInput(""); // Limpia la entrada del usuario
    } catch (error) {
      setErrorMsg("Hubo un problema al procesar tu mensaje.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {chatLog.map((log, index) => (
          <View key={index} style={styles.message}>
            <Text style={styles.user}>Tú: {log.user}</Text>
            {log.bot && typeof log.bot === "string" ? (
              <Text style={styles.bot}>Bot: {log.bot}</Text>
            ) : (
              <Text style={styles.bot}>Bot: No tengo una respuesta adecuada.</Text>
            )}
          </View>
        ))}
      </ScrollView>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      <TextInput
        style={styles.input}
        value={userInput}
        onChangeText={setUserInput}
        placeholder="Escribe tu mensaje..."
      />
      <Button title="Enviar" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    marginBottom: 10,
  },
  user: {
    fontWeight: "bold",
    color: "#333",
  },
  bot: {
    color: "#555",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default ChatScreen;
