import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Rooms } from './pages/Rooms';
import { CreateRoom } from './pages/CreateRoom';
import { RoomDetails } from './pages/RoomDetails';
import { Analytics } from './pages/Analytics';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Workspace Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/create" element={<CreateRoom />} />
            <Route path="/rooms/:roomId" element={<RoomDetails />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
