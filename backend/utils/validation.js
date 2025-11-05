// Validaciones del backend
import mongoose from 'mongoose';

// Validar ObjectId de MongoDB
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Validar email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar contraseña
export function isValidPassword(password) {
  // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&]).{8,}$/;
  return passwordRegex.test(password);
}

// Validar campos de registro
export function validateRegisterInput(nombre, email, password) {
  const errors = [];

  if (!nombre || nombre.trim().length < 2) {
    errors.push({
      field: 'nombre',
      message: 'El nombre debe tener al menos 2 caracteres'
    });
  }

  if (!email || !isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'El email no es válido'
    });
  }

  if (!password || !isValidPassword(password)) {
    errors.push({
      field: 'password',
      message: 'La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula y un carácter especial'
    });
  }

  return {
    errors,
    isValid: errors.length === 0
  };
}

// Validar campos de review
export function validateReviewInput(title, description, rating) {
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'El título debe tener al menos 3 caracteres'
    });
  }

  if (!description || description.trim().length < 10) {
    errors.push({
      field: 'description',
      message: 'La descripción debe tener al menos 10 caracteres'
    });
  }

  if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
    errors.push({
      field: 'rating',
      message: 'La calificación debe ser un número entre 1 y 5'
    });
  }

  return {
    errors,
    isValid: errors.length === 0
  };
}

// Sanitizar entrada para prevenir XSS
export function sanitizeInput(text) {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Validar URL de imagen
export function isValidImageURL(url) {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

// Validar tamaño de archivo (en bytes)
export function isValidFileSize(size, maxSize = 5 * 1024 * 1024) { // 5MB por defecto
  return size > 0 && size <= maxSize;
}

// Validar tipo de archivo
export function isValidFileType(mimetype) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(mimetype);
}

// Formatear errores para la respuesta
export function formatErrors(errors) {
  return {
    success: false,
    errors: Array.isArray(errors) ? errors : [{ message: errors.toString() }]
  };
}
