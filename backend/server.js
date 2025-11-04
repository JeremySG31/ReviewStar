import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import reviewRoutes from './routes/reviews.js';
import fileUpload from 'express-fileupload';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Habilitar CORS para desarrollo
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
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
