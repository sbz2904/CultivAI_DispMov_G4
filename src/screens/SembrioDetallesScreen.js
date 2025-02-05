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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const SembríoDetallesScreen = ({ route }) => {
  const { sembríoNombre, sembríoDetalles, sembríoExtras } = route.params;
  const [images, setImages] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [updates, setUpdates] = useState([]);

  const STORAGE_KEY = `sembrío-${sembríoNombre}`;

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const { savedImages, savedNotes, savedUpdates } = JSON.parse(storedData);
          setImages(savedImages || []);
          setNotes(savedNotes || []);
          setUpdates(savedUpdates || []);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    loadData();
  }, []);

  // Guardar datos al cambiar estado
  useEffect(() => {
    const saveData = async () => {
      try {
        const dataToSave = {
          savedImages: images,
          savedNotes: notes,
          savedUpdates: updates,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error al guardar datos:', error);
      }
    };

    saveData();
  }, [images, notes, updates]);

  // Seleccionar imagen
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
      setImages((prev) => [...prev, result.assets[0].uri]);
      addUpdate('Imagen añadida');
    }
  };

  // Eliminar imagen
  const deleteImage = (uri) => {
    setImages((prev) => prev.filter((image) => image !== uri));
    addUpdate('Imagen eliminada');
  };

  // Agregar nota
  const addNote = () => {
    if (newNote.trim()) {
      const note = { id: Date.now().toString(), content: newNote };
      setNotes((prev) => [...prev, note]);
      addUpdate('Nota añadida');
      setNewNote('');
    } else {
      alert('Por favor escribe una nota antes de añadir.');
    }
  };

  // Eliminar nota
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    addUpdate('Nota eliminada');
  };

  // Agregar evento al historial (máximo 8 actualizaciones)
  const addUpdate = (action) => {
    const timestamp = new Date().toLocaleString();
    setUpdates((prev) => {
      const newUpdates = [...prev, { action, timestamp }];
      return newUpdates.slice(-8); // Limitar a 8 actualizaciones
    });
  };

  // Limpiar el historial
  const clearUpdates = () => {
    setUpdates([]);
    alert('Historial de actualizaciones limpiado.');
  };

  const renderContent = () => [
    { type: 'header', key: 'header' },
    { type: 'images', key: 'images' },
    { type: 'notes', key: 'notes' },
    { type: 'updates', key: 'updates' },
  ];

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.section}>
            <Text style={styles.title}>{sembríoNombre}</Text>
            <Text style={styles.details}>{sembríoDetalles || 'No hay detalles disponibles.'}</Text>
            {sembríoExtras && (
              <View style={styles.extrasContainer}>
                <Text style={styles.subtitle}>Datos del Sembrío:</Text>
                <Text style={styles.text}>Clima Ideal: {sembríoExtras.climaIdeal}</Text>
                <Text style={styles.text}>Cantidad de Agua: {sembríoExtras.cantidadAgua}</Text>
                <Text style={styles.text}>Rendimiento Esperado: {sembríoExtras.rendimiento}</Text>
              </View>
            )}
          </View>
        );
      case 'images':
        return (
          <View style={styles.section}>
            {images.length > 0 ? (
              <FlatList
                data={images}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteImage(item)}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.text}>No hay imágenes disponibles.</Text>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={() => pickImage(false)}>
                <Text style={styles.buttonText}>Subir desde Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => pickImage(true)}>
                <Text style={styles.buttonText}>Tomar Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'notes':
        return (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Notas del Usuario:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe una nota..."
              multiline={true}
              value={newNote}
              onChangeText={setNewNote}
            />
            <Button title="Añadir Nota" onPress={addNote} />
            {notes.length > 0 && (
              <FlatList
                data={notes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteText}>{item.content}</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteNote(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        );
      case 'updates':
        return (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Historial de Actualizaciones:</Text>
            {updates.length > 0 ? (
              <FlatList
                data={updates}
                renderItem={({ item }) => (
                  <Text style={styles.historyText}>
                    {item.action} - {item.timestamp}
                  </Text>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
              <Text style={styles.text}>No hay actualizaciones registradas.</Text>
            )}
            <TouchableOpacity style={styles.clearButton} onPress={clearUpdates}>
              <Text style={styles.clearButtonText}>Limpiar Historial</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={renderContent()}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.flatListContent}
    />
  );
};

const styles = StyleSheet.create({
  flatListContent: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  extrasContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#e6f7ff',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 10,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  noteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  noteText: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  historyText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
});

export default SembríoDetallesScreen;
