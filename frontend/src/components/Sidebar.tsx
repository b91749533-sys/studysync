import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  BarChart2, 
  User, 
  Settings, 
  LogOut, 
  Flame 
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rooms', label: 'Study Rooms', icon: BookOpen },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col justify-between p-4">
      {/* Header logo */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl tracking-tight shadow-lg shadow-primary/20">
            S
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">StudySync</h1>
            <span className="text-xs text-muted-foreground font-medium">Collaborative Hub</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile footer & Streak */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        {user && (
          <div className="flex items-center justify-between bg-secondary/40 p-2.5 rounded-2xl border border-border/20">
            <div className="flex items-center gap-2.5">
              <img 
                src={user.avatar} 
                alt={user.username} 
                className="w-10 h-10 rounded-full border-2 border-primary/20 bg-muted"
              />
              <div className="text-left">
                <p className="text-xs font-bold truncate max-w-[110px]">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[110px]">@{user.username}</p>
              </div>
            </div>
            
            {/* Streak count */}
            <div className="flex items-center gap-0.5 bg-orange-500/10 text-orange-500 px-2 py-1 rounded-lg text-xs font-bold border border-orange-500/20">
              <Flame className="w-4 h-4 fill-orange-500" />
              <span>{user.stats?.currentStreak ?? 0}</span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-left text-sm font-medium text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
