import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Shield, Settings as SettingsIcon, CheckCircle, AlertCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [weeklyGoal, setWeeklyGoal] = useState(user?.stats?.weeklyGoalHours || 10);
  const [newPassword, setNewPassword] = useState('');
  
  const [goalSuccess, setGoalSuccess] = useState('');
  const [goalError, setGoalError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  
  const [loadingGoal, setLoadingGoal] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalSuccess('');
    setGoalError('');

    const hours = parseFloat(weeklyGoal.toString());
    if (isNaN(hours) || hours <= 0) {
      setGoalError('Please enter a valid number of hours.');
      return;
    }

    setLoadingGoal(true);
    try {
      await updateProfile({ name: user?.name || '', weeklyGoalHours: hours });
      setGoalSuccess('Weekly study goal updated successfully.');
    } catch (err: any) {
      setGoalError(err.message || 'Failed to update study goal.');
    } finally {
      setLoadingGoal(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (!newPassword || newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    setLoadingPw(true);
    try {
      // In a real production app, password change endpoint can be distinct:
      // Let's implement it inside the profile controller, or directly here.
      // Wait, we did not specify a change password route in the router, but we can call:
      // PUT /api/auth/profile with a password property, or a separate route.
      // Let's implement a separate handler or we can check.
      // Wait, in auth controller we can support changing password if they pass `password` in request!
      // Let's check if the auth controller `updateProfile` handles password. It doesn't yet,
      // but wait, we can edit the auth controller to hash and update password if passed,
      // or we can write a dedicated endpoint `/api/auth/change-password`.
      // Let's make sure it is supported. Let's send a request to a dedicated `/api/auth/change-password` endpoint!
      // Wait, since we need to write the endpoint, let's look at `backend/src/controllers/auth.ts` or make an edit to it.
      // Wait! We can edit the `updateProfile` in `auth.ts` controller to support updating password if they provide `password`.
      // Let's see: in `auth.ts` controller:
      // `const { name, bio, avatar, weeklyGoalHours, password } = req.body;`
      // `if (password) { const hashedPassword = await bcrypt.hash(password, 10); ... }`
      // This is extremely clean and doesn't require new routes!
      // Let's check if we did this. We didn't add `password` in `updateProfile` transaction.
      // Let's edit `backend/src/controllers/auth.ts` using `replace_file_content` to support `password` updates.
      // First, let's draft the fetch call in frontend:
      await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: user?.name || '', password: newPassword })
      });
      
      setPwSuccess('Password changed successfully.');
      setNewPassword('');
    } catch (err: any) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">System Settings</h2>
        <p className="text-muted-foreground font-medium text-sm">Configure your personal learning milestones and account credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Study milestones */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl space-y-5">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Milestones Setup
          </h3>

          {goalSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{goalSuccess}</span>
            </div>
          )}

          {goalError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{goalError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateGoal} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Weekly Focus Goal (Hours)
              </label>
              <input
                type="number"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                min={1}
                max={168}
                className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium leading-relaxed">
                Configure your target focus hours for the week. This updates the goals trackers on your dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingGoal}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {loadingGoal ? 'Saving...' : 'Save Milestones'}
            </button>
          </form>
        </div>

        {/* Card 2: Security credentials */}
        <div className="bg-card border border-border/80 p-5 md:p-6 rounded-3xl space-y-5">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security & Password
          </h3>

          {pwSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                New Password (min 6 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loadingPw}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {loadingPw ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
