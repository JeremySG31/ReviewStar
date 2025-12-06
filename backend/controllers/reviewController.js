import Review from '../models/Review.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const createReview = async (req, res) => {
  const { title, description, rating, category } = req.body;
  try {
    let imageUrl = '';
    if (req.files?.image) {
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

    // Eliminar la reseña de la base de datos
    await Review.deleteOne({ _id: id });

    // Actualizar métricas del usuario
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        totalReviews: -1,
        totalLikes: -(review.likes || 0)
      }
    });

    res.json({ message: 'Reseña eliminada exitosamente', success: true });
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    res.status(500).json({ message: 'Error eliminando reseña', error: error.message });
  }
};

export const getCommentsForReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id).populate('comments.user', 'nombre email');
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

    review.comments.push({
      user: req.user._id,
      text: comment,
      createdAt: new Date()
    });
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

    const userId = req.user._id;
    const hasLiked = review.likedBy.includes(userId);

    if (hasLiked) {
      // Si ya dio like, quitarlo (toggle)
      review.likes -= 1;
      review.likedBy = review.likedBy.filter(id => id.toString() !== userId.toString());
      await review.save();

      await User.findByIdAndUpdate(review.user, { $inc: { totalLikes: -1 } });
      res.json({ message: 'Like removido', review });
    } else {
      // Si no ha dado like, agregarlo
      review.likes += 1;
      review.likedBy.push(userId);
      await review.save();

      await User.findByIdAndUpdate(review.user, { $inc: { totalLikes: 1 } });
      res.json({ message: 'Like agregado', review });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error dando like a la reseña', error });
  }
};

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


// Eliminar comentario propio
export const deleteComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Rese�a no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (comment.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'No autorizado' });
    comment.remove();
    await review.save();
    res.json({ message: 'Comentario eliminado', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando comentario' });
  }
};

// Editar comentario
export const editComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ message: 'Comentario vac�o' });
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Rese�a no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (comment.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'No autorizado' });
    comment.text = text.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await review.save();
    res.json({ message: 'Comentario editado', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error editando comentario' });
  }
};

// Reaccionar a comentario
export const reactToComment = async (req, res) => {
  const { reviewId, commentId } = req.params;
  const { reaction } = req.body;
  const valid = ['', '', ''];
  if (!valid.includes(reaction)) return res.status(400).json({ message: 'Inv�lida' });
  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Rese�a no encontrada' });
    const comment = review.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (!comment.reactions) comment.reactions = { '': [], '': [], '': [] };
    const userId = req.user._id.toString();
    const arr = comment.reactions[reaction] || [];
    const has = arr.some(id => id.toString() === userId);
    if (has) {
      comment.reactions[reaction] = arr.filter(id => id.toString() !== userId);
    } else {
      for (const k of valid) {
        comment.reactions[k] = (comment.reactions[k] || []).filter(id => id.toString() !== userId);
      }
      comment.reactions[reaction].push(req.user._id);
    }
    await review.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error en reacci�n' });
  }
};
