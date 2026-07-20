import { Router } from 'express';
import {
  createRoom,
  getPublicRooms,
  getMyRooms,
  joinRoomByCode,
  getRoomDetails,
  leaveRoom
} from '../controllers/rooms';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT as any); // All room endpoints are protected

router.post('/', createRoom);
router.get('/public', getPublicRooms);
router.get('/my', getMyRooms);
router.post('/join', joinRoomByCode);
router.get('/:roomId', getRoomDetails);
router.delete('/:roomId/leave', leaveRoom);

export default router;
