import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { roomId, title, description, priority, dueDate, assigneeId } = req.body;

    if (!roomId || !title) {
      return res.status(400).json({ error: 'Room ID and title are required' });
    }

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this room' });
    }

    const task = await prisma.task.create({
      data: {
        roomId,
        title,
        description,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        creatorId: req.user.id
      },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error creating task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = req.params.taskId as string;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: existingTask.roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this room' });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        assigneeId: assigneeId !== undefined ? (assigneeId || null) : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error updating task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const taskId = req.params.taskId as string;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: existingTask.roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this room' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error deleting task' });
  }
};
