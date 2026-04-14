import Review from '../models/Review.js';
import User from '../models/User.js';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Crear nueva reseña
// @route   POST /api/reviews/create
// @access  Private
export const createReview = async (req, res) => {
    try {
        const { title, description, rating, category } = req.body;

        // Validaciones básicas de entrada
        if (!title || title.trim().length < 3) {
            return res.status(400).json({ message: 'El título debe tener al menos 3 caracteres' });
        }
        if (!description || description.trim().length < 10) {
            return res.status(400).json({ message: 'La descripción debe tener al menos 10 caracteres' });
        }

        const numericRating = parseFloat(rating);
        if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
            return res.status(400).json({ message: 'La calificación debe ser un número entre 0 y 5' });
        }

        const allowedCategories = ['Películas', 'Series', 'Libros', 'Videojuegos', 'Tecnología', 'Otros'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ message: 'Categoría no válida' });
        }

        let imageUrl = '';

        if (req.files && req.files.image) {
            const file = req.files.image;
            // Validar tipo de archivo
            if (!file.mimetype.startsWith('image/')) {
                return res.status(400).json({ message: 'Solo se permiten imágenes' });
            }

            const uploadFolder = `Home/categoria/${category}`;
            try {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: uploadFolder,
                    moderation: 'aws_rek' // Moderación automática contra contenido NSFW/adultos
                });

                // VERIFICACIÓN MANUAL DE MODERACIÓN
                if (result.moderation && result.moderation.some(m => m.status === 'rejected')) {
                    await cloudinary.uploader.destroy(result.public_id);
                    return res.status(400).json({ 
                        message: 'Contenido inapropiado detectado: Esta imagen no cumple con nuestras normas de comunidad y ha sido bloqueada.' 
                    });
                }

                // Optimización de velocidad: Forzar WebP y calidad automática para fluidez
                imageUrl = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
            } catch (uploadError) {
                console.error(uploadError);
                return res.status(400).json({ 
                    message: uploadError.message && uploadError.message.includes('Moderation') 
                        ? 'Contenido inapropiado detectado: Esta imagen no cumple con nuestras normas de comunidad y ha sido bloqueada.' 
                        : 'Error al subir la imagen' 
                });
            }
        } else if (req.body.image) {
            imageUrl = req.body.image;
        }

        const reviewData = {
            user: req.user._id,
            title,
            description,
            rating,
            category,
            image: imageUrl
        };

        const review = await Review.create(reviewData);

        // Actualizar métricas del usuario
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { totalReviews: 1 } },
            { new: true }
        );

        res.status(201).json({
            review,
            userMetrics: {
                totalReviews: user.totalReviews,
                totalLikes: user.totalLikes
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear reseña' });
    }
};

// @desc    Obtener todas las reseñas
// @route   GET /api/reviews/all
// @access  Public
export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('user', 'nombre email avatar')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener reseñas' });
    }
};

// @desc    Obtener mis reseñas
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id }).populate('user', 'nombre email avatar').sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mis reseñas' });
    }
};

// @desc    Actualizar reseña
// @route   PUT /api/reviews/update/:id
// @access  Private
export const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        const { title, description, rating, category } = req.body;

        review.title = title || review.title;
        review.description = description || review.description;
        review.rating = rating || review.rating;
        review.category = category || review.category;

        if (req.files && req.files.image) {
            // Si ya existe una imagen en Cloudinary, eliminarla primero
            if (review.imagePublicId) {
                try {
                    await cloudinary.uploader.destroy(review.imagePublicId);
                } catch (err) {
                    console.warn('No se pudo eliminar imagen previa en Cloudinary:', err.message || err);
                }
            }

            const uploadFolder = `Home/categoria/${category || review.category || 'general'}`;
            try {
                const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
                    folder: uploadFolder,
                    moderation: 'aws_rek' // Moderación automática contra contenido NSFW/adultos
                });
                review.image = result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
            } catch (uploadError) {
                console.error(uploadError);
                 return res.status(400).json({ 
                    message: uploadError.message && uploadError.message.includes('Moderation') 
                        ? 'Contenido bloqueado. O no tienes activado "Amazon Rekognition" en Cloudinary, o la imagen es obscena.' 
                        : 'Error al subir la imagen' 
                });
            }
        }

        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
};

