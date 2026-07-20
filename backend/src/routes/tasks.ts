import { Router } from 'express';
import { createTask, updateTask, deleteTask } from '../controllers/tasks';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any); // All task routes are protected

router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

export default router;
