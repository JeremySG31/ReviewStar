import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email ya registrado' });

    const user = await User.create({ nombre, email, password });
    res.status(201).json({
      token: generateToken(user._id),
      usuario: { id: user._id, nombre: user.nombre, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en registro', error });
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
