import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Menu, Sun, Moon, Sparkles } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">Synchronizing workspace...</p>
      </div>
    );
  }

  // Redirect to login if user session is not available
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onCloseMobile={() => setMobileOpen(false)} />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-4 md:px-8 border-b border-border/80 flex items-center justify-between bg-card/50 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Productivity Active</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 bg-secondary hover:bg-secondary/80 rounded-xl transition-all border border-border/30"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-yellow-400" />}
            </button>

            {/* User details header link */}
            <Link to="/profile" className="flex items-center gap-2.5 p-1.5 hover:bg-secondary rounded-xl transition-colors">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-primary/20 bg-muted"
              />
              <span className="hidden sm:inline text-xs font-semibold pr-1">{user.name}</span>
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
