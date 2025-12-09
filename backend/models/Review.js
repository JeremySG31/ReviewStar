import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // URL de Cloudinary
  imagePublicId: { type: String }, // public_id en Cloudinary (para borrar)
  rating: { type: Number, min: 0, max: 5, required: true },
  category: { type: String, required: true, trim: true },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    reactions: {
      '👍': [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      '❤️': [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      '😂': [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Array de usuarios que dieron like
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
