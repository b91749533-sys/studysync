import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { 
  BarChart2, 
  Clock, 
  Activity, 
  CheckCircle, 
  Coffee,
  TrendingUp
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalHours: number;
    totalSessions: number;
    completedBreaks: number;
    currentWeekHours: number;
    lastWeekHours: number;
  };
  subjectBreakdown: Array<{
    subject: string;
    hours: number;
  }>;
  weekdayBreakdown: Array<{
    day: string;
    hours: number;
  }>;
}

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/stats/analytics');
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load focus analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-muted rounded-2xl"></div>
          <div className="h-80 bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl text-center">
        <p className="font-bold mb-2">Error Loading Analytics</p>
        <p className="text-sm">{error || 'Could not fetch your detailed analytics.'}</p>
      </div>
    );
  }

  const { summary, subjectBreakdown, weekdayBreakdown } = data;
  const hoursGrowth = summary.currentWeekHours - summary.lastWeekHours;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Focus Analytics</h2>
        <p className="text-muted-foreground font-medium text-sm">Review your long-term study patterns, subject distribution, and focus consistency.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Focus Time</p>
            <h3 className="text-2xl font-black mt-0.5">{summary.totalHours.toFixed(1)} hrs</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-green-500/10 text-green-500 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Focus Cycles</p>
            <h3 className="text-2xl font-black mt-0.5">{summary.totalSessions} cycles</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Coffee className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Breaks Taken</p>
            <h3 className="text-2xl font-black mt-0.5">{summary.completedBreaks} breaks</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">This Week vs Last</p>
            <h3 className="text-2xl font-black mt-0.5">
              {hoursGrowth >= 0 ? '+' : ''}{hoursGrowth.toFixed(1)} hrs
            </h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Focus Hours by Subject */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl space-y-6">
          <div>
            <h3 className="font-bold text-lg">Focus by Subject Category</h3>
            <p className="text-xs text-muted-foreground">Distribution of focus hours across different subjects</p>
          </div>

          {subjectBreakdown.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-muted-foreground text-xs italic gap-1.5">
              <BarChart2 className="w-7 h-7 text-muted-foreground/35 animate-pulse" />
              <span>No subject distribution data. Start studying in rooms!</span>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBreakdown} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid rgba(128,128,128,0.2)', fontSize: '11px', fontWeight: 'bold' }}
                    cursor={{ fill: 'rgba(128, 128, 128, 0.04)' }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Chart 2: Weekday Focus Trends */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Focus Trends by Weekday</h3>
              <p className="text-xs text-muted-foreground">Accumulated focus hours aggregated by days of the week</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1.5 rounded-lg border border-green-500/15">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Consistency Track</span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekdayBreakdown}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} width={25} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(128,128,128,0.2)', fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