// @desc    Eliminar reseña
// @route   DELETE /api/reviews/delete/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Reseña no encontrada' });
        }

        if (review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        // Eliminar imagen en Cloudinary si existe
        if (review.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(review.imagePublicId);
            } catch (err) {
                console.warn('Error eliminando imagen en Cloudinary:', err.message || err);
            }
        }

        await review.deleteOne();
        res.json({ message: 'Reseña eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar' });
    }
};

// @desc    Dar o quitar like a una reseña
// @route   PUT /api/reviews/:id/like
// @access  Private
export const likeReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'No encontrado' });

        // Verificar si el usuario ya dio like
        // Asegurarse de que likedBy sea un array
        if (!review.likedBy) review.likedBy = [];

        const alreadyLiked = review.likedBy.some(id => id.toString() === req.user._id.toString());

        if (alreadyLiked) {
            // Quitar like
            review.likedBy = review.likedBy.filter(
                id => id.toString() !== req.user._id.toString()
            );
            // Sincronizar contador
            review.likes = review.likedBy.length;
        } else {
            // Dar like
            review.likedBy.push(req.user._id);
            // Sincronizar contador
            review.likes = review.likedBy.length;
        }

        await review.save();

        res.json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Obtener comentarios de una reseña
// @route   GET /api/reviews/:id/comments
// @access  Public
export const getCommentsForReview = async (req, res) => {
    try {
        // IMPORTANTE: Populate user para que frontend detecte isOwner
        const review = await Review.findById(req.params.id).populate('comments.user', 'nombre email avatar');
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        res.json(review.comments);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener comentarios' });
    }
};

// @desc    Agregar comentario
// @route   POST /api/reviews/:id/comments
// @access  Private
export const addCommentToReview = async (req, res) => {
    try {
        const { comment } = req.body;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'El comentario no puede estar vacío' });
        }

        if (comment.length > 500) {
            return res.status(400).json({ message: 'El comentario es demasiado largo (máximo 500 caracteres)' });
        }

        const review = await Review.findById(req.params.id);

        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        const newComment = {
            user: req.user._id,
            text: comment,
            createdAt: new Date(),
            reactions: { '👍': [], '❤️': [], '😂': [] }
        };

        review.comments.push(newComment);
        await review.save();

        res.json(review.comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al comentar' });
    }
};

// @desc    Eliminar comentario
// @route   DELETE /api/reviews/:reviewId/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
    try {
        const { reviewId, commentId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        const comment = review.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        review.comments.pull(commentId);
        await review.save();

        res.json({ message: 'Comentario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar comentario' });
    }
};

// @desc    Editar comentario
// @route   PUT /api/reviews/:reviewId/comments/:commentId
// @access  Private
export const editComment = async (req, res) => {
    try {
        const { reviewId, commentId } = req.params;
        const { text } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        const comment = review.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'No autorizado' });
        }

        comment.text = text;
        comment.edited = true;
        comment.editedAt = new Date();

        await review.save();
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al editar comentario' });
    }
};

// @desc    Reaccionar a comentario
// @route   POST /api/reviews/:reviewId/comments/:commentId/react
// @access  Private
export const reactToComment = async (req, res) => {
    try {
        const { reviewId, commentId } = req.params;
        const { reaction } = req.body;

        const validReactions = ['👍', '❤️', '😂'];
        if (!validReactions.includes(reaction)) {
            return res.status(400).json({ message: 'Reacción inválida' });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });

        const comment = review.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

        // Inicializar objeto de reacciones si falta
        if (!comment.reactions) {
            comment.reactions = { '👍': [], '❤️': [], '😂': [] };
        }

        // Asegurar arrays
        if (!comment.reactions['👍']) comment.reactions['👍'] = [];
        if (!comment.reactions['❤️']) comment.reactions['❤️'] = [];
        if (!comment.reactions['😂']) comment.reactions['😂'] = [];

        const userId = req.user._id.toString();
        const currentList = comment.reactions[reaction];

        // Verificar si ya tiene reacción
        const hasReacted = currentList.some(id => id.toString() === userId);

        if (hasReacted) {
            // Quitar
            comment.reactions[reaction] = currentList.filter(id => id.toString() !== userId);
        } else {
            // Agregar
            comment.reactions[reaction].push(req.user._id);
        }

        // IMPORTANTE: Notificar cambio a Mongoose
        review.markModified('comments');

        await review.save();
        res.json({ success: true, reactions: comment.reactions });
    } catch (error) {
        console.error('Error en reactToComment:', error);
        res.status(500).json({ message: 'Error al reaccionar' });
    }
};

export const syncMetrics = async (req, res) => {
    res.json({ ok: true });
};
