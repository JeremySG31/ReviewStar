import express from 'express';
import { createReview, getReviews, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.get('/all', getReviews);
router.post('/create', protect, createReview);
router.put('/update/:id', protect, updateReview);
router.delete('/delete/:id', protect, deleteReview);

export default router;
