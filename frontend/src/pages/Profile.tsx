import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Clock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name) {
      setError('Name is required.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name, bio, avatar });
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const generateNewAvatar = () => {
    if (!user) return;
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Student Profile</h2>
        <p className="text-muted-foreground font-medium text-sm">Manage your public information, avatar identifiers, and view stats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Stats column */}
        <div className="bg-card border border-border/80 p-6 rounded-3xl text-center space-y-6 flex flex-col justify-between">
          <div className="flex flex-col items-center">
            <img 
              src={avatar || user.avatar} 
              alt={user.username} 
              className="w-24 h-24 rounded-full border-4 border-primary/25 bg-muted mb-4 shadow"
            />
            <h3 className="font-extrabold text-lg">{user.name}</h3>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
            {user.bio ? (
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed font-medium px-4">{user.bio}</p>
            ) : (
              <p className="text-xs text-muted-foreground/60 italic mt-3 font-medium px-4">No bio drafted yet.</p>
            )}
          </div>

          {/* Quick micro stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-border pt-6">
            <div className="bg-secondary/40 p-3 rounded-2xl border border-border/30 text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Study Hours</span>
              <span className="text-sm font-black text-foreground mt-0.5 block">{user.stats?.totalStudyHours.toFixed(1) ?? 0}</span>
            </div>
            
            <div className="bg-secondary/40 p-3 rounded-2xl border border-border/30 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1 fill-orange-500/10" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Streak</span>
              <span className="text-sm font-black text-foreground mt-0.5 block">{user.stats?.currentStreak ?? 0} days</span>
            </div>
          </div>
        </div>

        {/* Right Info Form column */}
        <div className="bg-card border border-border/80 p-6 md:p-8 rounded-3xl md:col-span-2">
          <h3 className="font-extrabold text-base mb-6">Edit Profile Info</h3>

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Username (Read Only)
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full bg-secondary/20 border border-border/40 text-muted-foreground/70 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Bio Description
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share something about your study goals..."
                rows={3}
                className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-4 py-2.5 text-sm transition-all outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Avatar Image URL
              </label>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="flex-grow bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={generateNewAvatar}
                  className="bg-secondary hover:bg-secondary/80 border border-border/80 text-foreground font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
