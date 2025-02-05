import axios from "axios";

const API_BASE_URL = "http://192.168.100.2:5000/api"; // Reemplaza con la IP de tu backend si es necesario

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
