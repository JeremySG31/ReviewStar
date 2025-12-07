import express from 'express';
import { getEfemeride } from '../controllers/efemeridesController.js';

const router = express.Router();

router.get('/hoy', getEfemeride);

export default router;