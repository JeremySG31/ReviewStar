import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { validateRegisterInput } from '../utils/validation.js';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Log de datos recibidos (sin la contraseña)
    console.log('Intentando registro con:', { nombre, email });

    // Validar que tenemos todos los campos y cumplen requisitos
    const validation = validateRegisterInput(nombre, email, password);
    if (!validation.isValid) {
      console.log('Validación fallida:', validation.errors);
      return res.status(400).json({
        message: validation.errors[0].message,
        errors: validation.errors
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
        email: user.email,
        totalReviews: user.totalReviews,
        totalLikes: user.totalLikes,
        avatar: user.avatar
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
    if (!email || !password) {
      return res.status(400).json({ message: 'Por favor provea email y contraseña' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    res.json({
      token: generateToken(user._id),
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        totalReviews: user.totalReviews,
        totalLikes: user.totalLikes
      }
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
    // Usar variable de entorno o detectar host automáticamente
    const frontendUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    // Si estamos en desarrollo local y el backend es 5000 pero frontend 5500, ajustar aquí si es necesario
    // Para producción, FRONTEND_URL debe estar seteado.

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
      token: generateToken(user._id),
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        totalReviews: user.totalReviews,
        totalLikes: user.totalLikes,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Error en Google Login:', error);
    res.status(400).json({ message: 'Token de Google inválido', error: error.message });
  }
};

// Obtener perfil del usuario con métricas actualizadas
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Importar Review para calcular métricas en tiempo real
    const Review = (await import('../models/Review.js')).default;

    // Calcular métricas reales desde las reseñas
    const reviews = await Review.find({ user: user._id });
    const totalReviews = reviews.length;
    const totalLikes = reviews.reduce((acc, review) => acc + (review.likes || 0), 0);

    // Actualizar el usuario si las métricas no coinciden
    if (user.totalReviews !== totalReviews || user.totalLikes !== totalLikes) {
      user.totalReviews = totalReviews;
      user.totalLikes = totalLikes;
      await user.save();
    }

    res.json({
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      totalReviews: user.totalReviews,
      totalLikes: user.totalLikes,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error obteniendo perfil del usuario', error: error.message });
  }
};

// @desc    Actualizar Avatar
// @route   PUT /api/auth/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'Debes proporcionar una imagen de avatar' });
    }

    const file = req.files.avatar;

    if (user.avatarId) {
       try {
           await cloudinary.uploader.destroy(user.avatarId);
       } catch (err) {
           console.warn('Error eliminando avatar anterior:', err);
       }
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
       folder: 'Home/avatars',
       moderation: 'aws_rek'
    });

    user.avatar = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400,c_fill/');
    user.avatarId = result.public_id;
    await user.save();

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
};

// @desc    Eliminar Avatar
// @route   DELETE /api/auth/avatar
// @access  Private
export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.avatarId) {
       try {
           await cloudinary.uploader.destroy(user.avatarId);
       } catch (err) {
           console.warn('Error eliminando avatar de Cloudinary:', err);
       }
    }

    user.avatar = '';
    user.avatarId = '';
    await user.save();

    res.json({ message: 'Avatar eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando avatar:', error);
    res.status(500).json({ message: 'Error eliminando avatar' });
  }
};
