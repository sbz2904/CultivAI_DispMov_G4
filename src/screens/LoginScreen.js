import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import Logo from "../../assets/LogoCultivAI.png";
import { Image } from "react-native";
import { GlobalStyles } from "../styles/GlobalStyles";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const { setUserId } = useUser();
  const [password, setPassword] = useState("");
  const [disabledPassword, setDisabledPassword] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await api.post("/users/login", { email, password });

      if (response.data && response.data.user_id) {
        Alert.alert("Éxito", "Inicio de sesión exitoso");
        setUserId(response.data.user_id);
        navigation.replace("Main"); 
      } else {
        Alert.alert("Error", "Correo o contraseña incorrectos");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo conectar con el servidor");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image source={Logo} style={styles.logo} />

          <Text style={GlobalStyles.title}>Iniciar Sesión</Text>

          <View style={GlobalStyles.inputContainer}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#02974A" style={GlobalStyles.icon} />
            <TextInput
              style={GlobalStyles.input}
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#02974A"
            />
          </View>

          <View style={GlobalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#02974A" style={GlobalStyles.icon} />
            <TextInput
              style={GlobalStyles.input}
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={disabledPassword}
              placeholderTextColor="#02974A"
            />
            <Ionicons name={disabledPassword ? "eye" : "eye-off"} size={24} color="#02974A" style={GlobalStyles.icon} onPress={() => setDisabledPassword(!disabledPassword)} />
          </View>

          <TouchableOpacity style={GlobalStyles.button} onPress={handleLogin}>
            <MaterialCommunityIcons name="login" size={24} color="#FFF" style={GlobalStyles.icon} />
            <Text style={GlobalStyles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            No tienes una cuenta?{" "}
            <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
              Haz click aquí
            </Text>
          </Text>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: "#000",
  },
  link: {
    color: "#0EB93F",
    fontWeight: "bold",
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: "contain",
    marginBottom: 10,
  },
});

export default LoginScreen;
