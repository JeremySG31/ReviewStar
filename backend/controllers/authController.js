import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;
  
  try {
    // Log de datos recibidos (sin la contraseña)
    console.log('Intentando registro con:', { nombre, email });

    // Validar que tenemos todos los campos
    if (!nombre || !email || !password) {
      console.log('Faltan campos requeridos');
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        missing: (!nombre ? 'nombre ' : '') + (!email ? 'email ' : '') + (!password ? 'password' : '')
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email ya registrado:', email);
      return res.status(400).json({ message: 'Email ya registrado' });
    }

    // Crear el usuario
    console.log('Creando nuevo usuario...');
    const user = await User.create({ nombre, email, password });
    console.log('Usuario creado exitosamente:', user._id);

    // Generar token y enviar respuesta
    const token = generateToken(user._id);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: { 
        id: user._id, 
        nombre: user.nombre, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error en registro',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    res.json({
      token: generateToken(user._id),
      usuario: { id: user._id, nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en login', error });
  }
};
