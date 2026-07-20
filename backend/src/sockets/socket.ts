import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'studysync_secret_key_2026_jwt_token_auth_secret';

interface ActiveUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  socketId: string;
}

// In-memory presence map: roomId -> Map of userId -> ActiveUser
const roomPresence = new Map<string, Map<string, ActiveUser>>();

// In-memory Pomodoro timer states: roomId -> TimerState
interface TimerState {
  roomId: string;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  timerType: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK';
  intervalId?: NodeJS.Timeout;
}
const roomTimers = new Map<string, TimerState>();

// Helper to update user study statistics & streaks
const recordStudySession = async (userId: string, roomId: string, durationMinutes: number) => {
  try {
    const now = new Date();
    
    // Log the session
    await prisma.studySession.create({
      data: {
        roomId,
        userId,
        durationMinutes,
        type: 'POMODORO',
        startTime: new Date(Date.now() - durationMinutes * 60 * 1000),
        endTime: now
      }
    });

    // Update stats
    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });

    if (stats) {
      let newStreak = stats.currentStreak;
      let newLongest = stats.longestStreak;
      
      const lastActive = stats.lastActiveDate;
      const hoursToAdd = durationMinutes / 60;
      
      if (!lastActive) {
        newStreak = 1;
        newLongest = Math.max(newLongest, 1);
      } else {
        // Compare dates in local/UTC days
        const lastDate = new Date(lastActive).setHours(0, 0, 0, 0);
        const todayDate = new Date(now).setHours(0, 0, 0, 0);
        const diffTime = todayDate - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day study
          newStreak += 1;
          newLongest = Math.max(newLongest, newStreak);
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If diffDays is 0 (same day), streak remains unchanged
      }

      await prisma.userStats.update({
        where: { userId },
        data: {
          totalStudyHours: {
            increment: hoursToAdd
          },
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastActiveDate: now
        }
      });
    }
  } catch (error) {
    console.error(`Failed to record study session for user ${userId}:`, error);
  }
};

