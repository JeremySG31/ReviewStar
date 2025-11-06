import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // URL de Cloudinary
  rating: { type: Number, min: 0, max: 5, required: true },
  category: { type: String, required: true, trim: true },
  comments: [{ type: String }],
  likes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
