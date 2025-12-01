import Review from '../models/Review.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const createReview = async (req, res) => {
  const { title, description, rating, category } = req.body;
  try {
    let imageUrl = '';
    if (req.files?.image) {
      // Sanitizar nombre de categoría para usar como carpeta (ej. "Video Juegos" -> "Video_Juegos")
      const folderName = category ? `Home/categoria/${category.trim().replace(/\s+/g, '_')}` : 'Home/categoria/General';

      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: folderName
      });
      imageUrl = result.secure_url;
    }

    const review = await Review.create({
      user: req.user._id,
      title,
      description,
      rating,
      category,
      image: imageUrl,
      comments: [],
      likes: 0
    });

    // Incrementar contador de reseñas del usuario
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalReviews: 1 } });

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

// Obtener solo las reseñas del usuario autenticado
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id }).populate('user', 'nombre email').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo tus reseñas', error });
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
      // Usar la categoría nueva o la existente si no se cambió
      const catForFolder = category || review.category;
      const folderName = catForFolder ? `Home/categoria/${catForFolder.trim().replace(/\s+/g, '_')}` : 'Home/categoria/General';

      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: folderName
      });
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

    // Decrementar contador de reseñas y restar likes del total del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalReviews: -1,
        totalLikes: -review.likes
      }
    });

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando reseña', error });
  }
};

export const getCommentsForReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id).populate('comments.usuario', 'nombre email');
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

    res.json(review.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo comentarios', error });
  }
};

export const addCommentToReview = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

    review.comments.push(comment);
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error añadiendo comentario', error });
  }
};

export const likeReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

    review.likes += 1;
    await review.save();

    // Incrementar totalLikes del dueño de la reseña
    await User.findByIdAndUpdate(review.user, { $inc: { totalLikes: 1 } });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error dando like a la reseña', error });
  }
};

// Endpoint de migración para sincronizar métricas
export const syncMetrics = async (req, res) => {
  try {
    const users = await User.find();
    let updatedCount = 0;

    for (const user of users) {
      const reviews = await Review.find({ user: user._id });
      const totalReviews = reviews.length;
      const totalLikes = reviews.reduce((acc, curr) => acc + (curr.likes || 0), 0);

      user.totalReviews = totalReviews;
      user.totalLikes = totalLikes;
      await user.save();
      updatedCount++;
    }

    res.json({
      message: 'Métricas sincronizadas correctamente',
      usersUpdated: updatedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sincronizando métricas', error });
  }
};
