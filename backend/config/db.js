import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI no está definida en las variables de entorno');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Forzar IPv4
    };

    await mongoose.connect(process.env.MONGO_URI, options);

    mongoose.connection.on('connected', () => {
      console.log('📦 MongoDB conectado exitosamente');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Error en la conexión MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB desconectado');
    });

    // Manejo elegante del cierre
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB desconectado por cierre de la aplicación');
        process.exit(0);
      } catch (err) {
        console.error('Error al cerrar la conexión MongoDB:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error fatal al conectar MongoDB:', error);
    
    // Sugerencia específica para errores de conexión comunes
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 TIP: Si usas MongoDB Atlas, verifica que tu IP actual esté permitida en "Network Access".');
      console.log('   Puedes permitir acceso desde cualquier lugar (0.0.0.0/0) para desarrollo.\n');
    }

    process.exit(1);
  }
};

export default connectDB;
