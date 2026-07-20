import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // Fetch user profile and pre-calculated stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        memberships: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                subject: true
              }
            }
          },
          take: 5
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate completed tasks
    const completedTasksCount = await prisma.task.count({
      where: {
        OR: [
          { assigneeId: userId },
          { creatorId: userId }
        ],
        status: 'DONE'
      }
    });

    // Fetch recent study sessions
    const recentSessions = await prisma.studySession.findMany({
      where: { userId },
      include: {
        room: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Calculate weekly study activity chart (last 7 days, including today)
    const chartData = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySessions = await prisma.studySession.findMany({
        where: {
          userId,
          startTime: {
            gte: date,
            lt: nextDate
          }
        }
      });

      const totalMinutes = daySessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

      chartData.push({
        day: daysOfWeek[date.getDay()],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: totalHours
      });
    }

    res.json({
      stats: {
        totalStudyHours: user.stats?.totalStudyHours || 0,
        currentStreak: user.stats?.currentStreak || 0,
        longestStreak: user.stats?.longestStreak || 0,
        weeklyGoalHours: user.stats?.weeklyGoalHours || 10.0,
        completedTasks: completedTasksCount,
        joinedRoomsCount: user.memberships.length
      },
      joinedRooms: user.memberships.map(m => m.room),
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        roomName: s.room.name,
        durationMinutes: s.durationMinutes,
        type: s.type,
        createdAt: s.createdAt
      })),
      weeklyActivity: chartData
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching dashboard stats' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // 1. Total sessions by type (Pomodoro, Short Break, Long Break)
    const sessions = await prisma.studySession.findMany({
      where: { userId }
    });

    const focusCount = sessions.filter(s => s.type === 'POMODORO').length;
    const breakCount = sessions.filter(s => s.type !== 'POMODORO').length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    // 2. Weekly study hours comparison (current week vs previous week)
    const getWeekHours = async (weeksAgo: number) => {
      const start = new Date();
      start.setDate(start.getDate() - (weeksAgo * 7) - start.getDay()); // Start of that week (Sunday)
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);

      const s = await prisma.studySession.findMany({
        where: {
          userId,
          startTime: { gte: start, lt: end }
        }
      });
      return s.reduce((sum, curr) => sum + curr.durationMinutes, 0) / 60;
    };

    const currentWeekHours = await getWeekHours(0);
    const lastWeekHours = await getWeekHours(1);

    // 3. Focus hours by subject/category
    const roomsWithSessions = await prisma.studyRoom.findMany({
      where: {
        sessions: {
          some: { userId }
        }
      },
      include: {
        sessions: {
          where: { userId }
        }
      }
    });

    const subjectBreakdown: { [key: string]: number } = {};
    roomsWithSessions.forEach(room => {
      const roomMinutes = room.sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const roomHours = parseFloat((roomMinutes / 60).toFixed(2));
      subjectBreakdown[room.subject] = (subjectBreakdown[room.subject] || 0) + roomHours;
    });

    const subjectData = Object.keys(subjectBreakdown).map(subject => ({
      subject,
      hours: subjectBreakdown[subject]
    }));

    // 4. Most productive day of the week
    const weekdayMinutes = [0, 0, 0, 0, 0, 0, 0]; // Sun - Sat
    sessions.forEach(s => {
      const day = new Date(s.startTime).getDay();
      weekdayMinutes[day] += s.durationMinutes;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayData = weekdayMinutes.map((mins, idx) => ({
      day: daysOfWeek[idx],
      hours: parseFloat((mins / 60).toFixed(2))
    }));

    res.json({
      summary: {
        totalHours: parseFloat((totalMinutes / 60).toFixed(2)),
        totalSessions: focusCount,
        completedBreaks: breakCount,
        currentWeekHours: parseFloat(currentWeekHours.toFixed(2)),
        lastWeekHours: parseFloat(lastWeekHours.toFixed(2))
      },
      subjectBreakdown: subjectData,
      weekdayBreakdown: weekdayData
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error fetching analytics' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query; // 'weekly', 'monthly', 'streak'

    let leaderboardData = [];

    if (period === 'weekly' || period === 'monthly') {
      const durationDays = period === 'weekly' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - durationDays);
      startDate.setHours(0, 0, 0, 0);

      // Fetch all sessions in the period
      const sessions = await prisma.studySession.findMany({
        where: {
          startTime: { gte: startDate }
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              stats: { select: { currentStreak: true } }
            }
          }
        }
      });

      // Group and sum in memory
      const userMinutes: { [key: string]: { user: any; minutes: number } } = {};
      sessions.forEach(s => {
        if (!s.user) return;
        const uid = s.user.id;
        if (!userMinutes[uid]) {
          userMinutes[uid] = { user: s.user, minutes: 0 };
        }
        userMinutes[uid].minutes += s.durationMinutes;
      });

      leaderboardData = Object.values(userMinutes).map(entry => ({
        id: entry.user.id,
        username: entry.user.username,
        name: entry.user.name,
        avatar: entry.user.avatar,
        hours: parseFloat((entry.minutes / 60).toFixed(2)),
        streak: entry.user.stats?.currentStreak || 0
      }));

      // Sort by hours descending
      leaderboardData.sort((a, b) => b.hours - a.hours);
    } else {
      // Default or 'streak': rank by streak
      const stats = await prisma.userStats.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: {
          currentStreak: 'desc'
        },
        take: 50
      });

      leaderboardData = stats.map(s => ({
        id: s.user.id,
        username: s.user.username,
        name: s.user.name,
        avatar: s.user.avatar,
        hours: s.totalStudyHours,
        streak: s.currentStreak
      }));
    }

    // Limit to top 50
    res.json(leaderboardData.slice(0, 50));
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error fetching leaderboard' });
  }
};
