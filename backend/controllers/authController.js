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

// --- Recuperación de Contraseña ---

import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe usuario con ese email' });
    }

    // Obtener token de reseteo
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Crear URL de reseteo (apunta al frontend)
    // Asumimos que el frontend corre en el mismo dominio/puerto si es estático, o configurar URL base
    // Para desarrollo local con Live Server suele ser puerto 5500 o similar.
    // Lo ideal es usar una variable de entorno FRONTEND_URL, por defecto localhost:5500
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
    const resetUrl = `${frontendUrl}/reset-password.html?token=${resetToken}`;

    const message = `
      <h1>Has solicitado restablecer tu contraseña</h1>
      <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>Si no solicitaste este correo, ignóralo.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'ReviewStar - Recuperación de Contraseña',
        message: `Para restablecer tu contraseña ve a: ${resetUrl}`,
        html: message
      });

      res.status(200).json({ success: true, data: 'Correo enviado' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'No se pudo enviar el correo', error: error.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en forgotPassword', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  // Obtener token hasheado
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Setear nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en resetPassword', error: error.message });
  }
};

// --- Google Auth ---
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  const { token } = req.body; // Token ID de Google

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, sub } = ticket.getPayload(); // sub es el googleId

    // Buscar si ya existe el usuario
    let user = await User.findOne({ email });

    if (user) {
      // Si existe, actualizamos googleId si no lo tenía
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    } else {
      // Si no existe, creamos uno nuevo
      // Generamos una contraseña aleatoria segura ya que no la usará
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        nombre: name,
        email,
        password: randomPassword,
        googleId: sub
      });
    }

    res.json({
      token: generateToken(user._id),
      usuario: { id: user._id, nombre: user.nombre, email: user.email }
    });

  } catch (error) {
    console.error('Error en Google Login:', error);
    res.status(400).json({ message: 'Token de Google inválido', error: error.message });
  }
};
