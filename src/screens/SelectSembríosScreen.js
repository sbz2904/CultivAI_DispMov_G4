import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, Button, TouchableOpacity, Alert } from "react-native";
import { getAllSembríos, saveUserSembríos } from "../services/sembriosService";
import { getUserById } from "../services/userService";

const SelectSembríosScreen = ({ route }) => {
  const { userId } = route.params; // Recibir userId
  const [sembríos, setSembríos] = useState([]);
  const [selectedSembríos, setSelectedSembríos] = useState([]);

  useEffect(() => {
    fetchSembríos();
    fetchUserSembríos();
  }, []);

  const fetchSembríos = async () => {
    try {
      const data = await getAllSembríos();
      setSembríos(data);
    } catch (error) {
      console.error("Error al obtener sembríos:", error);
    }
  };

  const fetchUserSembríos = async () => {
    try {
      const user = await getUserById(userId); // Llama a la función de userService.js
      setSelectedSembríos(user.sembríos || []); // Usa el campo "sembríos" del usuario
    } catch (error) {
      console.error("Error al obtener los sembríos del usuario:", error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedSembríos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const saveSelection = async () => {
    try {
      await saveUserSembríos(userId, selectedSembríos);
      Alert.alert("Éxito", "Sembríos guardados correctamente");
    } catch (error) {
      console.error("Error al guardar los sembríos:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tus Sembríos</Text>
      <FlatList
        data={sembríos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.item,
              selectedSembríos.includes(item.id) && styles.selectedItem,
            ]}
            onPress={() => toggleSelect(item.id)}
          >
            <Text>{item.nombre}</Text>
          </TouchableOpacity>
        )}
      />
      <Button title="Guardar Selección" onPress={saveSelection} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedItem: {
    backgroundColor: "#cde",
  },
});

export default SelectSembríosScreen;
