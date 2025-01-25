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
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});

export default ProfileScreen;
