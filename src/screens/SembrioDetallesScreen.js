import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Button,
} from 'react-native';
import api from '../services/api'; // ✅ Conexión con el backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const SembrioDetallesScreen = ({ route }) => {
  const { userId, sembríoId, sembríoNombre, sembríoDetalles, sembríoExtras } = route.params;
  const [images, setImages] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    fetchNotes();
    fetchImages();
  }, [sembríoId, userId]);

  // ✅ Obtener notas del backend
  const fetchNotes = async () => {
    try {
      const response = await api.get(`/sembrios/${sembríoId}/notas/${userId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error al obtener notas:', error);
    }
  };

  // ✅ Obtener imágenes del backend
  const fetchImages = async () => {
    try {
      const response = await api.get(`/sembrios/${sembríoId}/imagenes/${userId}`);
      console.log("Imágenes recibidas:", response.data); // Verificar en consola
  
      setImages(response.data.map(img => ({ uri: img.url, file_id: img.file_id })));
    } catch (error) {
      console.error("Error al obtener imágenes:", error);
    }
  };

  // ✅ Subir una imagen
  const pickImage = async (fromCamera) => {
    let result;
    if (fromCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
    }

    if (!result.canceled && result.assets?.length > 0) {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });

      try {
        await api.post(`/sembrios/${sembríoId}/imagenes/${userId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        fetchImages();
      } catch (error) {
        console.error('Error al subir imagen:', error);
      }
    }
  };

  // ✅ Agregar una nueva nota
  const addNote = async () => {
    if (newNote.trim()) {
      try {
        await api.post(`/sembrios/${sembríoId}/notas/${userId}`, { content: newNote });
        fetchNotes();
        setNewNote('');
      } catch (error) {
        console.error('Error al agregar nota:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{sembríoNombre}</Text>
      <Text style={styles.details}>{sembríoDetalles || 'No hay detalles disponibles.'}</Text>

      {/* Notas */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Notas:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe una nota..."
          multiline={true}
          value={newNote}
          onChangeText={setNewNote}
        />
        <Button title="Añadir Nota" onPress={addNote} />
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Text style={styles.noteText}>{item.content}</Text>
          )}
        />
      </View>

      {/* Imágenes */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Imágenes:</Text>
        <Button title="Subir Imagen" onPress={() => pickImage(false)} />
        <FlatList
          data={images}
          horizontal
          keyExtractor={(item) => item.file_id}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAFFFA' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  details: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  section: { marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold' },
  textInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  noteText: { fontSize: 16, padding: 5, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  image: { width: 100, height: 100, margin: 5, borderRadius: 10 },
});

export default SembrioDetallesScreen;
