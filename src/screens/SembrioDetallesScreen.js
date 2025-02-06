import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import api from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const SembrioDetallesScreen = ({ route }) => {
  const { userId, sembríoId, sembríoNombre, sembríoDetalles } = route.params;
  const [images, setImages] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [modalNoteVisible, setModalNoteVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetchNotes();
    fetchImages();
  }, [sembríoId, userId]);

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/sembrios/${sembríoId}/notas/${userId}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await api.get(`/sembrios/${sembríoId}/imagenes/${userId}`);
      setImages(response.data.map(img => ({ uri: img.url, file_id: img.file_id })));
    } catch (error) {
      console.error('Error al cargar imágenes:', error);
    }
  };

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
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{sembríoNombre}</Text>

        {/* Galería de imágenes */}
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.file_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setSelectedImage(item.uri); setModalImageVisible(true); }}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.uri }} style={styles.image} />
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Botones de subir imágenes y tomar fotos */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
            <MaterialCommunityIcons name="folder-upload" size={30} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Subir foto</Text>

          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={30} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Tomar foto</Text>
        </View>

        {/* Sección de notas */}
        <View style={styles.notesSection}>
          <Text style={styles.subtitle}>Notas</Text>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Escribe una nota..."
              multiline
              value={newNote}
              onChangeText={setNewNote}
            />
            <TouchableOpacity style={styles.addButton} onPress={addNote}>
              <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Lista de notas */}
          {notes.map((note) => (
            <TouchableOpacity key={note._id} style={styles.noteBox} onPress={() => { setSelectedNote(note.content); setModalNoteVisible(true); }}>
              <Text style={styles.noteText} numberOfLines={1} ellipsizeMode="tail">
                {note.content}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal para mostrar imagen en pantalla completa */}
      <Modal visible={modalImageVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalImageVisible(false)}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>

       {/* Modal para mostrar notas con diseño mejorado */}
       <Modal visible={modalNoteVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.noteModal}>
            <Text style={styles.modalTitle}>Nota</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalNoteVisible(false)}>
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <View style={styles.noteContentBox}>
              <Text style={styles.noteModalText}>{selectedNote}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FDFDFD' },
  container: { flex: 1, backgroundColor: '#FDFDFD', padding: 20 },

  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '70%', borderRadius: 10 },
  closeButton: { position: 'absolute', top: 40, right: 20 },

  noteModal: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  noteModalText: { fontSize: 16, color: '#2E7D32', textAlign: 'center' },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  noteContentBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  noteModalText: { fontSize: 16, color: '#2E7D32', textAlign: 'center' },
  safeContainer: { flex: 1, backgroundColor: '#FDFDFD' },
  container: { flex: 1, backgroundColor: '#FDFDFD', padding: 20, marginTop: Platform.OS === 'android' ? 25 : 0 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2E7D32', marginBottom: 10 },
  details: { fontSize: 16, textAlign: 'center', color: '#1B5E20', marginBottom: 20 },
  imageContainer: { marginRight: 10, borderRadius: 10, overflow: 'hidden' },
  image: { width: 300, height: 200, borderRadius: 10 },

  buttonContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  iconButton: {
    backgroundColor: '#388E3C',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  buttonLabel: { textAlign: 'center', color: '#1B5E20', fontSize: 14, marginTop: 5 },

  notesSection: { marginTop: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#388E3C',
    marginBottom: 15,
  },
  noteInput: { flex: 1, fontSize: 16, color: '#1B5E20' },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noteBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  noteText: { fontSize: 16, color: '#2E7D32' },
});

export default SembrioDetallesScreen;
