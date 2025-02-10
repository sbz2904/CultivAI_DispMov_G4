import React, { useState, useEffect } from "react";
import { 
  StyleSheet, View, TextInput, Text, ScrollView, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform 
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { getWeather } from "../services/weatherService";
import { getLocation } from "../services/locationService";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ChatScreen = () => {
  const [userInput, setUserInput] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setChatLog([...chatLog, { user: userInput, bot: "typing..." }]);
    setIsBotTyping(true);
    setUserInput("");

    try {
      const { latitude, longitude } = await getLocation();
      const weatherData = await getWeather(latitude, longitude);

      const response = await api.post("/chatbot/", {
        message: userInput,
        weather_data: weatherData,
      });

      setChatLog((prevChat) =>
        prevChat.map((msg, i) =>
          i === prevChat.length - 1 ? { ...msg, bot: response.data.response } : msg
        )
      );
    } catch (error) {
      setChatLog((prevChat) =>
        prevChat.map((msg, i) =>
          i === prevChat.length - 1 ? { ...msg, bot: "Lo siento, hubo un error." } : msg
        )
      );
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="sprout" size={30} color="#2E7D32" />
            <Text style={styles.headerText}>Chat con Culti</Text>
          </View>

          <ScrollView style={styles.chatContainer}>
            {chatLog.map((log, index) => (
              <View key={index} style={styles.messageWrapper}>
                <View style={[styles.userMessage, { marginBottom: 10 }]}>
                  <Text style={styles.userText}>{log.user}</Text>
                </View>
                <View style={[styles.botMessage, { marginTop: 10 }]}>
                  {log.bot === "typing..." ? (
                    <View style={styles.typingContainer}>
                      <ActivityIndicator size="small" color="#388E3C" />
                      <Text style={styles.typingText}>Culti está escribiendo...</Text>
                    </View>
                  ) : (
                    <Text style={styles.botText}>{log.bot}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#1B5E20"
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isBotTyping}>
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// **Estilos originales con la solución aplicada**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  headerText: {
    paddingVertical: 29,
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginLeft: 10,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#C8E6C9",
    padding: 12,
    borderRadius: 20,
    maxWidth: "80%",
    marginBottom: 5,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 20,
    maxWidth: "80%",
    marginTop: 5,
  },
  userText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20",
  },
  botText: {
    fontSize: 16,
    color: "#2E7D32",
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    fontSize: 14,
    color: "#388E3C",
    marginLeft: 8,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#388E3C",
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: "#1B5E20",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#2E7D32",
    padding: 12,
    borderRadius: 50,
  },
});

export default ChatScreen;
