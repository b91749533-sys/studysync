import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { 
  Users, 
  Send, 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Lock, 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Sparkles,
  Edit2
} from 'lucide-react';

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    bio: string | null;
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: {
    id: string;
    username: string;
    name: string;
    avatar: string;
  } | null;
}

interface Note {
  id: string;
  title: string;
  content: string;
  lastEditedBy: {
    name: string;
    username: string;
  };
}

interface ChatMsg {
  id: string;
  message: string;
  isSystem: boolean;
  createdAt: string;
  user?: {
    username: string;
    name: string;
    avatar: string;
  };
}

interface ActivePresenceUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  socketId: string;
}

export const RoomDetails: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  // Core UI states
  const [roomName, setRoomName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Presence & Chat
  const [onlineUsers, setOnlineUsers] = useState<ActivePresenceUser[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any | null>(null);

  // Pomodoro
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerIsRunning, setTimerIsRunning] = useState(false);
  const [timerType, setTimerType] = useState<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK'>('POMODORO');

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Notes
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notesEditMode, setNotesEditMode] = useState(false);

  // Web Audio Synth for Pomodoro buzzer
  const playBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.35); // duration
    } catch (e) {
      console.error('Failed to trigger audio synthesis:', e);
    }
  };

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await apiFetch(`/rooms/${roomId}`);
        setRoomName(res.name);
        setSubject(res.subject);
        setDescription(res.description || '');
        setIsPrivate(res.isPrivate);
        setInviteCode(res.inviteCode);
        setMembers(res.members);
        setTasks(res.tasks);
        setMessages(res.chatMessages);
        setNotes(res.notes);
        if (res.notes.length > 0) {
          setSelectedNote(res.notes[0]);
          setNoteTitle(res.notes[0].title);
          setNoteContent(res.notes[0].content);
        }
      } catch (err: any) {
        setError(err.message || 'Access denied or room not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Socket Connections & Listeners
  useEffect(() => {
    if (loading || error) return;
    
    const socket = connectSocket();

    // 1. Join room
    socket.emit('join_room', { roomId });

    // 2. Setup listeners
    socket.on('room_users', (users: ActivePresenceUser[]) => {
      setOnlineUsers(users);
    });

    socket.on('new_message', (msg: ChatMsg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', ({ name, isTyping }) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        if (isTyping) {
          updated[name] = true;
        } else {
          delete updated[name];
        }
        return updated;
      });
    });

    socket.on('timer_state', ({ remainingSeconds, isRunning, timerType }) => {
      setTimerSeconds(remainingSeconds);
      setTimerIsRunning(isRunning);
      setTimerType(timerType);
    });

    socket.on('timer_tick', ({ remainingSeconds, isRunning, timerType }) => {
      setTimerSeconds(remainingSeconds);
      setTimerIsRunning(isRunning);
      setTimerType(timerType);
    });

    socket.on('timer_completed', ({ timerType: completedType }) => {
      playBuzzer();
      alert(`focus timer completed: ${completedType} session finished.`);
    });

    socket.on('stats_updated', () => {
      // Refresh current user stats dynamically if profile info updates
    });

    // Task Sync
    socket.on('task_sync', ({ task, action }) => {
      setTasks(prev => {
        if (action === 'create') {
          return [...prev.filter(t => t.id !== task.id), task];
        } else if (action === 'update') {
          return prev.map(t => t.id === task.id ? task : t);
        } else if (action === 'delete') {
          return prev.filter(t => t.id !== task.id);
        }
        return prev;
      });
    });

    // Note Sync
    socket.on('note_sync', ({ note }) => {
      setNotes(prev => prev.map(n => n.id === note.id ? note : n));
      setSelectedNote(curr => {
        if (curr && curr.id === note.id) {
          // If not currently editing, sync the content
          if (!notesEditMode) {
            setNoteContent(note.content);
            setNoteTitle(note.title);
          }
          return note;
        }
        return curr;
      });
    });

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('room_users');
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('timer_state');
      socket.off('timer_tick');
      socket.off('timer_completed');
      socket.off('stats_updated');
      socket.off('task_sync');
      socket.off('note_sync');
    };
  }, [loading, error, roomId, notesEditMode]);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat actions
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const socket = getSocket();
    socket.emit('send_message', { roomId, message: chatInput.trim() });
    setChatInput('');

    // Trigger typing stop
    socket.emit('typing', { roomId, isTyping: false });
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    const socket = getSocket();

    socket.emit('typing', { roomId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { roomId, isTyping: false });
    }, 2000);
  };

  // Pomodoro Actions
  const startTimer = (minutes: number, type: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    const socket = getSocket();
    socket.emit('start_timer', { roomId, durationMinutes: minutes, timerType: type });
  };

  const pauseTimer = () => {
    const socket = getSocket();
    socket.emit('pause_timer', { roomId });
  };

  const resetTimer = (minutes: number, type: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    const socket = getSocket();
    socket.emit('reset_timer', { roomId, durationMinutes: minutes, timerType: type });
  };

  // Tasks actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const created = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          roomId,
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          priority: taskPriority,
          dueDate: taskDueDate || null,
          assigneeId: taskAssignee || null
        })
      });

      setTasks(prev => [...prev, created]);
      
      // Emit socket notification
      const socket = getSocket();
      socket.emit('task_updated', { roomId, task: created, action: 'create' });

      // Reset form
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskDueDate('');
      setTaskAssignee('');
      setShowTaskForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      const updated = await apiFetch(`/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
      
      const socket = getSocket();
      socket.emit('task_updated', { roomId, task: updated, action: 'update' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiFetch(`/tasks/${taskId}`, {
        method: 'DELETE'
      });

      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      const socket = getSocket();
      socket.emit('task_updated', { roomId, task: { id: taskId }, action: 'delete' });
    } catch (err) {
      console.error(err);
    }
  };

  // Notes actions
  const handleSaveNote = async () => {
    if (!noteTitle.trim()) return;
    try {
      if (selectedNote) {
        // Update
        const updated = await apiFetch(`/notes/${selectedNote.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: noteTitle, content: noteContent })
        });
        setNotes(prev => prev.map(n => n.id === selectedNote.id ? updated : n));
        setSelectedNote(updated);
        
        const socket = getSocket();
        socket.emit('note_updated', { roomId, note: updated });
      } else {
        // Create
        const created = await apiFetch('/notes', {
          method: 'POST',
          body: JSON.stringify({ roomId, title: noteTitle, content: noteContent })
        });
        setNotes(prev => [...prev, created]);
        setSelectedNote(created);
      }
      setNotesEditMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewNote = () => {
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNotesEditMode(true);
  };

  // Helper formatting for Pomodoro timer clock
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Custom Local Markdown parser to HTML
  const renderNoteMarkdown = (text: string) => {
    if (!text) return <p className="text-muted-foreground text-xs italic">No content typed yet. Click Edit to write notes.</p>;
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl font-extrabold my-3 pb-1 border-b border-border/40 text-foreground">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold my-2 pb-0.5 text-foreground">$2</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-sm my-0.5 text-muted-foreground">$1</li>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded font-mono text-[11px] text-primary">$1</code>');
    html = html.replace(/\n/g, '<br />');

    return <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] flex-col gap-3">
        <div className="w-9 h-9 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-semibold">Configuring collaborative workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-3xl text-center space-y-4">
        <h3 className="font-extrabold">Room Join Error</h3>
        <p className="text-xs leading-relaxed">{error}</p>
        <Link to="/rooms" className="inline-flex items-center gap-1 bg-secondary text-foreground text-xs font-bold px-4 py-2 rounded-xl border border-border">
          <ArrowLeft className="w-4 h-4" /> Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-100px)] min-h-[500px]">
      
      {/* 1. LEFT COLUMN: Workstation central controls & timer (2 cols wide on desktop) */}
      <div className="lg:col-span-3 flex flex-col gap-5 h-full overflow-y-auto pr-1">
        
        {/* Workspace Title & Invite Link */}
        <div className="bg-card border border-border/80 p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/15 uppercase tracking-wide">
                {subject}
              </span>
              {isPrivate ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
            <h3 className="font-extrabold text-xl">{roomName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
          </div>
          
          {/* Invite code COPY */}
          <div className="bg-secondary/40 border border-border/60 p-2.5 rounded-2xl flex items-center justify-between gap-3 shrink-0 sm:w-60">
            <div>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Invite Code</p>
              <p className="text-xs font-black tracking-widest text-foreground font-mono">{inviteCode}</p>
            </div>
            <button
              onClick={copyInviteCode}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                copied ? 'bg-green-500 text-white' : 'bg-card border border-border hover:bg-secondary'
              }`}
            >
              {copied ? <CheckCircle className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Dynamic Pomodoro Timer Card */}
        <div className="bg-card border border-border/80 rounded-3xl p-5 md:p-6 text-center flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Timer status badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synchronized Server Timer</span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2 mt-4 md:mt-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {timerType.replace('_', ' ')} MODE
            </span>
            <div className="text-5xl md:text-6xl font-black font-mono tracking-tight text-foreground select-none">
              {formatTime(timerSeconds)}
            </div>
            <div className="flex justify-center md:justify-start gap-1">
              <button 
                onClick={() => resetTimer(25, 'POMODORO')}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer ${timerType === 'POMODORO' ? 'bg-primary/15 text-primary border-primary/25' : 'bg-secondary/40 text-muted-foreground border-border/50'}`}
              >
                Focus (25m)
              </button>
              <button 
                onClick={() => resetTimer(5, 'SHORT_BREAK')}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer ${timerType === 'SHORT_BREAK' ? 'bg-primary/15 text-primary border-primary/25' : 'bg-secondary/40 text-muted-foreground border-border/50'}`}
              >
                Short Break (5m)
              </button>
              <button 
                onClick={() => resetTimer(15, 'LONG_BREAK')}
                className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors cursor-pointer ${timerType === 'LONG_BREAK' ? 'bg-primary/15 text-primary border-primary/25' : 'bg-secondary/40 text-muted-foreground border-border/50'}`}
              >
                Long Break (15m)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {timerIsRunning ? (
              <button
                onClick={pauseTimer}
                className="w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Pause className="w-6 h-6 fill-white" />
              </button>
            ) : (
              <button
                onClick={() => startTimer(timerSeconds / 60, timerType)}
                className="w-14 h-14 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                <Play className="w-6 h-6 fill-primary-foreground ml-1" />
              </button>
            )}

            <button
              onClick={() => resetTimer(timerType === 'POMODORO' ? 25 : timerType === 'SHORT_BREAK' ? 5 : 15, timerType)}
              className="w-11 h-11 bg-secondary hover:bg-secondary/80 border border-border/80 text-muted-foreground hover:text-foreground rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-secondary/30 border border-border/60 p-1.5 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tasks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Shared Tasks Board
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Collaborative Notes
          </button>
        </div>

        {/* Tab Content 1: Task Board */}
        {activeTab === 'tasks' && (
          <div className="bg-card border border-border/80 p-5 rounded-3xl flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <h4 className="font-extrabold text-base">Shared Tasks List</h4>
                  <p className="text-[10px] text-muted-foreground">Collaborate on assignments and focus outputs</p>
                </div>
                <button
                  onClick={() => setShowTaskForm(prev => !prev)}
                  className="bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border/80 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>

              {/* Task Creation Form */}
              {showTaskForm && (
                <form onSubmit={handleCreateTask} className="bg-secondary/30 border border-border/60 p-4 rounded-2xl space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      placeholder="Task Title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full bg-card border border-border/80 focus:border-primary/80 rounded-xl px-3 py-2 text-xs transition-all outline-none"
                    />
                    <select
                      value={taskAssignee}
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full bg-card border border-border/80 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {members.map(m => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Description (Optional)"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-card border border-border/80 focus:border-primary/80 rounded-xl px-3 py-2 text-xs transition-all outline-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-card border border-border/80 rounded-xl px-3 py-2 text-xs outline-none"
                    />
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full bg-card border border-border/80 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
                    >
                      <option value="LOW">Low Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="HIGH">High Priority</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="bg-transparent hover:bg-secondary px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Save Task
                    </button>
                  </div>
                </form>
              )}

              {/* Tasks listings */}
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs font-semibold">No tasks created yet.</p>
                  <p className="text-[10px]">Add tasks and assign them to keep the study session active.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center justify-between p-3.5 bg-secondary/20 hover:bg-secondary/40 border border-border/50 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                            task.status === 'DONE' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-muted-foreground hover:border-primary'
                          }`}
                        >
                          {task.status === 'DONE' && <span className="text-[10px] font-black">✓</span>}
                        </button>
                        
                        <div className="text-left min-w-0">
                          <p className={`text-xs font-bold truncate ${task.status === 'DONE' ? 'line-through text-muted-foreground font-medium' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[10px] text-muted-foreground truncate">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {/* Priority */}
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${
                              task.priority === 'HIGH' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/15' 
                                : task.priority === 'MEDIUM' 
                                ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/15' 
                                : 'bg-blue-500/10 text-blue-500 border-blue-500/15'
                            }`}>
                              {task.priority}
                            </span>
                            {/* Due date */}
                            {task.dueDate && (
                              <span className="text-[8px] font-semibold text-muted-foreground flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
                            <img 
                              src={task.assignee.avatar} 
                              alt={task.assignee.username} 
                              className="w-6 h-6 rounded-full border border-primary/20"
                            />
                            <span className="text-[9px] text-muted-foreground font-bold hidden sm:inline">@{task.assignee.username}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-muted-foreground/60 italic font-semibold hidden sm:inline">Unassigned</span>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 hover:bg-red-500/15 text-muted-foreground hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content 2: Notes Area */}
        {activeTab === 'notes' && (
          <div className="bg-card border border-border/80 p-5 rounded-3xl flex-1 flex flex-col md:flex-row gap-5">
            {/* Notes Sidebar list */}
            <div className="w-full md:w-52 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/50 pb-4 md:pb-0 md:pr-4 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saved Notes</span>
                  <button
                    onClick={handleCreateNewNote}
                    className="p-1 hover:bg-secondary rounded text-primary hover:text-primary-foreground transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {notes.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic font-semibold">No notes drafted.</p>
                ) : (
                  <div className="space-y-1.5 flex flex-col">
                    {notes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setSelectedNote(n);
                          setNoteTitle(n.title);
                          setNoteContent(n.content);
                          setNotesEditMode(false);
                        }}
                        className={`text-left text-xs px-2.5 py-2 rounded-lg font-bold transition-all truncate border ${
                          selectedNote?.id === n.id 
                            ? 'bg-primary/5 text-primary border-primary/20' 
                            : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary'
                        }`}
                      >
                        {n.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Note Editor Workspace */}
            <div className="flex-1 flex flex-col justify-between min-h-[300px]">
              {notesEditMode ? (
                <div className="flex-grow flex flex-col gap-3.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Note Title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="flex-grow bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl px-3.5 py-2 text-xs font-bold transition-all outline-none"
                    />
                    <button
                      onClick={handleSaveNote}
                      className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                  <textarea
                    placeholder="Markdown supported: # Header, **bold**, *italic*, - list, `code`..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={10}
                    className="flex-grow w-full bg-secondary/40 border border-border/60 focus:border-primary/80 rounded-xl p-3.5 text-xs font-mono transition-all outline-none resize-none"
                  />
                </div>
              ) : (
                <div className="flex-grow flex flex-col gap-4">
                  {selectedNote ? (
                    <>
                      <div className="flex justify-between items-center border-b border-border/40 pb-2">
                        <div className="text-left">
                          <h4 className="font-extrabold text-base">{selectedNote.title}</h4>
                          <p className="text-[9px] text-muted-foreground font-semibold">
                            Last edited by {selectedNote.lastEditedBy.name} (@{selectedNote.lastEditedBy.username})
                          </p>
                        </div>
                        <button
                          onClick={() => setNotesEditMode(true)}
                          className="bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border/80 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit Note
                        </button>
                      </div>
                      <div className="flex-grow max-h-[300px] overflow-y-auto px-1.5 py-1">
                        {renderNoteMarkdown(noteContent)}
                      </div>
                    </>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground gap-2 py-10">
                      <FileText className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-xs font-semibold">No Note Selected</p>
                      <button 
                        onClick={handleCreateNewNote} 
                        className="text-xs font-bold text-primary hover:underline mt-1"
                      >
                        Create your first study note
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. RIGHT COLUMN: Chat Client & Presence Users (1 col wide on desktop) */}
      <div className="bg-card border border-border/80 rounded-3xl p-4 flex flex-col justify-between h-full min-h-[450px]">
        {/* Active Members & Presence */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Active Presence
            </h4>
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
              {onlineUsers.length} online
            </span>
          </div>

          {/* Active members avatars list */}
          <div className="space-y-2 flex-grow overflow-y-auto max-h-[140px] pr-1 mb-4 border-b border-border/40 pb-3">
            {onlineUsers.map(ou => (
              <div key={ou.id} className="flex items-center gap-2">
                <div className="relative">
                  <img src={ou.avatar} alt={ou.name} className="w-7 h-7 rounded-full border border-primary/20 bg-muted" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-card" />
                </div>
                <div className="text-left leading-none">
                  <p className="text-[11px] font-bold truncate max-w-[130px]">{ou.name}</p>
                  <p className="text-[9px] text-muted-foreground">@{ou.username}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Room Chat Columns */}
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-left">Room Chat</span>
            
            {/* Messages box */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-2 max-h-[220px]">
              {messages.map(msg => (
                <div key={msg.id} className="text-left">
                  {msg.isSystem ? (
                    <p className="text-[9px] text-muted-foreground text-center italic py-0.5">{msg.message}</p>
                  ) : (
                    <div className="flex gap-2 items-start">
                      <img src={msg.user?.avatar} alt={msg.user?.name} className="w-6.5 h-6.5 rounded-full bg-muted border border-border shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[10px] font-extrabold truncate max-w-[80px]">{msg.user?.name}</span>
                          <span className="text-[8px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground bg-secondary/35 border border-border/30 rounded-2xl rounded-tl-none px-3 py-1.5 mt-0.5 leading-normal break-words">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Typists list */}
            {Object.keys(typingUsers).length > 0 && (
              <p className="text-[9px] text-muted-foreground italic mb-1.5 text-left animate-pulse">
                {Object.keys(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
              </p>
            )}

            {/* Message input */}
            <form onSubmit={sendChatMessage} className="flex gap-1.5 mt-1">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={handleChatInputChange}
                className="flex-1 bg-secondary/50 border border-border/80 focus:border-primary/80 rounded-xl px-3 py-2 text-xs transition-all outline-none"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};
