import { db } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

const storage = getStorage();

// 🔹 Obtener los detalles de un sembrío
export const getSembrioDetails = async (userId, sembrioId) => {
  try {
    const sembrioRef = doc(db, "usuarios", userId, "sembríos", sembrioId);
    const docSnap = await getDoc(sembrioRef);

    if (!docSnap.exists()) {
      console.warn("Sembrío no encontrado, devolviendo valores por defecto.");
      return { imagenes: [], notas: [] };
    }

    const data = docSnap.data();
    return {
      imagenes: Array.isArray(data.imagenes) ? data.imagenes : [],
      notas: Array.isArray(data.notas) ? data.notas : [],
    };
  } catch (error) {
    console.error("Error al obtener detalles del sembrío:", error);
    throw error;
  }
};

// 🔹 Subir imagen a Firebase Storage y obtener la URL
export const uploadImage = async (userId, sembrioId, imageUri) => {
  try {
    if (!imageUri) throw new Error("URI de la imagen no válida.");

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const imageRef = ref(storage, `usuarios/${userId}/sembríos/${sembrioId}/${Date.now()}.jpg`);
    await uploadBytes(imageRef, blob);

    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};

// 🔹 Guardar URL de imagen en Firestore
export const saveImageToFirestore = async (userId, sembrioId, imageUrl) => {
  try {
    const sembrioRef = doc(db, "usuarios", userId, "sembríos", sembrioId);
    await updateDoc(sembrioRef, { imagenes: arrayUnion(imageUrl) });
  } catch (error) {
    console.error("Error al guardar imagen en Firestore:", error);
    throw error;
  }
};

// 🔹 Eliminar imagen de Firestore y Storage
export const deleteImage = async (userId, sembrioId, imageUrl) => {
  try {
    const sembrioRef = doc(db, "usuarios", userId, "sembríos", sembrioId);
    await updateDoc(sembrioRef, { imagenes: arrayRemove(imageUrl) });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    throw error;
  }
};

// 🔹 Guardar una nota en Firestore
export const saveNote = async (userId, sembrioId, noteContent) => {
  try {
    const sembrioRef = doc(db, "usuarios", userId, "sembríos", sembrioId);
    await updateDoc(sembrioRef, {
      notas: arrayUnion({
        id: Date.now().toString(),
        content: noteContent,
        timestamp: new Date().toLocaleString(),
      }),
    });
  } catch (error) {
    console.error("Error al guardar la nota:", error);
    throw error;
  }
};

// 🔹 Eliminar una nota de Firestore
export const deleteNote = async (userId, sembrioId, noteId) => {
  try {
    const sembrioRef = doc(db, "usuarios", userId, "sembríos", sembrioId);
    const sembrioSnap = await getDoc(sembrioRef);

    if (!sembrioSnap.exists()) {
      return;
    }

    const notasActualizadas = sembrioSnap.data().notas.filter((note) => note.id !== noteId);
    await updateDoc(sembrioRef, { notas: notasActualizadas });
  } catch (error) {
    console.error("Error al eliminar la nota:", error);
    throw error;
  }
};
