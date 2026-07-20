import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_secret_key_2026_jwt_token_auth_secret';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }

      req.user = user as { id: string; email: string; username: string };
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
};
