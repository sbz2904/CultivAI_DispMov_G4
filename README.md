# CultivAI_DispMov_G4 🌿

CultivAI es una aplicación diseñada para optimizar la gestión de cultivos mediante el uso de inteligencia artificial. Nuestro objetivo es proporcionar herramientas inteligentes que ayuden a los agricultores a mejorar la productividad y la sostenibilidad de sus cultivos.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)
![Python](https://img.shields.io/badge/Python-3.x-blue?style=for-the-badge&logo=python)
![React Native](https://img.shields.io/badge/React%20Native-0.72-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen?style=for-the-badge&logo=mongodb)
![Flask](https://img.shields.io/badge/Flask-2.2-black?style=for-the-badge&logo=flask)

---

## 📖 Descripción

Desarrollado con *Flask* para el backend y *React Native* para el frontend. Proporciona una solución para:
- *Seguimiento de condiciones ambientales de cultivos.*
- *Recomendaciones inteligentes basadas en IA para el cuidado de cultivos.*
- *Interfaz optimizada para dispositivos móviles.*

---

## ⚙️ Configuración inicial

### 🛠️ Requisitos previos
- *Python 3.x*
- *Flask 2.2 o superior*
- *MongoDB 6.x*
- *Node.js 18 o superior*
- *NPM 8.x*

---

### 🌐 Configuración del backend

1. Instala las dependencias necesarias:

   
   pip install -r requirements.txt
   

2. Configura la base de datos en config.py:

   python
   MONGO_URI = "mongodb://tu_ip:27017"
   

3. Ejecuta el backend:

   
   python app.py
   

El backend estará disponible en http://localhost:5000/api.

---

### 💻 Configuración del frontend

1. Navega al directorio del frontend:

   
   cd frontend
   

2. Instala las dependencias:

   
   npm install
   

3. Inicia el servidor de desarrollo:

   
   npm start
   

El frontend estará disponible en http://localhost:8081.

---

## 🌿 Funcionalidades

### Backend 🌐

1. *Obtener datos ambientales del cultivo*  
   *GET /data*  
   Parámetros: fecha, ubicación  

2. *Obtener recomendaciones personalizadas*  
   *GET /recommendations*  
   Parámetro: tipoCultivo

3. *Enviar datos ambientales al sistema*  
   *POST /data*  
   Body: { temperatura, humedad, phSuelo }

---

### Frontend 📱

- *Monitoreo en tiempo real* de condiciones ambientales.
- *Interfaz intuitiva* y optimizada para móviles.
- *Integración con IA* para recomendaciones automatizadas.

---

## 💻 Ejemplo de ejecución

1. Clona el repositorio:


   git clone https://github.com/sbz2904/CultivAI_DispMov_G4_Frontend.git
   cd CultivAI_DispMov_G4
   

2. Configura y ejecuta el backend y frontend siguiendo las instrucciones anteriores.

---

## 👥 Contribuyentes

- *Sebastian Baquero*
- *Hallen Lluglla*
- *Lenin Peñeherrera*
- *Evelyn Tito*

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama:

   
   git checkout -b feature/nueva-funcionalidad
   

3. Realiza tus cambios y haz commit:

   
   git commit -m "Agrega nueva funcionalidad"
   

4. Envía un pull request.

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

## 📬 Contacto

¿Tienes preguntas o sugerencias? Contáctanos en: 🌐 [GitHub Repository](https://github.com/sbz2904/CultivAI_DispMov_G4_Frontend)

## Figma
https://www.figma.com/proto/mff5cJUScCrBTeSXvUB5Ay/Untitled?node-id=27-12&t=GdL4gLWdaNNTtrPM-1
