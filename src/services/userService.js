import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

// Crear un nuevo usuario
export const createUser = async (user) => {
  try {
    const docRef = await addDoc(collection(db, "usuarios"), user);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, "usuarios", userId); // Accede al documento en la colección "usuarios"
    const docSnap = await getDoc(docRef); // Obtiene el documento

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }; // Devuelve los datos del usuario
    } else {
      throw new Error("Usuario no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    throw error;
  }
};

// Actualizar un usuario
export const updateUser = async (userId, updatedData) => {
  try {
    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, updatedData);
    console.log("Usuario actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};
