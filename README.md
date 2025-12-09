# ⭐ ReviewStar

ReviewStar es una aplicación web moderna "full-stack" diseñada para que los usuarios compartan y descubran reseñas. Construida con un backend robusto en **Node.js/Express** y un frontend responsivo en **HTML5/Tailwind CSS**, ofrece una experiencia fluida para crear, leer y gestionar reseñas.

## 🌟 Demo en Vivo
# ⭐ ReviewStar — Documentación técnica

Este documento describe la implementación actual de ReviewStar, su arquitectura y cómo operar el proyecto localmente y en producción. 

**Demo (despliegue público):** `https://review-star-eight.vercel.app/` (frontend)

---

**Propósito de este README actualizado:**
- **Documentar** componentes, flujos y endpoints ya implementados.
- **Servir** como base para diagramas de arquitectura y diseño de alto nivel.
- **Facilitar** despliegue, pruebas y evolución del sistema.

---

**Resumen del sistema**
- **Frontend:** Páginas HTML + Tailwind CSS, JavaScript modular (carpeta `frontend/js`).
- **Backend:** API REST en `Node.js + Express` (carpeta `backend/`).
- **Base de datos:** MongoDB, modelado con Mongoose (`backend/models`).
- **Almacenamiento de imágenes:** Cloudinary (`backend/config/cloudinary.js`).
- **Autenticación:** JWT para sesiones y verificación de tokens; soporte para Google Sign-In.
- **Email:** `nodemailer` para recuperación de contraseñas y notificaciones (`backend/utils/sendEmail.js`).

**Stack principal:** `Node.js`, `Express`, `MongoDB/Mongoose`, `Cloudinary`, `JWT`, `Tailwind CSS`, `Vanilla JS`.

---

**Estructura de carpetas (resumen)**
- **`backend/`**: código del servidor
   - `config/`: `db.js`, `cloudinary.js`, `env.js`
   - `controllers/`: `authController.js`, `efemeridesController.js`, `reviewController.js`
   - `middleware/`: `auth.js` (middleware JWT)
   - `models/`: `User.js`, `Review.js`
   - `routes/`: `auth.js`, `efemerides.js`, `reviews.js`
   - `utils/`: `helpers.js`, `sendEmail.js`, `validation.js`
   - `server.js`: punto de entrada
- **`frontend/`**: interfaz de usuario (HTML/CSS/JS)
   - `*.html`: `index.html`, `feed.html`, `login.html`, `register.html`, `profile.html`, etc.
   - `js/`: módulos frontend (`auth.js`, `feed.js`, `reviews.js`, `config.js`)
   - `css/`: estilos compilados y responsivos

---

**Principales características implementadas**
- **Autenticación local**: registro, inicio de sesión, logout, middleware `auth.js` que valida el JWT.
- **Google Sign-In**: verificación del token de Google en backend (biblioteca Google Auth).
- **Recuperación de contraseña**: tokens de restablecimiento enviados por email (Nodemailer + `sendEmail.js`).
- **CRUD de reseñas**: creación, lectura (feed), actualización y eliminación de reseñas.
- **Subida de imágenes**: Cloudinary integrado para perfiles y reseñas (controladores usan `cloudinary.uploader`).
- **Validaciones**: utilidades en `backend/utils/validation.js` y checks en controllers.

---

**Modelo de datos (resumen)**
- **`User`** (en `backend/models/User.js`):
   - **Campos típicos:** `name`, `email` (único), `password` (hash), `avatar` ({ `url`, `public_id` }), `googleId?`, `role`, `createdAt`.
   - **Índices/constraints:** índice único en `email`.

- **`Review`** (en `backend/models/Review.js`):
   - **Campos típicos:** `title`, `content`, `rating` (número), `images` (array de `{url, public_id}`), `author` (ObjectId -> `User`), `createdAt`, `updatedAt`.
   - **Relaciones:** `Review.author` referencia a `User`.

Estos modelos sirven para crear un diagrama ER y para definir contratos de la API.

---

**API — Endpoints principales (implementados / esperados)**
Nota: las rutas reales están en `backend/routes/*.js`. A continuación se presenta un resumen semántico.

- **Auth** (`/api/auth`)
   - `POST /register` : registrar usuario (email + password)
   - `POST /login` : login y obtención de JWT
   - `POST /google-signin` : login con Google (token ID)
   - `POST /forgot-password` : solicita envío de token de reseteo por email
   - `POST /reset-password/:token` : restablece contraseña usando token
   - `GET /me` : obtiene perfil del usuario autenticado (JWT required)

- **Reviews** (`/api/reviews`)
   - `GET /` : obtener listado/feed (paginación opcional)
   - `POST /` : crear review (autenticación requerida)
   - `GET /:id` : obtener review por id
   - `PUT /:id` : actualizar (solo autor o admin)
   - `DELETE /:id` : borrar (solo autor o admin)

- **Efemérides / Otros** (`/api/efemerides`)
   - `GET /` : endpoint para efemérides (contenido informativo)

**Autorización:** middleware `auth.js` valida `Authorization: Bearer <token>`.

---

**Flujos críticos (alto nivel) — listo para convertir a diagramas de secuencia**
- **Login (email/password)**
   1. Frontend envía `POST /api/auth/login` con email+password.
   2. Backend valida credenciales, genera JWT y devuelve datos públicos del usuario.
   3. Frontend guarda JWT (preferible en memoria; si se usa localStorage, considerar estrategias para XSS/CSRF).

- **Registro con imagen de perfil**
   1. El usuario sube imagen desde frontend (form-data) al backend o se sube directamente a Cloudinary desde el frontend (si está implementado).
   2. Backend recibe, sube a Cloudinary y guarda `url` + `public_id` en `User.avatar`.

- **Crear una review con imágenes**
   1. Frontend envía `POST /api/reviews` con datos y archivos de imagen.
   2. Backend sube imágenes a Cloudinary, crea documento `Review` referenciando `author`.
   3. Backend devuelve la review creada.

---

**Configuración de entorno (variables importantes)**
- `PORT` — puerto del backend
- `MONGO_URI` — cadena de conexión a MongoDB
- `JWT_SECRET` — secreto para firmar JWT
- `CLIENT_URL` — URL del frontend (CORS / emails)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS` — para `nodemailer`
- `GOOGLE_CLIENT_ID` — para verificación de Google Sign-In

---

**Ejecución local (pasos rápidos)**
- Backend:
   - `cd backend`
   - crear `.env` con variables necesarias
   - `npm install`
   - `npm run dev` (o `npm start` según scripts)
- Frontend:
   - `cd frontend`
   - `npm install` (si corresponde)
   - servir carpeta con `Live Server` o `npx serve .`

Revisar `frontend/js/config.js` y ajustar `ENVIRONMENT` y `API_URL` según entorno

---

**Pruebas y CI sugerido**
- Crear colección Postman / OpenAPI (Swagger) para endpoints principales.
- Añadir pruebas unitarias / integración para controllers y middleware (Jest + Supertest).
- Pipeline CI: `lint`, `test`, `build`, `deploy`.

---

© Proyecto ReviewStar — documentación técnica generada para soporte de arquitectura y operaciones.
3. UptimeRobot hará ping a tu backend cada 5 minutos, manteniéndolo activo y además te notificará si hay algún problema.
