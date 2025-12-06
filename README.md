# ⭐ ReviewStar

ReviewStar es una aplicación web moderna "full-stack" diseñada para que los usuarios compartan y descubran reseñas. Construida con un backend robusto en **Node.js/Express** y un frontend responsivo en **HTML5/Tailwind CSS**, ofrece una experiencia fluida para crear, leer y gestionar reseñas.

---

## 🚀 Tecnologías Utilizadas

### Frontend
*   **HTML5**: Estructura y marcado semántico.
*   **JavaScript (ES6+)**: Lógica interactiva e integración con APIs.
*   **Tailwind CSS (v4)**: Framework CSS "utility-first" para un desarrollo de UI rápido y moderno.
*   **PostCSS & Autoprefixer**: Transformación de CSS y compatibilidad con navegadores.

### Backend
*   **Node.js**: Entorno de ejecución de JavaScript.
*   **Express.js**: Framework web rápido y minimalista para Node.js.
*   **MongoDB & Mongoose**: Base de datos NoSQL y modelado de objetos.
*   **Cloudinary**: Gestión y optimización de imágenes en la nube.
*   **JWT (JSON Web Tokens)**: Autenticación segura de usuarios.
*   **Google Auth Library**: Verificación en el backend para inicio de sesión con Google.
*   **Nodemailer**: Para el envío de correos electrónicos (ej. restablecimiento de contraseñas).

---

## ✨ Características Principales

*   **🔐 Sistema de Autenticación**: Registro seguro, inicio de sesión, recuperación de contraseña y soporte para Google Sign-In.
*   **📝 Crear y Gestionar Reseñas**: Los usuarios pueden publicar reseñas detalladas con calificaciones e imágenes.
*   **📰 Feed Interactivo**: Explora las últimas reseñas de la comunidad.
*   **👤 Perfiles de Usuario**: Personaliza los detalles del perfil y visualiza el historial personal de reseñas.
*   **🖼️ Subida de Imágenes**: Carga de imágenes fluida para perfiles y reseñas utilizando Cloudinary.
*   **📱 Diseño Responsivo**: Optimizado tanto para dispositivos de escritorio como móviles.

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto localmente.

### Requisitos Previos
*   Node.js (v18+ recomendado)
*   MongoDB (Local o Atlas)
*   Cuenta de Cloudinary (para subida de imágenes)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/JeremySG31/ReviewStar.git
cd ReviewStar
```

### 2. Configuración del Backend
Navega al directorio del backend e instala las dependencias:
```bash
cd backend
npm install
```

**Configuración (.env):**
Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:
```env
PORT=5000
MONGO_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_secreto_jwt_seguro
CLIENT_URL=http://127.0.0.1:5500/frontend

# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Configuración de Email (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Google Auth
GOOGLE_CLIENT_ID=tu_google_client_id
```

Inicia el servidor:
```bash
npm run dev
```

### 3. Configuración del Frontend
Navega al directorio del frontend:
```bash
cd ../frontend
npm install
```

Dado que este proyecto utiliza HTML5 y Tailwind CSS, puedes servir la carpeta `frontend` utilizando extensiones como **Live Server** en VS Code o cualquier servidor de archivos estáticos.

---

## 📂 Estructura del Proyecto

```
ReviewStar/
├── backend/            # Lógica del lado del servidor
│   ├── config/         # Configuraciones de BD, Cloudinary, Env
│   ├── controllers/    # Manejadores de peticiones (Auth, Reviews, etc.)
│   ├── models/         # Esquemas de Mongoose (User, Review)
│   ├── routes/         # Rutas de la API Express
│   └── server.js       # Punto de entrada
│
├── frontend/           # Interfaz del lado del cliente
│   ├── css/            # Hojas de estilo (Tailwind compilado)
│   ├── js/             # Lógica del frontend y llamadas a API
│   ├── *.html          # Páginas web (Login, Feed, Profile, etc.)
│   └── package.json    # Dependencias del frontend
│
└── README.md           # Documentación del proyecto
```

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de enviar un Pull Request.

## 📄 Licencia

Este proyecto es de código abierto.
