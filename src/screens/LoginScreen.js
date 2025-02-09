import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAllUsers } from "../services/userService";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import Logo from "../../assets/LogoCultivAI.png";
import { Image } from "react-native";

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const { setUserId } = useUser();
  const [password, setPassword] = useState("");

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
        setUserId(user._id);
        navigation.replace("Main"); 
      } else {
        Alert.alert("Error", "Correo o contraseña incorrectos");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.logoText}>
        <Text style={styles.cultiv}>Cultiv-</Text>
        <Text style={styles.ai}>AI</Text>
      </Text>

      <Text style={styles.title}>Iniciar Sesión</Text>

      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="#388E3C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#1B5E20"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#388E3C" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#1B5E20"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        No tienes una cuenta?{" "}
        <Text style={styles.link} onPress={() => navigation.navigate("Register")}>
          Haz click aquí
        </Text>
      </Text>
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
    color: "#2E7D32", // Verde natural principal
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
    backgroundColor: "#F0F0F0", // Gris claro para input
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
  footerText: {
    fontSize: 16,
    color: "#000",
  },
  link: {
    color: "#388E3C", // Verde secundario para resaltar
    fontWeight: "bold",
  },
  logo: {
    width: 120,  // Ajusta el ancho según tu preferencia
    height: 120, // Ajusta la altura según tu preferencia
    resizeMode: "contain", // Mantiene la proporción de la imagen
    marginBottom: 10, // Espacio debajo del logo
  },
});

export default LoginScreen;
