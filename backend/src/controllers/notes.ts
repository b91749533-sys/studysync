import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { roomId, title, content } = req.body;

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

    const note = await prisma.note.create({
      data: {
        roomId,
        title,
        content: content || '',
        lastEditedById: req.user.id
      },
      include: {
        lastEditedBy: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error creating note' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const noteId = req.params.noteId as string;
    const { title, content } = req.body;

    const existingNote = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: existingNote.roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this room' });
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        lastEditedById: req.user.id
      },
      include: {
        lastEditedBy: {
          select: {
            username: true,
            name: true
          }
        }
      }
    });

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error updating note' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const noteId = req.params.noteId as string;

    const existingNote = await prisma.note.findUnique({
      where: { id: noteId }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Verify membership
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: existingNote.roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this room' });
    }

    await prisma.note.delete({
      where: { id: noteId }
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error deleting note' });
  }
};
