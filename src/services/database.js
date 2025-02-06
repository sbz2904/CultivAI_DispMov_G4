import * as SQLite from "expo-sqlite";

// Inicializa la base de datos
const db = SQLite.openDatabase("cultivai.db");

// Función para inicializar tablas
export const initializeDatabase = () => {
  db.transaction((tx) => {
    // Crear tabla de usuarios
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS usuarios (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         nombre TEXT NOT NULL,
         email TEXT UNIQUE NOT NULL,
         password TEXT NOT NULL
       );`
    );

    // Crear tabla de sembríos
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS sembríos (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         nombre TEXT NOT NULL
       );`
    );

    // Crear tabla de relación entre usuario y sembríos
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS usuario_sembríos (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         usuario_id INTEGER NOT NULL,
         sembrío_id INTEGER NOT NULL,
         FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
         FOREIGN KEY (sembrío_id) REFERENCES sembríos(id)
       );`
    );
  });
};

export default db;
