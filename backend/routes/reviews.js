import express from 'express';
import { createReview, getReviews, getMyReviews, updateReview, deleteReview, addCommentToReview, likeReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.get('/all', getReviews);
router.get('/my', protect, getMyReviews);
router.post('/create', protect, createReview);
router.put('/update/:id', protect, updateReview);
router.delete('/delete/:id', protect, deleteReview);
router.post('/:id/comments', protect, addCommentToReview);
router.put('/:id/like', protect, likeReview);

export default router;
