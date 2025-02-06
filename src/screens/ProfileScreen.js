import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"; // Iconos de Expo Icons
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

  const handleUpdate = async () => {
    try {
      const updatedData = {
        nombre: newName,
        profileImage: profileImage || userData.profileImage,
      };

      await api.put(`/users/${userId}`, updatedData);
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    }
  };

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

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar Sesión", onPress: () => navigation.navigate("Login") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logoText}>
        <Text style={styles.cultiv}>Cultiv-</Text>
        <Text style={styles.ai}>AI</Text>
      </Text>

      {/* Imagen de Perfil */}
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require("../../assets/icon.png")}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <Text style={styles.title}>Mi Perfil</Text>

      {/* Campo de Nombre */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="account-outline" size={24} color="#388E3C" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={newName}
          onChangeText={setNewName}
          editable={isEditing}
          placeholder="Nombre"
          placeholderTextColor="#1B5E20"
        />
      </View>

      {/* Campo de Correo */}
      <View style={styles.inputContainer}>
        <MaterialCommunityIcons name="email-outline" size={24} color="#388E3C" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={userData.email}
          editable={false}
          placeholder="Correo Electrónico"
          placeholderTextColor="#1B5E20"
        />
      </View>

      {/* Botón de Actualizar */}
      {!isEditing ? (
        <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#388E3C",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 50,
    padding: 15,
    width: "85%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#388E3C",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#1B5E20",
    fontSize: 18,
  },
  button: {
    backgroundColor: "#2E7D32",
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
  logoutButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 50,
    paddingVertical: 15,
    width: "60%",
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
