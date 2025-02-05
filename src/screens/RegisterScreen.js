import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import api from "../services/api"; // Se usa api.js para centralizar las peticiones

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Ocultar la barra de navegación
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleRegister = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await api.post("/users", { nombre, email, password });

      if (response.data && response.data.id) {
        Alert.alert("Éxito", "Cuenta creada con éxito");
        navigation.navigate("Login"); // Redirigir a Login
      } else {
        throw new Error("No se pudo registrar el usuario");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y Nombre de la App */}
      <Text style={styles.logoText}>
        <Text style={styles.cultiv}>Cultiv-</Text>
        <Text style={styles.ai}>AI</Text>
      </Text>
      <MaterialCommunityIcons name="sprout" size={50} color="#2bf532" style={styles.iconLogo} />

      {/* Título */}
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* Campos de Registro */}
      <View style={styles.inputContainer}>
        <Ionicons name="person-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="gray"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Repetir Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="gray"
        />
      </View>

      {/* Botón de Registro */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
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
    backgroundColor: "#6AF84D",
    borderRadius: 50,
    paddingVertical: 15,
    width: "60%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
