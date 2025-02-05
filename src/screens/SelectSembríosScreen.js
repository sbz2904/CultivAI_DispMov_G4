import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView } from "react-native";
import { Picker } from "@react-native-picker/picker"; // ✅ Nuevo selector de categorías
import api from "../services/api"; // Usa api.js para conectar con el backend
import { Ionicons } from "@expo/vector-icons";

const SelectSembríosScreen = ({ route }) => {
  const { userId } = route.params;
  const [sembríos, setSembríos] = useState([]);
  const [filteredSembríos, setFilteredSembríos] = useState([]);
  const [selectedSembríos, setSelectedSembríos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [categories, setCategories] = useState(["Todas"]);

  useEffect(() => {
    fetchSembríos();
    fetchUserSembríos();
  }, []);

  const fetchSembríos = async () => {
    try {
      const response = await api.get("/sembrios");
      setSembríos(response.data);
      setFilteredSembríos(response.data);

      // Extraer categorías únicas
      const uniqueCategories = ["Todas", ...new Set(response.data.map((item) => item.categoria))];
      setCategories(uniqueCategories);
    } catch (error) {
      alert("Error al obtener los sembríos.");
    }
  };

  const fetchUserSembríos = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setSelectedSembríos(response.data.sembrios || []);
    } catch (error) {
      alert("Error al obtener los sembríos del usuario.");
    }
  };

  const toggleSelect = (id) => {
    setSelectedSembríos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const saveSelection = async () => {
    try {
      await api.put(`/sembrios/users/${userId}/sembrios`, { sembrios: selectedSembríos });
      alert("Sembríos guardados correctamente.");
    } catch (error) {
      alert("Error al guardar la selección.");
    }
  };

  const filterSembríos = (text, category) => {
    let filtered = sembríos;

    if (category && category !== "Todas") {
      filtered = filtered.filter((item) => item.categoria === category);
    }

    if (text) {
      filtered = filtered.filter((item) => item.nombre.toLowerCase().includes(text.toLowerCase()));
    }

    setFilteredSembríos(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterSembríos(text, selectedCategory);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterSembríos(searchQuery, category);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona tus Sembríos</Text>
  
        {/* Barra de búsqueda */}
        <TextInput
          style={styles.searchBar}
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
  
        {/* Selector de categoría (Dropdown) */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => handleCategoryChange(itemValue)}
            style={styles.picker}
          >
            {categories.map((category, index) => (
              <Picker.Item key={index} label={category} value={category} />
            ))}
          </Picker>
        </View>
  
        {/* Lista de Sembríos */}
        <FlatList
          data={filteredSembríos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.listItem, selectedSembríos.includes(item._id) && styles.selectedItem]}
              onPress={() => toggleSelect(item._id)}
            >
              <Image source={{ uri: item.icon }} style={styles.listImage} />
              <View style={styles.listTextContainer}>
                <Text style={styles.listTitle}>{item.nombre}</Text>
                <Text style={styles.listCategory}>{item.categoria}</Text>
              </View>
              {selectedSembríos.includes(item._id) && (
                <Ionicons name="checkmark-circle" size={24} color="#6AF84D" />
              )}
            </TouchableOpacity>
          )}
        />
  
        {/* Botón de Guardar (fijo en la parte inferior) */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSelection}>
            <Text style={styles.saveButtonText}>Guardar Selección</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAFFFA" },
  container: { flex: 1, padding: 20, backgroundColor: "#FAFFFA" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 15, marginTop: 20 },
  searchBar: {
    backgroundColor: "#F0EDED",
    borderRadius: 25,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#F0EDED",
    borderRadius: 25,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  picker: {
    height: 50,
    color: "#333",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  selectedItem: {
    borderColor: "#6AF84D",
    borderWidth: 2,
  },
  listImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listCategory: {
    fontSize: 14,
    color: "#777",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
  },
  saveButton: {
    backgroundColor: "#6AF84D",
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
});

export default SelectSembríosScreen;
