import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { 
  Clock, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Calendar,
  Plus,
  Play,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface DashboardData {
  stats: {
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;
    weeklyGoalHours: number;
    completedTasks: number;
    joinedRoomsCount: number;
  };
  joinedRooms: Array<{
    id: string;
    name: string;
    subject: string;
  }>;
  recentSessions: Array<{
    id: string;
    roomName: string;
    durationMinutes: number;
    type: string;
    createdAt: string;
  }>;
  weeklyActivity: Array<{
    day: string;
    date: string;
    hours: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiFetch('/stats/dashboard');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 bg-muted rounded-lg w-1/3"></div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-2xl"></div>
          ))}
        </div>

        {/* Charts & sessions skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-muted rounded-2xl"></div>
          <div className="h-80 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl text-center">
        <p className="font-bold mb-2">Error Loading Dashboard</p>
        <p className="text-sm">{error || 'Could not fetch workspace statistics.'}</p>
      </div>
    );
  }

  const { stats, joinedRooms, recentSessions, weeklyActivity } = data;

  // Calculate goal percentage
  const totalWeeklyStudyHours = weeklyActivity.reduce((sum, day) => sum + day.hours, 0);
  const goalProgressPercent = Math.min(
    Math.round((totalWeeklyStudyHours / stats.weeklyGoalHours) * 100),
    100
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Personal Workspace</h2>
          <p className="text-muted-foreground font-medium text-sm">Welcome back! Review your focus progress and study syncs.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/rooms" 
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-1.5"
          >
            <Plus className="w-4.5 h-4.5" />
            Join Study Room
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Study Hours */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Focus Time</span>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.totalStudyHours.toFixed(1)} hrs</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Accumulated overall</p>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Streak</span>
            <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-xl">
              <Flame className="w-5 h-5 fill-orange-500/20" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.currentStreak} days</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Longest: {stats.longestStreak} days</p>
          </div>
        </div>

        {/* Card 3: Weekly Goal */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Weekly Goal Progress</span>
            <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-2xl font-black">{totalWeeklyStudyHours.toFixed(1)} / {stats.weeklyGoalHours} hrs</h3>
              <span className="text-xs font-bold text-green-500">{goalProgressPercent}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Completed Tasks */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Tasks</span>
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black">{stats.completedTasks} tasks</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Across all workspace rooms</p>
          </div>
        </div>
      </div>

      {/* Chart & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity chart */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Weekly Focus Activity</h3>
              <p className="text-xs text-muted-foreground">Focus hours logged during the last 7 days</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active Cycle</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} width={25} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(128,128,128,0.2)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }} 
                  cursor={{ fill: 'rgba(128, 128, 128, 0.05)' }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Joined Rooms */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Joined Rooms</h3>
              <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                {stats.joinedRoomsCount}
              </span>
            </div>

            {joinedRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-xs font-semibold">You haven't joined any rooms yet.</p>
                <Link to="/rooms" className="text-xs font-bold text-primary hover:underline mt-1">Browse study rooms</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {joinedRooms.map(room => (
                  <Link 
                    key={room.id} 
                    to={`/rooms/${room.id}`}
                    className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/60 border border-border/40 hover:border-border rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8.5 h-8.5 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                        {room.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold group-hover:text-primary transition-colors">{room.name}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">{room.subject}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {joinedRooms.length > 0 && (
            <Link to="/rooms" className="text-xs font-bold text-primary hover:underline mt-4 flex items-center gap-1 justify-center">
              View all joined rooms
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent study sessions list */}
      <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl">
        <h3 className="font-bold text-lg mb-5">Recent Focus Sessions</h3>

        {recentSessions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Calendar className="w-9 h-9 text-muted-foreground/40" />
            <p className="text-xs font-semibold">No recent sessions recorded.</p>
            <p className="text-[10px] text-muted-foreground max-w-xs">Complete a Pomodoro timer in a study room to record focus minutes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentSessions.map(session => (
                  <tr key={session.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="py-3 font-semibold text-xs">{session.roomName}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                        <Play className="w-2.5 h-2.5 fill-primary" />
                        {session.type}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-xs">{session.durationMinutes} mins</td>
                    <td className="py-3 text-muted-foreground text-xs font-medium">
                      {new Date(session.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
