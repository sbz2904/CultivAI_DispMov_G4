import api from "./api";

export const createUser = async (userData) => {
  try {
    const response = await api.post("/users/", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al crear usuario");
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al obtener usuario");
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users/");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al obtener usuarios");
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const response = await api.put(`/users/${userId}/`, updatedData); 
    return response.data;
  } catch (error) {
    console.error("Error al actualizar usuario:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "No se pudo actualizar el usuario");
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al iniciar sesión");
  }
};
