import { Router } from 'express';
import { register, login, getProfile, logout } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;
