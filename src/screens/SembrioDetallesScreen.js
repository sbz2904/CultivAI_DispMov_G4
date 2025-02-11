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
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SembrioDetallesScreen = ({ route }) => {
  const { userId, sembríoId, sembríoNombre, sembríoDetalles } = route.params;
  const [images, setImages] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [modalNoteVisible, setModalNoteVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [loading, setLoading] = useState(false);

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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
    if (status !== 'granted') {
      alert('Se necesita permiso para acceder a la cámara.');
      return;
    }
  
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

  const askChatbot = async () => {
    if (!userMessage.trim()) return;
    setLoading(true);
    setChatResponse('');
    
    try {
      const context = `El usuario tiene un sembrío de ${sembríoNombre}. Estas son sus notas previas: ${notes.map(n => n.content).join(" | ")}. Responde solo sobre este cultivo y brinda información relevante de manera breve.`;
      const prompt = `${context} Pregunta del usuario: ${userMessage}`;
      const result = await model.generateContent(prompt);
      const botResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No se encontró respuesta.";
      setChatResponse(botResponse.replace(/\*/g, '').trim());
    } catch (error) {
      setChatResponse("Error al obtener respuesta.");
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (fileId) => {
    try {
      await api.delete(`/sembrios/imagenes/${fileId}/${userId}/${sembríoId}`);
      fetchImages(); // Recargar las imágenes después de eliminar
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/sembrios/${sembríoId}/notas/${userId}/${noteId}`);
      fetchNotes(); // Recargar notas después de eliminar
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

    const updateNote = async (noteId, newContent) => {
    try {
      await api.put(`/sembrios/${sembríoId}/notas/${userId}/${noteId}`, { content: newContent });
      fetchNotes(); // Recargar notas después de actualizar
    } catch (error) {
      console.error('Error al actualizar nota:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
      <Text style={styles.title}>{String(sembríoNombre)}</Text>

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
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteImage(item.file_id)}>
                  <Ionicons name="trash" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Botones de subir imágenes y tomar fotos */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
            <MaterialCommunityIcons name="folder-upload" size={30} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={30} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setChatModalVisible(true)}>
            <Ionicons name="chatbubble-ellipses" size={30} color="#FFF" />
          </TouchableOpacity>
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
    <View key={note._id} style={styles.noteBox}>
      <TouchableOpacity
        style={styles.noteContent}
        onPress={() => {
          setSelectedNote(note.content);
          setModalNoteVisible(true);
        }}
      >
        <Text style={styles.noteText} numberOfLines={1} ellipsizeMode="tail">
          {note.content}
        </Text>
      </TouchableOpacity>

      {/* Botones de eliminar y actualizar */}
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => deleteNote(note._id)} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  ))}
</View>

      

      {/* Modal para mostrar imagen en pantalla completa */}
      <Modal visible={modalImageVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalImageVisible(false)}>
            <Ionicons name="close" size={30} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
      </ScrollView>

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

      {/* Modal del chatbot */}
      <Modal visible={chatModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.chatBox}>
            <TouchableOpacity style={styles.closeIcon} onPress={() => setChatModalVisible(false)}>
              <Ionicons name="close" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Chatbot de {sembríoNombre}</Text>
            <TextInput style={styles.chatInput} placeholder="Escribe tu pregunta..." value={userMessage} onChangeText={setUserMessage} />
            <TouchableOpacity style={styles.sendButton} onPress={askChatbot}>
              <Ionicons name="send" size={24} color="#FFF" />
            </TouchableOpacity>
            {loading ? <Text style={styles.loadingText}>Cargando respuesta...</Text> : null}
            {chatResponse ? <Text style={styles.chatResponse}>{String(chatResponse)}</Text> : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#FDFDFD' },
  container: { flex: 1, backgroundColor: '#FDFDFD', padding: 20 },

  chatButton: { backgroundColor: '#0EB93F', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  chatButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  chatBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, width: '90%', alignItems: 'center' },
  chatTitle: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginBottom: 10 },
  chatInput: { width: '100%', borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, padding: 10, marginBottom: 10 },
  sendButton: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 10, alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#2E7D32', marginVertical: 10 },
  chatResponse: { fontSize: 16, color: '#1B5E20', textAlign: 'center', marginVertical: 10 },
  closeButton: { backgroundColor: '#0EB93F', padding: 10, borderRadius: 10, marginTop: 10 },
  closeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '90%', height: '70%', borderRadius: 10 },
  closeButton: { position: 'absolute', top: 40, right: 20 },

  noteModal: { backgroundColor: '#E8F5E9', padding: 20, borderRadius: 10, width: '80%', alignItems: 'center' },
  noteModalText: { fontSize: 16, color: '#02974A', textAlign: 'center' },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#02974A',
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
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#02974A', marginBottom: 10 },
  details: { fontSize: 16, textAlign: 'center', color: '#1B5E20', marginBottom: 20 },
  imageContainer: { marginRight: 10, borderRadius: 10, overflow: 'hidden' }
  ,
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 10,
  },
  image: { width: 300, height: 200, borderRadius: 10 },

  buttonContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  iconButton: {
    backgroundColor: '#0EB93F',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  buttonLabel: { textAlign: 'center', color: '#0EB93F', fontSize: 14, marginTop: 5 },

  notesSection: { marginTop: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#02974A', marginBottom: 10 },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#0EB93F',
    marginBottom: 15,
  },
  noteInput: { flex: 1, fontSize: 16, color: '#1B5E20' },
  addButton: {
    backgroundColor: '#0EB93F',
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
  noteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
    borderRadius: 5,
  },
});

export default SembrioDetallesScreen;
