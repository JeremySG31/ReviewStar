import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // URL de Cloudinary
  rating: { type: Number, min: 1, max: 5, required: true }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
