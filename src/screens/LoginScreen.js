import React, { useState } from "react";
import { Text, StyleSheet, View, TextInput, Alert, TouchableOpacity } from "react-native";
import { getAllUsers } from "../services/userService";
import { FontFamily, FontSize, Color, Border } from "../styles/GlobalStyles";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
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
    <View style={styles.signIn}>
      <Text style={styles.bienvenido}>Bienvenido.</Text>
      <View style={[styles.textbox, styles.textboxPosition]}>
        <TextInput
          style={styles.textfield}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor={Color.colorSilver}
        />
      </View>

      <View style={[styles.textbox, styles.textboxPosition]}>
        <TextInput
          style={styles.textfield}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Color.colorSilver}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Crear una Cuenta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  signIn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Color.colorWhite,
  },
  bienvenido: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: FontFamily.rubikBold,
    color: Color.colorGray_100,
    marginBottom: 40,
    textAlign: "center",
  },
  textbox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Color.colorGray_200,
    borderRadius: Border.br_7xs,
    backgroundColor: Color.colorWhitesmoke,
    paddingHorizontal: 10,
    marginBottom: 20,
    width: "100%",
  },
  textfield: {
    flex: 1,
    fontSize: FontSize.size_lg,
    color: Color.colorDarkslategray,
    fontFamily: FontFamily.interRegular,
    paddingVertical: 10,
  },
  icon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: Color.colorYellowgreen,
    borderRadius: Border.br_7xs,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: FontSize.size_lg,
    fontFamily: FontFamily.interBold,
    color: Color.colorWhite,
  },
  secondaryButton: {
    backgroundColor: Color.colorWhitesmoke,
    borderWidth: 1,
    borderColor: Color.colorGray_200,
  },
  secondaryButtonText: {
    color: Color.colorDarkslategray,
  },
});

export default LoginScreen;
