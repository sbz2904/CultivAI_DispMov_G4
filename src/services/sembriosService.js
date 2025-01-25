import { collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Agregar un nuevo sembrío
export const addSembrío = async (sembrío) => {
  try {
    const docRef = await addDoc(collection(db, "sembríos"), sembrío);
    return docRef.id;
  } catch (error) {
    console.error("Error al agregar sembrío:", error);
    throw error;
  }
};

// Obtener todos los sembríos
export const getAllSembríos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "sembríos"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener sembríos:", error);
    throw error;
  }
};

// Asociar sembríos con un usuario
export const saveUserSembríos = async (userId, sembríosIds) => {
  try {
    const docRef = doc(db, "usuarios", userId);
    await updateDoc(docRef, { sembríos: sembríosIds });
    console.log("Sembríos guardados correctamente para el usuario");
  } catch (error) {
    console.error("Error al guardar sembríos del usuario:", error);
    throw error;
  }
};

export const getSembríoById = async (id) => {
  try {
    const docRef = doc(db, "sembríos", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data(); // Retorna los datos del sembrío, incluido el ícono
    } else {
      throw new Error("Sembrío no encontrado");
    }
  } catch (error) {
    console.error("Error al obtener el sembrío:", error);
    throw error;
  }
};

// Obtener sembríos de un usuario
export const getUserSembríos = async (userId) => {
  try {
    const userDoc = await getUserById(userId);
    return userDoc.sembríos || [];
  } catch (error) {
    console.error("Error al obtener sembríos del usuario:", error);
    throw error;
  }
};
