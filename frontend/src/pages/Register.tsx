import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, username.trim().toLowerCase(), email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Username or email might be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-2xl tracking-tight shadow-lg shadow-primary/20">
            S
          </div>
          <span className="font-extrabold text-2xl tracking-tight">StudySync</span>
        </div>
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-foreground">
          Create your free account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:text-primary/90 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-card border border-border/80 py-8 px-6 shadow-xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold px-4 py-3 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-secondary/50 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                placeholder="Alex Morgan"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-secondary/50 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                placeholder="alexmorgan"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/50 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Password (min 6 chars)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary/50 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-primary-foreground font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-primary/10 select-none cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-border/60 pt-6 text-center">
            <Link to="/" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
