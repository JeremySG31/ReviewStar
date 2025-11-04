import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Variable de entorno ${varName} no está definida`);
  }
});

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Forzar HTTPS
});

// Función de prueba de conexión
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('☁️ Cloudinary conectado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error);
    return false;
  }
};

// Configuración para subida de imágenes
export const uploadConfig = {
  folder: 'Home',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [
    { width: 1000, height: 1000, crop: 'limit' },
    { quality: 'auto:good' }
  ]
};

export default cloudinary;