export const initSockets = (io: Server) => {
  // Authentication Middleware
  io.use((socket: any, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.data.user = decoded; // Contains id, email, username
      next();
    });
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    if (!user) return;

    // Fetch full user profile details for presence listings
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, name: true, avatar: true }
    });

    if (!userProfile) return;

    socket.on('join_room', async ({ roomId }) => {
      // 1. Join room socket group
      socket.join(roomId);
      
      // 2. Track presence
      if (!roomPresence.has(roomId)) {
        roomPresence.set(roomId, new Map());
      }
      
      const roomUsers = roomPresence.get(roomId)!;
      roomUsers.set(user.id, {
        id: userProfile.id,
        username: userProfile.username,
        name: userProfile.name,
        avatar: userProfile.avatar || '',
        socketId: socket.id
      });

      // Broadcast active user list
      io.to(roomId).emit('room_users', Array.from(roomUsers.values()));

      // Send current timer state to the newly joined user
      const timerState = roomTimers.get(roomId);
      if (timerState) {
        socket.emit('timer_state', {
          remainingSeconds: timerState.remainingSeconds,
          isRunning: timerState.isRunning,
          timerType: timerState.timerType
        });
      } else {
        socket.emit('timer_state', {
          remainingSeconds: 25 * 60,
          isRunning: false,
          timerType: 'POMODORO'
        });
      }

      // 3. Broadcast system join message
      const sysMessage = await prisma.chatMessage.create({
        data: {
          roomId,
          message: `${userProfile.name} joined the room.`,
          isSystem: true
        }
      });
      io.to(roomId).emit('new_message', {
        id: sysMessage.id,
        message: sysMessage.message,
        isSystem: true,
        createdAt: sysMessage.createdAt
      });
    });

    // Chat handling
    socket.on('send_message', async ({ roomId, message }) => {
      try {
        const msg = await prisma.chatMessage.create({
          data: {
            roomId,
            userId: user.id,
            message,
            isSystem: false
          },
          include: {
            user: {
              select: { username: true, name: true, avatar: true }
            }
          }
        });

        io.to(roomId).emit('new_message', msg);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    });

    // Typing Indicators
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user_typing', {
        userId: user.id,
        username: userProfile.username,
        name: userProfile.name,
        isTyping
      });
    });

    // Tasks updates
    socket.on('task_updated', ({ roomId, task, action }) => {
      // action can be: 'create', 'update', 'delete'
      socket.to(roomId).emit('task_sync', { task, action });
    });

    // Notes updates
    socket.on('note_updated', ({ roomId, note }) => {
      socket.to(roomId).emit('note_sync', { note });
    });

    // Timer control handlers
    socket.on('start_timer', ({ roomId, durationMinutes, timerType }) => {
      let timer = roomTimers.get(roomId);

      if (!timer) {
        timer = {
          roomId,
          durationSeconds: durationMinutes * 60,
          remainingSeconds: durationMinutes * 60,
          isRunning: true,
          timerType: timerType || 'POMODORO'
        };
        roomTimers.set(roomId, timer);
      } else {
        timer.isRunning = true;
      }

      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }

      timer.intervalId = setInterval(async () => {
        if (!timer) return;
        
        if (timer.remainingSeconds > 0) {
          timer.remainingSeconds--;
          io.to(roomId).emit('timer_tick', {
            remainingSeconds: timer.remainingSeconds,
            isRunning: timer.isRunning,
            timerType: timer.timerType
          });
        } else {
          // Timer finished
          clearInterval(timer.intervalId!);
          timer.isRunning = false;
          timer.intervalId = undefined;

          io.to(roomId).emit('timer_completed', { timerType: timer.timerType });

          // Save study session if it was a Pomodoro focus cycle
          if (timer.timerType === 'POMODORO') {
            const activeRoomUsers = roomPresence.get(roomId);
            if (activeRoomUsers) {
              const minutes = Math.round(timer.durationSeconds / 60);
              
              // Log session for all currently active users in the room
              const recordPromises = Array.from(activeRoomUsers.keys()).map(uid => 
                recordStudySession(uid, roomId, minutes)
              );
              await Promise.all(recordPromises);

              // Broadcast update stats trigger
              io.to(roomId).emit('stats_updated');
            }
          }
        }
      }, 1000);

      io.to(roomId).emit('timer_state', {
        remainingSeconds: timer.remainingSeconds,
        isRunning: timer.isRunning,
        timerType: timer.timerType
      });
    });

    socket.on('pause_timer', ({ roomId }) => {
      const timer = roomTimers.get(roomId);
      if (timer) {
        timer.isRunning = false;
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.intervalId = undefined;
        }
        io.to(roomId).emit('timer_state', {
          remainingSeconds: timer.remainingSeconds,
          isRunning: timer.isRunning,
          timerType: timer.timerType
        });
      }
    });

    socket.on('reset_timer', ({ roomId, durationMinutes, timerType }) => {
      const timer = roomTimers.get(roomId);
      if (timer) {
        timer.isRunning = false;
        timer.timerType = timerType || 'POMODORO';
        timer.durationSeconds = durationMinutes * 60;
        timer.remainingSeconds = durationMinutes * 60;
        if (timer.intervalId) {
          clearInterval(timer.intervalId);
          timer.intervalId = undefined;
        }
        io.to(roomId).emit('timer_state', {
          remainingSeconds: timer.remainingSeconds,
          isRunning: timer.isRunning,
          timerType: timer.timerType
        });
      } else {
        roomTimers.set(roomId, {
          roomId,
          durationSeconds: durationMinutes * 60,
          remainingSeconds: durationMinutes * 60,
          isRunning: false,
          timerType: timerType || 'POMODORO'
        });
        io.to(roomId).emit('timer_state', {
          remainingSeconds: durationMinutes * 60,
          isRunning: false,
          timerType: timerType || 'POMODORO'
        });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      // Find all rooms this socket was active in
      roomPresence.forEach(async (users, roomId) => {
        if (users.has(user.id) && users.get(user.id)!.socketId === socket.id) {
          users.delete(user.id);
          
          // Broadcast update
          io.to(roomId).emit('room_users', Array.from(users.values()));

          // System leave message
          try {
            const sysMessage = await prisma.chatMessage.create({
              data: {
                roomId,
                message: `${userProfile.name} left the room.`,
                isSystem: true
              }
            });
            io.to(roomId).emit('new_message', {
              id: sysMessage.id,
              message: sysMessage.message,
              isSystem: true,
              createdAt: sysMessage.createdAt
            });
          } catch (err) {
            console.error('Leave room message logging error:', err);
          }

          // If room is empty, clean up timer memory
          if (users.size === 0) {
            const timer = roomTimers.get(roomId);
            if (timer) {
              if (timer.intervalId) clearInterval(timer.intervalId);
              roomTimers.delete(roomId);
            }
          }
        }
      });
    });
  });
};
