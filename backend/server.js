import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviews.js';
import efemeridesRoutes from './routes/efemerides.js';
import fileUpload from 'express-fileupload';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Seguridad mejorada con Helmet
app.use(helmet());

// Habilitar CORS con configuración específica
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate Limiting Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP por ventana
  message: { message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.' }
});
app.use(limiter);

app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Reducido a 5MB por seguridad
}));

// Conexión a MongoDB
connectDB();

// Ruta de prueba para verificar conexión
app.get('/api/test', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const status = {
      server: 'running',
      database: dbStatus === 1 ? 'connected' : 'disconnected',
      dbState: dbStatus
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/efemerides', efemeridesRoutes);

// Endpoint público de configuración (para frontend)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  });
});

// Inicio del servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
    🚀 Servidor corriendo en puerto ${PORT}
    📝 Modo: ${process.env.NODE_ENV || 'development'}
  `);
});

// Ruta para mantener vivo el backend y que UptimeRobot esté feliz
app.get('/', (req, res) => {
  res.status(200).send('ReviewStar backend vivo');
});