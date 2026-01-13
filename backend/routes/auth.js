import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, forgotPassword, resetPassword, googleLogin, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Limitar intentos de login y registro: máximo 5 intentos cada 15 minutos por IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Aumentado un poco para permitir registro + login
    message: { message: 'Demasiados intentos de acceso desde esta IP, por favor intenta en 15 minutos.' }
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resetToken', authLimiter, resetPassword);
router.post('/google', authLimiter, googleLogin);
router.get('/me', protect, getUserProfile);

export default router;
