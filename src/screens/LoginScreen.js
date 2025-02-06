
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"; // Iconos de Expo Icons
import axios from "axios";
import { Color, FontFamily, FontSize, Border } from "../styles/GlobalStyles";
import { getAllUsers } from "../services/userService";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Ocultar la barra de navegación
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const users = await getAllUsers();
      const user = users.find((u) => u.email === email && u.password === password);

      if (user) {
        Alert.alert("Éxito", "Inicio de sesión exitoso");
        navigation.navigate("Home", { userId: user.id });
      } else {
        Alert.alert("Error", "Correo o contraseña incorrectos");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Hubo un problema al iniciar sesión");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y título */}
      <Text style={styles.logoText}>
        <Text style={styles.cultiv}>Cultiv-</Text>
        <Text style={styles.ai}>AI</Text>
      </Text>
      <MaterialCommunityIcons name="sprout" size={50} color="#2bf532" style={styles.iconLogo} />
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Input Correo */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={Color.colorSilver}
        />
      </View>

      {/* Input Contraseña */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Color.colorSilver}
        />
      </View>

      {/* Botón de Inicio de Sesión */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Botón para crear cuenta */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Crear una Cuenta</Text>
      </TouchableOpacity>

      {/* Enlace para la creación de cuenta */}
      <Text style={styles.footerText}>
        No tienes una cuenta?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Has click aquí
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFFFA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoText: {
    fontFamily: "Lobster-Regular",
    fontSize: 44,
    textAlign: "center",
  },
  cultiv: {
    color: "#201010",
  },
  ai: {
    color: "#2bf532",
  },
  iconLogo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#171515",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EDED",
    borderRadius: 50,
    padding: 15,
    width: "85%",
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#333",
    fontSize: 20,
  },
  button: {
    backgroundColor: "#28EF78",
    borderRadius: 50,
    paddingVertical: 15,
    width: "60%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "#F0EDED",
    borderWidth: 1,
    borderColor: "#D1D1D1",
  },
  secondaryButtonText: {
    color: "#171515",
  },
  footerText: {
    fontSize: 16,
    color: "#000",
  },
  link: {
    color: "#11EC35",
    fontWeight: "bold",
  },
});

export default LoginScreen;

