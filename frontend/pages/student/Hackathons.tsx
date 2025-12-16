import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Trophy, Calendar, Users, ExternalLink, Search, Filter, MapPin, Clock, Award, Zap, Code, Brain, Rocket } from 'lucide-react';

interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  logo: string;
  deadline: string;
  startDate: string;
  endDate: string;
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

const hackathonsData: Hackathon[] = [
  {
    id: '1',
    title: 'Google Summer of Code 2025',
    organizer: 'Google',
    logo: 'G',
    deadline: '2025-04-02',
    startDate: '2025-05-27',
    endDate: '2025-08-25',
    prize: 'Stipend + Swag',
    participants: 18000,
    mode: 'Online',
    tags: ['Open Source', 'Coding', 'Mentorship'],
    difficulty: 'Intermediate',
    description: 'Contribute to open source projects with guidance from experienced mentors. A 12-week program for student developers.',
    registrationUrl: 'https://summerofcode.withgoogle.com/',
    status: 'Upcoming'
  },
  {
    id: '2',
    title: 'Microsoft Imagine Cup 2025',
    organizer: 'Microsoft',
    logo: 'M',
    deadline: '2025-02-15',
    startDate: '2025-03-01',
    endDate: '2025-05-30',
    prize: '₹75,00,000+',
    participants: 50000,
    mode: 'Hybrid',
    location: 'Seattle, USA (Finals)',
    tags: ['AI/ML', 'Cloud', 'Innovation'],
    difficulty: 'Advanced',
    description: 'Build innovative solutions using Microsoft technologies. Categories include Earth, Education, Healthcare, and Lifestyle.',
    registrationUrl: 'https://imaginecup.microsoft.com/',
    status: 'Upcoming'
  },
  {
    id: '3',
    title: 'Flipkart GRiD 6.0',
    organizer: 'Flipkart',
    logo: 'F',
    deadline: '2025-01-30',
    startDate: '2025-02-15',
    endDate: '2025-04-10',
    prize: '₹6,00,000',
    participants: 125000,
    mode: 'Online',
    tags: ['E-commerce', 'Problem Solving', 'Tech'],
    difficulty: 'Intermediate',
    description: 'India\'s largest tech challenge for engineering students. Solve real-world problems faced by Flipkart.',
    registrationUrl: 'https://unstop.com/hackathons/flipkart-grid',
    status: 'Ongoing'
  },
  {
    id: '4',
    title: 'Amazon ML Challenge 2025',
    organizer: 'Amazon',
    logo: 'A',
    deadline: '2025-03-10',
    startDate: '2025-03-20',
    endDate: '2025-05-15',
    prize: '₹5,00,000',
    participants: 80000,
    mode: 'Online',
    tags: ['Machine Learning', 'AI', 'Data Science'],
    difficulty: 'Advanced',
    description: 'Showcase your ML skills by solving Amazon\'s real-world challenges. Open to all engineering students.',
    registrationUrl: 'https://www.hackerearth.com/amazon-ml-challenge/',
    status: 'Upcoming'
  },
  {
    id: '5',
    title: 'Smart India Hackathon 2025',
    organizer: 'Government of India',
    logo: 'S',
    deadline: '2025-02-28',
    startDate: '2025-03-15',
    endDate: '2025-03-17',
    prize: '₹1,00,000 per problem',
    participants: 200000,
    mode: 'Hybrid',
    location: 'Multiple Nodal Centers',
    tags: ['Social Impact', 'Innovation', 'Government'],
    difficulty: 'Beginner',
    description: 'India\'s biggest hackathon to solve problems for government ministries and departments. 36-hour coding marathon.',
    registrationUrl: 'https://www.sih.gov.in/',
    status: 'Upcoming'
  },
  {
    id: '6',
    title: 'HackWithInfy 2025',
    organizer: 'Infosys',
    logo: 'I',
    deadline: '2025-04-15',
    startDate: '2025-05-01',
    endDate: '2025-06-30',
    prize: '₹2,00,000 + PPO',
    participants: 150000,
    mode: 'Online',
    tags: ['Coding', 'DSA', 'Problem Solving'],
    difficulty: 'Intermediate',
    description: 'A coding competition for engineering students with chance to win prizes and Pre-Placement Offers at Infosys.',
    registrationUrl: 'https://www.infosys.com/careers/hackwithinfy.html',
    status: 'Upcoming'
  },
  {
    id: '7',
    title: 'TCS CodeVita Season 12',
    organizer: 'TCS',
    logo: 'T',
    deadline: '2025-03-01',
    startDate: '2025-03-15',
    endDate: '2025-05-20',
    prize: '₹3,00,000 + Job Offer',
    participants: 300000,
    mode: 'Online',
    tags: ['Competitive Coding', 'Algorithms'],
    difficulty: 'Advanced',
    description: 'World\'s largest coding competition. Top performers get direct interview opportunities at TCS.',
    registrationUrl: 'https://www.tcscodevita.com/',
    status: 'Upcoming'
  },
  {
    id: '8',
    title: 'MLH Global Hack Week',
    organizer: 'Major League Hacking',
    logo: 'H',
    deadline: '2025-01-20',
    startDate: '2025-01-22',
    endDate: '2025-01-28',
    prize: 'Swag + Certificates',
    participants: 25000,
    mode: 'Online',
    tags: ['Learning', 'Community', 'Beginner Friendly'],
    difficulty: 'Beginner',
    description: 'A week-long celebration of hacking with daily challenges, workshops, and mini-hackathons.',
    registrationUrl: 'https://ghw.mlh.io/',
    status: 'Ongoing'
  }
];

