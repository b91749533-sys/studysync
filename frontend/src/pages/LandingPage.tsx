import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Users, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  ArrowRight,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="h-20 px-6 md:px-12 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-border/20 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-2xl tracking-tight shadow-lg shadow-primary/20">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-tight tracking-tight">StudySync</h1>
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Collaborate</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              to="/dashboard" 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-1.5"
              >
                Register Free
                <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full text-center overflow-hidden">
          {/* Subtle top light gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2.5 bg-secondary text-primary border border-primary/20 px-4 py-2 rounded-full text-xs font-bold mb-8 animate-fade-in shadow-sm">
            <Sparkles className="w-4 h-4 fill-primary/10" />
            <span>The Ultimate Real-Time Student Workspace</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none max-w-4xl mx-auto mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            Study Together, Sync Progress, Achieve Greatness.
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Create real-time study rooms with synchronized Pomodoro timers, collaborative task boards, shared Markdown notes, and live chat. Elevate your learning environment today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to={user ? "/dashboard" : "/register"} 
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-primary/20 transition-transform active:scale-[0.98] flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/login" 
              className="bg-card hover:bg-secondary border border-border/80 font-bold px-8 py-4 rounded-2xl text-base transition-colors"
            >
              Join a Room Code
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto bg-card/40 backdrop-blur-md border border-border/60 rounded-3xl p-6 md:p-8">
            <div className="text-center p-3">
              <h3 className="text-3xl font-extrabold text-primary mb-1">100%</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Synchronized Timers</p>
            </div>
            <div className="text-center border-l border-border/60 p-3">
              <h3 className="text-3xl font-extrabold text-primary mb-1">Real-time</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Presence & Chat</p>
            </div>
            <div className="text-center border-l border-border/60 p-3">
              <h3 className="text-3xl font-extrabold text-primary mb-1">Active</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Collaborative Notes</p>
            </div>
            <div className="text-center border-l border-border/60 p-3">
              <h3 className="text-3xl font-extrabold text-primary mb-1">No Limits</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Study Rooms</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-secondary/30 border-y border-border/40 px-6">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Packaged with SaaS Grade Features</h2>
              <p className="text-muted-foreground font-medium max-w-xl mx-auto">Everything you and your peers need to study effectively in one cohesive, beautiful platform.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Sync Pomodoro Timers</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Focus cycles and breaks are managed server-side and broadcasted to everyone, keeping the entire team synced perfectly to the second.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Real-time presence</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  See who is currently active in the room. Track online counts, typing indicators, and receive system logs when members enter or leave.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Shared Notes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Draft documents, share guidelines, and compile summaries using Markdown formatting. Changes propagate in real time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Task Management</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Stay organized with a shared task list. Assign items to members, set deadlines, define priorities, and track progress together.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Personal Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Monitor your weekly study progression, daily focus sessions, and active streaks using interactive Recharts charts.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-card border border-border rounded-3xl p-8 hover:border-primary/30 transition-all duration-350 shadow-sm group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-350">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Leaderboards</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Stay motivated and compete friendly with other students. Filter rankings by weekly or monthly periods to track top focus achievers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-20 border-t border-border px-6 md:px-12 max-w-7xl mx-auto w-full flex items-center justify-between text-muted-foreground text-xs font-medium bg-background">
        <p>&copy; {new Date().getFullYear()} StudySync. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};
