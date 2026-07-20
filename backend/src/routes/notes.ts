import { Router } from 'express';
import { createNote, updateNote, deleteNote } from '../controllers/notes';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any); // All note routes are protected

router.post('/', createNote);
router.put('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

export default router;
