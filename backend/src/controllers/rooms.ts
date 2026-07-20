import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { randomBytes } from 'crypto';

const generateInviteCode = () => {
  return randomBytes(4).toString('hex').toUpperCase(); // 8 characters, e.g. "A3B2C5D7"
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, subject, isPrivate } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ error: 'Room name and subject are required' });
    }

    const inviteCode = generateInviteCode();

    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.studyRoom.create({
        data: {
          name,
          description,
          subject,
          isPrivate: !!isPrivate,
          inviteCode,
          creatorId: req.user!.id
        }
      });

      // Automatically add creator as room member
      await tx.roomMember.create({
        data: {
          roomId: newRoom.id,
          userId: req.user!.id,
          role: 'CREATOR'
        }
      });

      return newRoom;
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error creating room' });
  }
};

export const getPublicRooms = async (req: AuthRequest, res: Response) => {
  try {
    const rooms = await prisma.studyRoom.findMany({
      where: {
        isPrivate: false
      },
      include: {
        _count: {
          select: { members: true }
        },
        creator: {
          select: {
            username: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(rooms);
  } catch (error) {
    console.error('Get public rooms error:', error);
    res.status(500).json({ error: 'Internal server error fetching rooms' });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const memberships = await prisma.roomMember.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true }
            },
            creator: {
              select: {
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    res.json(memberships.map(m => m.room));
  } catch (error) {
    console.error('Get my rooms error:', error);
    res.status(500).json({ error: 'Internal server error fetching joined rooms' });
  }
};

export const joinRoomByCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const room = await prisma.studyRoom.findUnique({
      where: { inviteCode }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found with this invite code' });
    }

    // Check if user is already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: req.user.id
        }
      }
    });

    if (existingMember) {
      return res.json({ message: 'Already a member', roomId: room.id });
    }

    await prisma.roomMember.create({
      data: {
        roomId: room.id,
        userId: req.user.id,
        role: 'MEMBER'
      }
    });

    res.json({ message: 'Successfully joined room', roomId: room.id });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ error: 'Internal server error joining room' });
  }
};

export const getRoomDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const roomId = req.params.roomId as string;

    // Check membership for security
    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Forbidden: You are not a member of this study room' });
    }

    const room = await prisma.studyRoom.findUnique({
      where: { id: roomId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true,
                bio: true
              }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            },
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          include: {
            lastEditedBy: {
              select: {
                username: true,
                name: true
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        chatMessages: {
          include: {
            user: {
              select: {
                username: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          },
          take: 50 // Get recent chat history
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    console.error('Get room details error:', error);
    res.status(500).json({ error: 'Internal server error fetching room details' });
  }
};

export const leaveRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const roomId = req.params.roomId as string;

    const membership = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: req.user.id
        }
      }
    });

    if (!membership) {
      return res.status(400).json({ error: 'You are not a member of this room' });
    }

    // Leave the room (delete membership)
    await prisma.roomMember.delete({
      where: {
        roomId_userId: {
          roomId,
          userId: req.user.id
        }
      }
    });

    // Check if room has any members left
    const remainingCount = await prisma.roomMember.count({
      where: { roomId }
    });

    if (remainingCount === 0) {
      // Clean up empty rooms
      await prisma.studyRoom.delete({
        where: { id: roomId }
      });
    } else if (membership.role === 'CREATOR') {
      // Reassign creator role to the oldest member
      const nextMember = await prisma.roomMember.findFirst({
        where: { roomId },
        orderBy: { joinedAt: 'asc' }
      });
      if (nextMember) {
        await prisma.roomMember.update({
          where: { id: nextMember.id },
          data: { role: 'CREATOR' }
        });
        await prisma.studyRoom.update({
          where: { id: roomId },
          data: { creatorId: nextMember.userId }
        });
      }
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Internal server error leaving room' });
  }
};
