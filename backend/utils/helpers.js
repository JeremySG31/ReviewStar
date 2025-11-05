// Utilidades generales para el backend
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generar token JWT
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

// Verificar token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Generar hash para contraseña temporal
export function generateTempHash() {
  return crypto.randomBytes(32).toString('hex');
}

// Generar código de verificación
export function generateVerificationCode(length = 6) {
  return crypto.randomInt(100000, 999999).toString();
}

// Manejar errores async/await
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Formatear respuesta de error
export function errorResponse(res, message, statusCode = 400) {
  res.status(statusCode).json({
    success: false,
    message
  });
}

// Formatear respuesta exitosa
export function successResponse(res, data, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data
  });
}

// Parsear query params para paginación
export function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(parseInt(query.limit) || 10, 100));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

// Formatear fecha para logs
export function getFormattedDate() {
  return new Date().toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '');
}

// Logger simple
export function log(message, type = 'info') {
  const timestamp = getFormattedDate();
  console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
}

// Delay para testing/desarrollo
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Limpiar objeto de campos undefined/null
export function cleanObject(obj) {
  return Object.entries(obj)
    .filter(([_, value]) => value != null)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}