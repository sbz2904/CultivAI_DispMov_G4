import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Logo from "../../assets/LogoCultivAI.png";
import api from "../services/api";
import { Image } from "react-native";
import { GlobalStyles } from "../styles/GlobalStyles";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [disabledPassword, setDisabledPassword] = useState(true);
  const [disabledConfirmPassword, setDisabledConfirmPassword] = useState(true);

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
    if (password.length < 6) {
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          <Image source={Logo} style={styles.logo} />

          <Text style={GlobalStyles.title}>Crear Cuenta</Text>

          <View style={GlobalStyles.inputContainer}>
            <Ionicons name="person-outline" size={24} color="#02974A" style={GlobalStyles.icon} />
            <TextInput
              style={GlobalStyles.input}
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              placeholderTextColor="#02974A"
            />
          </View>

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
            <Ionicons
              name={disabledPassword ? "eye" : "eye-off"}
              size={24}
              color="#02974A"
              style={GlobalStyles.icon}
              onPress={() => setDisabledPassword(!disabledPassword)}
            />
          </View>

          <View style={GlobalStyles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#02974A" style={GlobalStyles.icon} />
            <TextInput
              style={GlobalStyles.input}
              placeholder="Repetir Contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={disabledConfirmPassword}
              placeholderTextColor="#02974A"
            />
            <Ionicons
              name={disabledConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color="#02974A"
              style={GlobalStyles.icon}
              onPress={() => setDisabledConfirmPassword(!disabledConfirmPassword)}
            />
          </View>

          <TouchableOpacity style={GlobalStyles.button} onPress={handleRegister}>
            <MaterialCommunityIcons name="book-edit" size={24} color="#FFF" style={GlobalStyles.icon} />
            <Text style={GlobalStyles.buttonText}>Registrarse</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  logo: { width: 220, height: 220, resizeMode: "contain", marginBottom: 10 },
});

export default RegisterScreen;
