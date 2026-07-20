import { Router } from 'express';
import { registerUser, loginUser, getMe, updateProfile } from '../controllers/auth';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticateJWT as any, getMe as any);
router.put('/profile', authenticateJWT as any, updateProfile as any);

export default router;
