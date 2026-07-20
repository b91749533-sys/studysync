import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { 
  Search, 
  Plus, 
  Users, 
  Globe, 
  Lock, 
  ArrowRight, 
  Hash,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  isPrivate: boolean;
  inviteCode: string;
  createdAt: string;
  _count: {
    members: number;
  };
  creator: {
    username: string;
    name: string;
    avatar: string;
  };
}

export const Rooms: React.FC = () => {
  const navigate = useNavigate();
  
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Join code states
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [inviteCode, setInviteCode] = useState('');
  
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchRooms = async () => {
    try {
      const [pubRes, myRes] = await Promise.all([
        apiFetch('/rooms/public'),
        apiFetch('/rooms/my')
      ]);
      setPublicRooms(pubRes);
      setJoinedRooms(myRes);
    } catch (err) {
      console.error('Failed to load study rooms', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    if (!inviteCode) return;

    setJoining(true);
    try {
      const res = await apiFetch('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() })
      });
      navigate(`/rooms/${res.roomId}`);
    } catch (err: any) {
      setJoinError(err.message || 'Invalid invite code.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded-lg w-1/4"></div>
          <div className="h-10 bg-muted rounded-xl w-32"></div>
        </div>
        <div className="h-14 bg-muted rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get unique subjects for filter dropdown
  const subjects = ['All', ...Array.from(new Set(publicRooms.map(r => r.subject)))];

  // Filter public rooms
  const filteredRooms = publicRooms.filter(room => {
    const matchesSearch = 
      room.name.toLowerCase().includes(search.toLowerCase()) || 
      (room.description && room.description.toLowerCase().includes(search.toLowerCase())) ||
      room.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || room.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Study Rooms</h2>
          <p className="text-muted-foreground font-medium text-sm">Join public study groups or collaborate privately via invite codes.</p>
        </div>
        <Link 
          to="/rooms/create" 
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-primary/10 flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Room
        </Link>
      </div>

      {/* Top action grid: Search & Invite Code Join */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search filters */}
        <div className="lg:col-span-2 bg-card border border-border/80 p-4 rounded-3xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search rooms name, subject or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-secondary/40 border border-border/60 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none cursor-pointer"
          >
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub} Subject</option>
            ))}
          </select>
        </div>

        {/* Join by code */}
        <div className="bg-card border border-border/80 p-4 rounded-3xl">
          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="INVITE CODE"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full bg-secondary/40 border border-border/60 focus:border-primary/80 focus:ring-1 focus:ring-primary/80 rounded-xl pl-9 pr-3 py-2.5 text-xs font-black tracking-widest uppercase transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={joining}
              className="bg-secondary hover:bg-secondary/80 border border-border/80 text-foreground font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer"
            >
              {joining ? 'Joining...' : 'Join Code'}
            </button>
          </form>
          {joinError && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-1">{joinError}</p>}
        </div>
      </div>

      {/* Main layout grids: My Rooms & Public Rooms */}
      <div className="space-y-10">
        {/* Section 1: Joined/My Rooms */}
        {joinedRooms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-extrabold text-lg">My Study Workspaces</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedRooms.map(room => (
                <div 
                  key={room.id}
                  className="bg-card border border-border/80 hover:border-primary/30 rounded-3xl p-5 shadow-sm transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">
                        {room.subject}
                      </span>
                      {room.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <h4 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors">{room.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {room.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                      <Users className="w-4 h-4" />
                      <span>{room._count.members} studying</span>
                    </div>
                    <Link 
                      to={`/rooms/${room.id}`}
                      className="text-xs font-bold text-primary hover:text-primary/90 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      Enter Room
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Explore Public Rooms */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-extrabold text-lg">Explore Public Study Rooms</h3>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="bg-card border border-border/60 p-12 rounded-3xl text-center flex flex-col items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-muted-foreground/40 animate-pulse" />
              <h4 className="font-bold text-sm">No Public Rooms Found</h4>
              <p className="text-xs text-muted-foreground max-w-sm">No rooms match your search. Try creating a public room for your peers to join!</p>
              <Link to="/rooms/create" className="text-xs font-bold text-primary hover:underline mt-2">Create a study room</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => {
                const isMember = joinedRooms.some(r => r.id === room.id);
                return (
                  <div 
                    key={room.id}
                    className="bg-card border border-border/80 hover:border-primary/30 rounded-3xl p-5 shadow-sm transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">
                          {room.subject}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          <span>{room._count.members}</span>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors">{room.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {room.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={room.creator.avatar} 
                          alt={room.creator.username}
                          className="w-6.5 h-6.5 rounded-full border border-border"
                        />
                        <span className="text-[10px] text-muted-foreground font-bold">@{room.creator.username}</span>
                      </div>
                      
                      {isMember ? (
                        <Link 
                          to={`/rooms/${room.id}`}
                          className="text-xs font-bold text-primary hover:text-primary/95 flex items-center gap-1"
                        >
                          Enter Room
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await apiFetch('/rooms/join', {
                                method: 'POST',
                                body: JSON.stringify({ inviteCode: room.inviteCode })
                              });
                              fetchRooms();
                              navigate(`/rooms/${room.id}`);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Join & Enter
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
