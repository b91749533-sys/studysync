import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { Trophy, Flame, Clock, Award, Star } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  hours: number;
  streak: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'streak'>('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/stats/leaderboard?period=${period}`);
        setLeaderboard(res);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch leaderboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [period]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Award className="w-5 h-5 text-yellow-500 fill-yellow-500/10" />;
    if (rank === 2) return <Award className="w-5 h-5 text-slate-400 fill-slate-400/10" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600 fill-amber-600/10" />;
    return <span className="text-xs text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground font-medium text-sm">Compete friendly with other students and track top weekly focus achievers.</p>
        </div>

        {/* Filter buttons */}
        <div className="bg-secondary/40 border border-border/80 p-1 rounded-2xl flex self-start shrink-0">
          {(['weekly', 'monthly', 'streak'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                period === p 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'streak' ? 'Streak Mode' : `${p} Hours`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3.5 animate-pulse">
          <div className="h-10 bg-muted rounded-xl w-full"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-2xl w-full"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl text-center">
          <p className="font-bold mb-2">Error Loading Leaderboard</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-card border border-border/60 p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-2">
          <Trophy className="w-9 h-9 text-muted-foreground/30 animate-pulse" />
          <h4 className="font-bold text-sm">No Focus Activity Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm">Be the first to log a Pomodoro focus cycle and claim rank #1 on the leaderboard!</p>
        </div>
      ) : (
        <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm">
          {/* Top 3 Podium Cards (on larger screens) */}
          <div className="hidden md:grid grid-cols-3 gap-5 p-6 border-b border-border/60 bg-secondary/15">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <div className="bg-card border border-border/60 p-5 rounded-3xl flex flex-col items-center justify-center text-center mt-6 h-48 relative">
                <span className="absolute top-3 left-4 text-xs font-black text-slate-400">#2</span>
                <img src={leaderboard[1].avatar} alt={leaderboard[1].username} className="w-14 h-14 rounded-full border-2 border-slate-300 bg-muted mb-3" />
                <h4 className="text-sm font-bold truncate max-w-xs">{leaderboard[1].name}</h4>
                <p className="text-[10px] text-muted-foreground">@{leaderboard[1].username}</p>
                <div className="flex items-center gap-1.5 mt-3.5 text-xs font-extrabold text-foreground">
                  {period === 'streak' ? (
                    <>
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
                      <span>{leaderboard[1].streak} Days</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{leaderboard[1].hours.toFixed(1)} hrs</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <div className="bg-card border-2 border-yellow-500/30 p-5 rounded-3xl flex flex-col items-center justify-center text-center h-54 relative shadow-lg shadow-yellow-500/5">
                <div className="absolute -top-3 bg-yellow-500 text-white p-1 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <span className="absolute top-3 left-4 text-xs font-black text-yellow-500">#1</span>
                <img src={leaderboard[0].avatar} alt={leaderboard[0].username} className="w-16 h-16 rounded-full border-2 border-yellow-500 bg-muted mb-3" />
                <h4 className="text-sm font-extrabold truncate max-w-xs">{leaderboard[0].name}</h4>
                <p className="text-[10px] text-muted-foreground">@{leaderboard[0].username}</p>
                <div className="flex items-center gap-1.5 mt-3.5 text-xs font-extrabold text-foreground">
                  {period === 'streak' ? (
                    <>
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10 animate-pulse" />
                      <span>{leaderboard[0].streak} Days</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{leaderboard[0].hours.toFixed(1)} hrs</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <div className="bg-card border border-border/60 p-5 rounded-3xl flex flex-col items-center justify-center text-center mt-10 h-44 relative">
                <span className="absolute top-3 left-4 text-xs font-black text-amber-600">#3</span>
                <img src={leaderboard[2].avatar} alt={leaderboard[2].username} className="w-12 h-12 rounded-full border-2 border-amber-600 bg-muted mb-3" />
                <h4 className="text-sm font-bold truncate max-w-xs">{leaderboard[2].name}</h4>
                <p className="text-[10px] text-muted-foreground">@{leaderboard[2].username}</p>
                <div className="flex items-center gap-1.5 mt-3.5 text-xs font-extrabold text-foreground">
                  {period === 'streak' ? (
                    <>
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
                      <span>{leaderboard[2].streak} Days</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{leaderboard[2].hours.toFixed(1)} hrs</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Complete Listings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-xs font-bold uppercase tracking-wider bg-secondary/10">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="py-4">Student</th>
                  <th className="py-4">Focus Hours</th>
                  <th className="py-4 text-right pr-6">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {leaderboard.map((student, index) => (
                  <tr key={student.id} className="hover:bg-secondary/15 transition-colors">
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center">
                        {getRankBadge(index + 1)}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.username} 
                          className="w-8 h-8 rounded-full border border-primary/10 bg-muted shrink-0"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold">{student.name}</p>
                          <p className="text-[10px] text-muted-foreground">@{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-xs text-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {student.hours.toFixed(1)} hrs
                      </span>
                    </td>
                    <td className="py-3 text-right pr-6 font-bold text-xs">
                      <span className="inline-flex items-center gap-1 text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-lg border border-orange-500/10">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        {student.streak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
