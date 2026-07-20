import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_secret_key_2026_jwt_token_auth_secret';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, name } = req.body;

    if (!email || !username || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and default stats in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`
        }
      });

      await tx.userStats.create({
        data: {
          userId: newUser.id,
          weeklyGoalHours: 10.0
        }
      });

      return newUser;
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        stats: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, bio, avatar, weeklyGoalHours, password } = req.body;

    const user = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        name,
        bio,
        avatar
      };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await tx.user.update({
        where: { id: req.user!.id },
        data: updateData
      });

      if (weeklyGoalHours !== undefined) {
        await tx.userStats.update({
          where: { userId: req.user!.id },
          data: {
            weeklyGoalHours: parseFloat(weeklyGoalHours) || 10.0
          }
        });
      }

      return updatedUser;
    });

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { stats: true }
    });

    res.json({
      user: {
        id: fullUser!.id,
        email: fullUser!.email,
        username: fullUser!.username,
        name: fullUser!.name,
        avatar: fullUser!.avatar,
        bio: fullUser!.bio,
        stats: fullUser!.stats
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
};
