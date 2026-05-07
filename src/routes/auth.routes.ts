import { Router } from 'express';
import { getProfile, syncProfile } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/sync-profile', authenticateToken, syncProfile);
router.get('/profile', authenticateToken, getProfile);

export default router;