export const Hackathons: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  const filteredHackathons = hackathonsData.filter(hackathon => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hackathon.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMode = filterMode === 'all' || hackathon.mode === filterMode;
    const matchesDifficulty = filterDifficulty === 'all' || hackathon.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === 'all' || hackathon.status === filterStatus;
    
    return matchesSearch && matchesMode && matchesDifficulty && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Hackathons</h1>
            <p className="text-white/80">Discover and participate in exciting hackathons</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-yellow-300" />
              <span className="text-2xl font-bold">{hackathonsData.filter(h => h.status === 'Ongoing').length}</span>
            </div>
            <p className="text-sm text-white/70">Ongoing</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Rocket size={20} className="text-blue-300" />
              <span className="text-2xl font-bold">{hackathonsData.filter(h => h.status === 'Upcoming').length}</span>
            </div>
            <p className="text-sm text-white/70">Upcoming</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Code size={20} className="text-green-300" />
              <span className="text-2xl font-bold">{hackathonsData.filter(h => h.mode === 'Online').length}</span>
            </div>
            <p className="text-sm text-white/70">Online</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-pink-300" />
              <span className="text-2xl font-bold">{hackathonsData.length}</span>
            </div>
            <p className="text-sm text-white/70">Total</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search hackathons, organizers, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none transition-all ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                  : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-3 rounded-xl border outline-none ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className={`px-4 py-3 rounded-xl border outline-none ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className={`px-4 py-3 rounded-xl border outline-none ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHackathons.map((hackathon) => {
          const daysLeft = getDaysLeft(hackathon.deadline);
          
          return (
            <div 
              key={hackathon.id} 
              className={`${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'} rounded-xl border overflow-hidden transition-all hover:shadow-lg group`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getLogoColor(hackathon.organizer)} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {hackathon.logo}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'} group-hover:text-indigo-600 transition-colors`}>
                          {hackathon.title}
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          by {hackathon.organizer}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {hackathon.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
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
                <p className={`mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
                  {hackathon.description}
                </p>
                
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-500" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deadline</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {new Date(hackathon.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Prize</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.prize}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-green-500" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Participants</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.participants.toLocaleString()}+
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-rose-500" />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mode</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                        {hackathon.mode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className={`px-6 py-4 border-t ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getDifficultyColor(hackathon.difficulty)}`}>
                    {hackathon.difficulty}
                  </span>
                  {daysLeft > 0 && daysLeft <= 7 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                      <Clock size={12} />
                      {daysLeft} days left
                    </span>
                  )}
                </div>
                
                <a
                  href={hackathon.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Register Now
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredHackathons.length === 0 && (
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-12 text-center`}>
          <Trophy size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>No hackathons found</h3>
          <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};
