import api from "./api";

export const getAllSembríos = async () => {
  try {
    const response = await api.get("/sembrios");
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener sembríos");
  }
};

export const getSembríoById = async (sembrioId) => {
  try {
    const response = await api.get(`/sembrios/${sembrioId}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener el sembrío");
  }
};

export const saveUserSembríos = async (userId, sembríosIds) => {
  try {
    const response = await api.put(`/sembrios/users/${userId}/sembrios`, { sembrios: sembríosIds });
    return response.data;
  } catch (error) {
    throw new Error("Error al guardar los sembríos del usuario");
  }
};
