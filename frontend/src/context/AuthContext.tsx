import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  stats?: {
    totalStudyHours: number;
    currentStreak: number;
    longestStreak: number;
    weeklyGoalHours: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name: string; bio?: string; avatar?: string; weeklyGoalHours?: number }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiFetch('/auth/me');
      setUser(data.user);
      connectSocket();
    } catch (err) {
      localStorage.removeItem('studysync_token');
      setUser(null);
      disconnectSocket();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('studysync_token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password })
      });
      localStorage.setItem('studysync_token', data.token);
      setUser(data.user);
      connectSocket();
    } catch (err) {
      throw err;
    }
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, username, email, password })
      });
      localStorage.setItem('studysync_token', data.token);
      setUser(data.user);
      connectSocket();
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('studysync_token');
    setUser(null);
    disconnectSocket();
  };

  const updateProfile = async (data: any) => {
    try {
      const response = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setUser(response.user);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
