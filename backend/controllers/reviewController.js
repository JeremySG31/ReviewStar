import Review from '../models/Review.js';
import cloudinary from '../config/cloudinary.js';

export const createReview = async (req, res) => {
  const { title, description, rating, category } = req.body;
  try {
    let imageUrl = '';
    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
      imageUrl = result.secure_url;
    }

    const review = await Review.create({
      user: req.user._id,
      title,
      description,
      rating,
      category,
      image: imageUrl
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creando reseña', error });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate('user', 'nombre email').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo reseñas', error });
  }
};

export const updateReview = async (req, res) => {
  const { id } = req.params;
  const { title, description, rating, category } = req.body;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });

    review.title = title || review.title;
    review.description = description || review.description;
    review.rating = rating || review.rating;
    review.category = category || review.category;

    if (req.files?.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
      review.image = result.secure_url;
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando reseña', error });
  }
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
    if (review.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'No autorizado' });

    await review.remove();
    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando reseña', error });
  }
};
