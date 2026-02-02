import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Api } from '../../services/api';
import { Trophy, Calendar, Users, ExternalLink, Search, Filter, MapPin, Clock, Award, Zap, Code, Brain, Rocket, Sparkles } from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  deadline: string;
  startDate: string;
  endDate: string;
  postedDate: string;
  prize: string;
  participants: number;
  mode: 'Online' | 'Offline' | 'Hybrid';
  location?: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  registrationUrl: string;
  status: 'Upcoming' | 'Ongoing' | 'Ended';
}

export const Hackathons: React.FC = () => {
  const { isDark } = useTheme();
  const [hackathonsData, setHackathonsData] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRecent, setFilterRecent] = useState<boolean>(false);

  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true);
      const data = await Api.getHackathons();
      setHackathonsData(data);
      setLoading(false);
    };
    fetchHackathons();
  }, []);

  const isRecentlyPosted = (postedDate: string) => {
    const posted = new Date(postedDate);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Posted within last 7 days
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ongoing': return 'bg-green-100 text-green-700';
      case 'Upcoming': return 'bg-blue-100 text-blue-700';
      case 'Ended': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-700';
      case 'Intermediate': return 'bg-amber-100 text-amber-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getLogoColor = (organizer: string) => {
    const colors: { [key: string]: string } = {
      'Google': 'from-blue-500 to-green-500',
      'Microsoft': 'from-blue-600 to-cyan-500',
      'Flipkart': 'from-yellow-400 to-blue-600',
      'Amazon': 'from-orange-500 to-yellow-500',
      'Government of India': 'from-orange-500 to-green-600',
      'Infosys': 'from-blue-600 to-indigo-600',
      'TCS': 'from-purple-600 to-pink-500',
      'Major League Hacking': 'from-red-500 to-blue-600',
    };
    return colors[organizer] || 'from-indigo-500 to-purple-600';
  };

  const filteredHackathons = hackathonsData
    .filter(hackathon => {
      const tags = Array.isArray(hackathon.tags) ? hackathon.tags : [];
      const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMode = filterMode === 'all' || hackathon.mode === filterMode;
      const matchesDifficulty = filterDifficulty === 'all' || hackathon.difficulty === filterDifficulty;
      const matchesStatus = filterStatus === 'all' || hackathon.status === filterStatus;
      const matchesRecent = !filterRecent || isRecentlyPosted(hackathon.postedDate);
      
      return matchesSearch && matchesMode && matchesDifficulty && matchesStatus && matchesRecent;
    })
    .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()); // Sort by recent first

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading hackathons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-1">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-5 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div className="p-2.5 md:p-3 bg-white/20 backdrop-blur rounded-xl">
            <Trophy size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Hackathons</h1>
            <p className="text-white/80 text-sm md:text-base">Discover and participate in hackathons</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Zap size={16} className="text-yellow-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{hackathonsData.filter(h => h.status === 'Ongoing').length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Ongoing</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Rocket size={16} className="text-blue-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{hackathonsData.filter(h => h.status === 'Upcoming').length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Upcoming</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Code size={16} className="text-green-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{hackathonsData.filter(h => h.mode === 'Online').length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Online</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Brain size={16} className="text-pink-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{hackathonsData.length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Total</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-3 md:p-4`}>
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border outline-none transition-all text-sm ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-violet-500' 
                  : 'bg-slate-50 border-slate-200 focus:border-violet-500'
              }`}
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl border outline-none text-sm flex-1 min-w-[100px] ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className={`px-3 py-2 rounded-xl border outline-none text-sm flex-1 min-w-[90px] ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">Mode</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className={`px-3 py-2 rounded-xl border outline-none text-sm flex-1 min-w-[90px] ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <button
              onClick={() => setFilterRecent(!filterRecent)}
              className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all text-sm ${
                filterRecent
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : isDark ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={14} />
              Recent
            </button>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {filteredHackathons.map((hackathon) => {
          const daysLeft = getDaysLeft(hackathon.deadline);
          const isRecent = isRecentlyPosted(hackathon.postedDate);
          
          return (
            <div 
              key={hackathon.id} 
              className={`${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'} rounded-2xl border overflow-hidden transition-all hover:shadow-lg group relative`}
            >
              {/* Recently Posted Badge */}
              {isRecent && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-gradient-to-r from-violet-500 to-purple-500 text-white flex items-center gap-1 shadow-lg">
                    <Sparkles size={10} className="md:w-3 md:h-3" />
                    New
                  </span>
                </div>
              )}
              
              {/* Card Header */}
              <div className="p-4 md:p-6">
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Logo */}
                  <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${getLogoColor(hackathon.organizer)} flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg flex-shrink-0`}>
                    {hackathon.logo}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`font-bold text-base md:text-lg truncate ${isDark ? 'text-white' : 'text-slate-800'} group-hover:text-violet-600 transition-colors`}>
                          {hackathon.title}
                        </h3>
                        <p className={`text-xs md:text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          by {hackathon.organizer}
                        </p>
                      </div>
                      <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold whitespace-nowrap ${getStatusColor(hackathon.status)} ${isRecent ? 'mr-12 md:mr-16' : ''}`}>
                        {hackathon.status}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                      {(Array.isArray(hackathon.tags) ? hackathon.tags : []).slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-medium ${
                            isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <p className={`mt-3 md:mt-4 text-xs md:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
                  {hackathon.description}
                </p>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 mt-3 md:mt-4">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Calendar size={14} className="text-violet-500 md:w-4 md:h-4" />
                    <div>
                      <p className={`text-[10px] md:text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deadline</p>
                      <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {new Date(hackathon.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Award size={14} className="text-amber-500 md:w-4 md:h-4" />
                    <div>
                      <p className={`text-[10px] md:text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Prize</p>
                      <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.prize}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <Users size={14} className="text-green-500 md:w-4 md:h-4" />
                    <div>
                      <p className={`text-[10px] md:text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Participants</p>
                      <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.participants.toLocaleString()}+
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <MapPin size={14} className="text-rose-500 md:w-4 md:h-4" />
                    <div>
                      <p className={`text-[10px] md:text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mode</p>
                      <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.mode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className={`px-4 md:px-6 py-3 md:py-4 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'} flex items-center justify-between gap-2`}>
                <div className="flex items-center gap-1.5 md:gap-3 flex-wrap">
                  <span className={`px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-semibold ${getDifficultyColor(hackathon.difficulty)}`}>
                    {hackathon.difficulty}
                  </span>
                  {daysLeft > 0 && daysLeft <= 7 && (
                    <span className="flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-semibold bg-red-100 text-red-700">
                      <Clock size={10} className="md:w-3 md:h-3" />
                      {daysLeft}d left
                    </span>
                  )}
                </div>
                
                <a
                  href={hackathon.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                >
                  Register
                  <ExternalLink size={12} className="md:w-3.5 md:h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredHackathons.length === 0 && (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-2xl border p-8 md:p-12 text-center`}>
          <Trophy size={40} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`text-base md:text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>No hackathons found</h3>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};
