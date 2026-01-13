import express from 'express';
import rateLimit from 'express-rate-limit';
import { createReview, getReviews, getMyReviews, updateReview, deleteReview, getCommentsForReview, addCommentToReview, likeReview, syncMetrics, deleteComment, editComment, reactToComment } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

// Límite para creación de contenido: 5 reseñas/comentarios cada 5 minutos
const creationLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { message: 'Estás enviando contenido demasiado rápido. Por favor espera un momento.' }
});

router.post('/create', protect, creationLimiter, createReview);
router.get('/all', getReviews);
router.get('/my', protect, getMyReviews);
router.put('/update/:id', protect, updateReview);
router.delete('/delete/:id', protect, deleteReview);
router.get('/:id/comments', getCommentsForReview);
router.post('/:id/comments', protect, creationLimiter, addCommentToReview);
router.put('/:id/like', protect, likeReview);
router.get('/sync-metrics', protect, syncMetrics);

// Comentarios - Eliminar, editar y reaccionar
router.delete('/:reviewId/comments/:commentId', protect, deleteComment);
router.put('/:reviewId/comments/:commentId', protect, editComment);
router.post('/:reviewId/comments/:commentId/react', protect, reactToComment);

export default router;
