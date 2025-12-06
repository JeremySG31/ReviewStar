import express from 'express';
import { createReview, getReviews, getMyReviews, updateReview, deleteReview, getCommentsForReview, addCommentToReview, likeReview, syncMetrics, deleteComment, editComment, reactToComment } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.post('/create', protect, createReview);
router.get('/', getReviews);
router.get('/my', protect, getMyReviews);
router.put('/update/:id', protect, updateReview);
router.delete('/delete/:id', protect, deleteReview);
router.get('/:id/comments', getCommentsForReview);
router.post('/:id/comments', protect, addCommentToReview);
router.post('/:id/like', protect, likeReview);
router.get('/sync-metrics', protect, syncMetrics);

// Comentarios - Eliminar, editar y reaccionar
router.delete('/:reviewId/comments/:commentId', protect, deleteComment);
router.put('/:reviewId/comments/:commentId', protect, editComment);
router.post('/:reviewId/comments/:commentId/react', protect, reactToComment);

export default router;
