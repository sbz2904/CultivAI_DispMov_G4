import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/LogoCultivAI.png";
import api from "../services/api";
import { Image } from "react-native";
import { GlobalStyles } from "../styles/GlobalStyles";
import { Material } from "three";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disabledPassword, setDisabledPassword] = useState(true);
  const [disabledConfirmPassword, setDisabledConfirmPassword] = useState(true);
  const regexName = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
    if (!regexName.test(nombre)) {
      Alert.alert("Error", "El nombre ingresado no es válido");
      return;
    }
    if (!regexEmail.test(email)) {
      Alert.alert("Error", "El correo ingresado no es válido");
      return;
    }
    if(password.length < 6){
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    try {
      const response = await api.post("/users/", { nombre, email, password });

      if (response.data && response.data.id) {
        Alert.alert("Éxito", "Cuenta creada con éxito");
        navigation.navigate("Login");
      } else {
        throw new Error("No se pudo registrar el usuario");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo crear la cuenta");
    }
  };

  return (
    <View style={GlobalStyles.container}>
      {/* Logo y Nombre de la App */}
      <Image source={Logo} style={styles.logo} />
      <Text style={GlobalStyles.logoText}>
        <Text style={GlobalStyles.cultiv}>Cultiv-</Text>
        <Text style={GlobalStyles.ai}>AI</Text>
      </Text>

      {/* Título */}
      <Text style={GlobalStyles.title}>Crear Cuenta</Text>

      {/* Campos de Registro */}
      <View style={GlobalStyles.inputContainer}>
        <Ionicons name="person-outline" size={24} color="#388E3C" style={GlobalStyles.icon} />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#1B5E20"
        />
      </View>

      <View style={GlobalStyles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="#388E3C" style={GlobalStyles.icon} />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#1B5E20"
        />
      </View>

      <View style={GlobalStyles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#388E3C" style={GlobalStyles.icon} />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={disabledPassword}
          placeholderTextColor="#1B5E20"
        />
        <Ionicons name={disabledPassword ? "eye" : "eye-off"} size={24} color="#388E3C" style={GlobalStyles.icon} onPress={() => setDisabledPassword(!disabledPassword)} />
      </View>

      <View style={GlobalStyles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#388E3C" style={GlobalStyles.icon} />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Repetir Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={disabledConfirmPassword}
          placeholderTextColor="#1B5E20"
        />
        <Ionicons name={disabledConfirmPassword ? "eye" : "eye-off"} size={24} color="#388E3C" style={GlobalStyles.icon} onPress={() => setDisabledConfirmPassword(!disabledConfirmPassword)} />
      </View>

      {/* Botón de Registro */}
      <TouchableOpacity style={GlobalStyles.button} onPress={handleRegister}>
        <MaterialCommunityIcons name="book-edit" size={24} color="#FFF" style={GlobalStyles.icon} onPress={() => setDisabledConfirmPassword(!disabledConfirmPassword)} />
        <Text style={GlobalStyles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD", // Fondo blanco puro
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
    color: "#2E7D32", // Verde principal
  },
  ai: {
    color: "#388E3C", // Verde secundario
  },
  iconLogo: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32", // Verde principal
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0", // Gris claro
    borderRadius: 50,
    padding: 15,
    width: "85%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#388E3C", // Verde secundario
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#1B5E20", // Verde oscuro para texto
    fontSize: 20,
  },
  button: {
    backgroundColor: "#2E7D32", // Verde principal sólido
    borderRadius: 50,
    paddingVertical: 15,
    width: "60%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  logo: {
    width: 120,  // Ajusta el ancho según tu preferencia
    height: 120, // Ajusta la altura según tu preferencia
    resizeMode: "contain", // Mantiene la proporción de la imagen
    marginBottom: 10, // Espacio debajo del logo
  },
});

export default RegisterScreen;
