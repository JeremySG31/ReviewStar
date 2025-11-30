import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Opcional si usa Google
  googleId: { type: String, unique: true, sparse: true }, // ID de Google
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalReviews: { type: Number, default: 0 },
  totalLikes: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Hash automático antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Si no hay password (usuario de Google), saltar hash
  if (!this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseña
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Si no tiene password (usuario de Google), retornar falso
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generar y hashear token de reseteo de password
userSchema.methods.getResetPasswordToken = function () {
  // Generar token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hashear token y setearlo al campo resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Setear expiración (10 minutos)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model('User', userSchema);
