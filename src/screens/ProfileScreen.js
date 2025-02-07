import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, Button, Alert } from "react-native";
import { getUserById, updateUser } from "../services/userService";

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState({});
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await getUserById(userId);
      setUserData(user);
      setNewName(user.nombre);
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateUser(userId, { nombre: newName });
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      fetchUserData();
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={newName}
        onChangeText={setNewName}
      />
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{userData.email}</Text>
      <Button title="Actualizar Nombre" onPress={handleUpdate} />
      <Button
        title="Seleccionar Sembríos"
        onPress={() => navigation.navigate("SelectSembríos", { userId })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: 'center',
    color: "#343a40",
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
     color: "#555",
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  inputContainer: { // Estilo para el contenedor del input
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10, // Margen superior para separar del indicador de carga
  },
  buttonMargin: { // Estilo para el espacio entre botones
    marginTop: 10,
  },
});

export default ProfileScreen;
