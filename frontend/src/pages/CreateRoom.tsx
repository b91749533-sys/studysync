import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Plus, Globe, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !subject) {
      setError('Room name and subject category are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          subject: subject.trim(),
          isPrivate
        })
      });
      navigate(`/rooms/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create study room.');
    } finally {
      setLoading(false);
    }
  };

  const commonSubjects = ['Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Literature', 'History', 'Languages'];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link 
          to="/rooms" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Link>
      </div>

      <div className="bg-card border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-black tracking-tight">Create Study Room</h2>
          <p className="text-xs text-muted-foreground">Setup a new collaborative environment to study in real time.</p>
        </div>

        {error && (
          <div className="mb-5 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Room Name
            </label>
            <input
              type="text"
              placeholder="e.g. Algorithms Study Group"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none"
            />
          </div>

          {/* Subject category */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Subject Category
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none mb-2"
            />
            {/* Quick selectors */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {commonSubjects.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubject(sub)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    subject === sub 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-secondary/40 text-muted-foreground border-border/40 hover:bg-secondary/80'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Provide context about what you're studying in this room..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none resize-none"
            />
          </div>

          {/* Privacy Selectors */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Room Privacy
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Public option */}
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  !isPrivate 
                    ? 'bg-primary/5 border-primary text-foreground' 
                    : 'bg-card border-border hover:bg-secondary/35 text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl ${!isPrivate ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Public Room</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Anyone can see and join this room.</p>
                </div>
              </button>

              {/* Private option */}
              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isPrivate 
                    ? 'bg-primary/5 border-primary text-foreground' 
                    : 'bg-card border-border hover:bg-secondary/35 text-muted-foreground'
                }`}
              >
                <div className={`p-2 rounded-xl ${isPrivate ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Private Room</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Only joinable via private invite code.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-primary/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Plus className="w-4.5 h-4.5" />
                  Create Room Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
