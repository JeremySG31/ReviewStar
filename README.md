# ⭐ ReviewStar

ReviewStar es una aplicación web moderna "full-stack" diseñada para que los usuarios compartan y descubran reseñas. Construida con un backend robusto en **Node.js/Express** y un frontend responsivo en **HTML5/Tailwind CSS**, ofrece una experiencia fluida para crear, leer y gestionar reseñas.

## 🌟 Demo en Vivo

**🔗 [Ver aplicación en vivo](https://review-star-eight.vercel.app/)**


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

**Configuración de Entorno:**
Edita el archivo `frontend/js/config.js` y establece el entorno:
```javascript
const ENVIRONMENT = 'development'; // Para desarrollo local
```

---

## 🌐 Despliegue en Producción

Este proyecto está configurado para un despliegue separado del frontend y backend, siguiendo las mejores prácticas modernas.

### 🎨 Frontend - Vercel

**Pasos para desplegar:**

1. **Conecta tu repositorio** a [Vercel](https://vercel.com)
2. **Configura el proyecto:**
   - Framework Preset: `Other`
   - Root Directory: `frontend`
   - Build Command: (dejar vacío)
   - Output Directory: `.` (punto)

3. **Antes de desplegar**, actualiza `frontend/js/config.js`:
   ```javascript
   const ENVIRONMENT = 'production';
   ```

4. **Despliega** y Vercel te dará una URL como `https://review-star-eight.vercel.app`

### ⚙️ Backend - Render

**Pasos para desplegar:**

1. **Crea un nuevo Web Service** en [Render](https://render.com)
2. **Conecta tu repositorio** de GitHub
3. **Configura el servicio:**
   - Environment: `Node`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Variables de entorno:** Añade todas las variables del archivo `.env` en la sección "Environment" de Render:
   ```
   PORT=5000
   MONGO_URI=tu_mongodb_atlas_uri
   JWT_SECRET=tu_secreto_seguro
   CLIENT_URL=https://review-star-eight.vercel.app
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   EMAIL_SERVICE=gmail
   EMAIL_USER=...
   EMAIL_PASS=...
   GOOGLE_CLIENT_ID=...
   ```

5. **Despliega** y obtendrás una URL como `https://tu-backend.onrender.com`

6. **Actualiza la configuración del frontend:** En `frontend/js/config.js`, asegúrate de que la URL de producción apunte a tu backend de Render:
   ```javascript
   production: {
     API_URL: 'https://tu-backend.onrender.com'
   }
   ```

### 📡 Monitoreo - UptimeRobot

Render pone los servicios gratuitos en "sleep" después de 15 minutos de inactividad. Para mantener tu backend activo:

1. **Crea una cuenta** en [UptimeRobot](https://uptimerobot.com)
2. **Añade un nuevo monitor:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `ReviewStar Backend`
   - URL: `https://tu-backend.onrender.com/api/test`
   - Monitoring Interval: `5 minutes`

3. UptimeRobot hará ping a tu backend cada 5 minutos, manteniéndolo activo y además te notificará si hay algún problema.

### ✅ Checklist de Despliegue

- [ ] Backend desplegado en Render con todas las variables de entorno
- [ ] Frontend desplegado en Vercel
- [ ] `config.js` actualizado con `ENVIRONMENT = 'production'` y URL correcta del backend
- [ ] UptimeRobot configurado para monitorear el backend
- [ ] CORS configurado en el backend (ya incluido con `app.use(cors())`)
- [ ] Prueba de login y registro funcionando en producción
- [ ] Subida de imágenes a Cloudinary funcionando

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

## 🔒 Seguridad

### Protección del Backend

**⚠️ IMPORTANTE:** Por razones de seguridad, **NO compartas públicamente la URL de tu backend**. 

**¿Por qué?**
- Previene ataques DDoS directos
- Evita intentos de explotación de endpoints
- Protege tus recursos (MongoDB, Cloudinary, emails)
- Reduce el riesgo de abuso del sistema

**Recomendaciones:**
1. ✅ Comparte solo la URL del frontend (Vercel)
2. ✅ Mantén las variables de entorno privadas
3. ✅ Usa rate limiting en producción (considera implementar `express-rate-limit`)
4. ✅ Monitorea logs y actividad sospechosa en Render
5. ✅ Mantén actualizadas las dependencias con `npm audit`

### Variables Sensibles

Nunca subas a GitHub:
- Archivos `.env`
- Claves de API (Cloudinary, Google, etc.)
- Secretos JWT
- Contraseñas de bases de datos
- Tokens de acceso

Los archivos `.gitignore` ya están configurados para proteger esta información.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de enviar un Pull Request.

## 📄 Licencia

Este proyecto es de código abierto.
