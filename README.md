# ⭐ ReviewStar

ReviewStar es una aplicación web moderna "full-stack" diseñada para que los usuarios compartan y descubran reseñas. Construida con un backend robusto en **Node.js/Express** y un frontend responsivo en **HTML5/Tailwind CSS**, ofrece una experiencia fluida para crear, leer y gestionar reseñas.

**Demo en vivo:** [https://review-star-eight.vercel.app/](https://review-star-eight.vercel.app/)

---

## 📋 Resumen

ReviewStar permite a los usuarios registrarse, autenticarse (con email/password o Google Sign-In), crear y compartir reseñas detalladas con calificaciones e imágenes, explorar un feed comunitario, dar likes, comentar y gestionar su perfil personal.

---

## 🚀 Stack Tecnológico

### Frontend
- **HTML5** — estructura semántica
- **Tailwind CSS v4** — estilos responsivos
- **JavaScript ES6+** — lógica interactiva
- **PostCSS & Autoprefixer** — compatibilidad

### Backend
- **Node.js + Express** — servidor API REST
- **MongoDB + Mongoose** — base de datos NoSQL
- **JWT** — autenticación segura
- **Cloudinary** — almacenamiento de imágenes en la nube
- **Google Auth** — autenticación con Google
- **Nodemailer** — envío de correos (recuperación de contraseña)

---

## 📂 Estructura del Proyecto

```
ReviewStar/
├── backend/
│   ├── config/              # Configuración (BD, Cloudinary, env)
│   ├── controllers/         # Controladores (auth, reviews, efemérides)
│   ├── middleware/          # Middleware (autenticación JWT)
│   ├── models/              # Modelos Mongoose (User, Review)
│   ├── routes/              # Rutas de la API
│   ├── utils/               # Utilidades (email, validaciones)
│   ├── server.js            # Punto de entrada
│   └── package.json
│
├── frontend/
│   ├── css/                 # Estilos (Tailwind compilado)
│   ├── js/                  # Módulos JavaScript (auth, feed, reviews)
│   ├── *.html               # Páginas (index, login, register, feed, profile, etc.)
│   └── package.json
│
└── README.md
```

---

## ✨ Características

- **🔐 Autenticación segura** — registro, login, recuperación de contraseña, Google Sign-In
- **📝 CRUD de reseñas** — crear, leer, actualizar y eliminar reseñas
- **🖼️ Subida de imágenes** — integración con Cloudinary para perfiles y reseñas
- **💬 Comentarios y reacciones** — interacción comunitaria en cada reseña
- **❤️ Sistema de likes** — marca tus reseñas favoritas
- **👤 Perfiles de usuario** — personalización y historial personal
- **📱 Diseño responsivo** — optimizado para móvil, tablet y desktop
- **🌐 Feed en tiempo real** — explora reseñas de la comunidad
- **📅 Efemérides** — información de eventos del día

---

## 💾 Base de Datos

### Modelo User
- `nombre` — nombre del usuario
- `email` — único, requerido
- `password` — hash de contraseña (opcional si usa Google)
- `googleId` — ID de Google (si autenticación Google)
- `role` — 'user' o 'admin'
- `resetPasswordToken` — para recuperación de contraseña
- `timestamps` — createdAt, updatedAt

### Modelo Review
- `user` — referencia al autor (ObjectId → User)
- `title` — título de la reseña
- `description` — contenido/descripción
- `rating` — calificación (0-5)
- `category` — categoría de la reseña
- `image` — URL en Cloudinary
- `imagePublicId` — ID público en Cloudinary (para eliminación)
- `comments` — array de comentarios
- `likes` — contador de likes
- `likedBy` — array de usuarios que dieron like
- `timestamps` — createdAt, updatedAt

---

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` — registrar nuevo usuario
- `POST /login` — iniciar sesión con email/password
- `POST /google-signin` — iniciar sesión con Google
- `POST /forgot-password` — solicitar recuperación de contraseña
- `POST /reset-password/:token` — restablecer contraseña
- `GET /me` — obtener perfil del usuario autenticado (requiere JWT)

### Reseñas (`/api/reviews`)
- `GET /all` — obtener todas las reseñas (feed público)
- `POST /create` — crear nueva reseña (requiere JWT)
- `GET /my` — obtener mis reseñas (requiere JWT)
- `GET /:id` — obtener reseña por ID
- `PUT /update/:id` — actualizar reseña (requiere JWT, solo autor)
- `DELETE /delete/:id` — eliminar reseña (requiere JWT, solo autor)
- `PUT /:id/like` — dar/quitar like (requiere JWT)

### Comentarios (`/api/reviews/:reviewId/comments`)
- `GET` — obtener comentarios de una reseña
- `POST` — agregar comentario (requiere JWT)
- `DELETE /:commentId` — eliminar comentario (requiere JWT)
- `PUT /:commentId` — editar comentario (requiere JWT)
- `POST /:commentId/react` — reaccionar a comentario (requiere JWT)

### Efemérides (`/api/efemerides`)
- `GET /` — obtener eventos o datos informativos del día

---

## 🔄 Flujos Principales

### Login
1. Usuario ingresa email y contraseña
2. Backend valida credenciales y genera JWT
3. Frontend almacena token y redirige a feed

### Crear Reseña
1. Usuario completa formulario con título, descripción, rating, categoría e imagen
2. Frontend envía `POST /api/reviews/create` con datos y archivo (multipart)
3. Backend sube imagen a Cloudinary (carpeta `home/categoria/<category>`)
4. Se crea documento en MongoDB con referencia al usuario actual

### Eliminar Reseña
1. Usuario selecciona opción de eliminar en su reseña
2. Backend valida que el usuario sea el autor
3. Imagen se elimina de Cloudinary
4. Documento se borra de MongoDB

---

## 🔧 Instalación Local

### Backend
```bash
cd backend
npm install
# Crear archivo .env con:
PORT=5000
MONGO_URI=tu_mongodb_connection_string
JWT_SECRET=tu_secreto_seguro
CLIENT_URL=http://localhost:5500/frontend
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
EMAIL_SERVICE=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app
GOOGLE_CLIENT_ID=tu_google_client_id

npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Servir con Live Server (VS Code) o:
npx serve .
```

Luego actualiza `frontend/js/config.js` con tu URL del backend.

---

## 🚀 Despliegue en Producción

### Frontend (Vercel)
1. Push del código a GitHub
2. Conecta repositorio en [Vercel](https://vercel.com)
3. Configura:
   - Framework: `Other`
   - Root Directory: `frontend`
   - Build Command: (dejar vacío)
   - Output: `.`
4. En `frontend/js/config.js` actualiza `ENVIRONMENT = 'production'` y URL del backend
5. Deploy automático

### Backend (Render)
1. Crea Web Service en [Render](https://render.com)
2. Conecta tu repositorio GitHub
3. Configura:
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Añade variables de entorno en Render Dashboard
5. Deploy

### Mantener Backend Activo
Backend en Render entra en "sleep" después de 15 minutos inactivo. Usa **UptimeRobot** para mantenerlo activo:
1. Crea cuenta en [UptimeRobot](https://uptimerobot.com)
2. Añade monitor HTTP con URL: `https://tu-backend.onrender.com/api/test`
3. Intervalo: 5 minutos
4. UptimeRobot hará ping periódicamente, manteniendo backend despierto

---

## 🔒 Seguridad

- **No compartas** la URL del backend públicamente (evita abuso)
- **JWT en memoria** preferible a localStorage (reduce riesgo XSS)
- **Variables de entorno** seguras y privadas
- **Validación** exhaustiva en backend
- **Rate limiting** recomendado para endpoints públicos
- **Helmet.js** para headers HTTP seguros
- **CORS** configurado solo para dominio frontend

---

## 📞 Soporte

Para reportar bugs o sugerencias, contacta a través de GitHub Issues.

---

© 2025 ReviewStar — Plataforma de reseñas comunitaria
