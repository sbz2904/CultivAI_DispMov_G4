import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api"; // ✅ Usa api.js para las peticiones al backend

const ProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userId } = route.params;
  const [userData, setUserData] = useState({});
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);
      setNewName(response.data.nombre);
      setProfileImage(response.data.profileImage || null);
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener los datos del usuario.");
    }
  };

  // ✅ Actualizar datos del usuario
  const handleUpdate = async () => {
    try {
      const updatedData = {
        nombre: newName,
        profileImage: profileImage || userData.profileImage, // Mantiene la imagen previa si no se cambia
      };

      await api.put(`/users/${userId}`, updatedData); // ✅ Usa api.js para actualizar

      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setIsEditing(false); // Bloquear campos después de guardar
      fetchUserData(); // Recargar datos actualizados
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

  // ✅ Seleccionar imagen de perfil
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // ✅ Cerrar sesión
  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: () => navigation.navigate("Login") },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Imagen de Perfil */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require("../../assets/icon.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Nombre del usuario */}
      <Text style={styles.greeting}>Hola, {userData.nombre || "Usuario"}</Text>

      {/* Campos de Nombre y Correo */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={newName}
        onChangeText={setNewName}
        editable={isEditing} // Solo editable cuando se presiona "Actualizar Perfil"
      />

      <Text style={styles.label}>Correo Electrónico</Text>
      <TextInput style={styles.input} value={userData.email} editable={false} />

      {/* Botón de Actualizar Perfil */}
      {!isEditing ? (
        <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Actualizar Perfil</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      )}

      {/* Botón de Cerrar Sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#6AF84D",
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#F0EDED",
    borderRadius: 50,
    padding: 15,
    width: "85%",
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  button: {
    backgroundColor: "#6AF84D",
    borderRadius: 50,
    paddingVertical: 15,
    width: "85%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF4D4D",
    borderRadius: 50,
    paddingVertical: 15,
    width: "85%",
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
