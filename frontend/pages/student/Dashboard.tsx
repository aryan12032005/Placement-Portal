import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application, Job } from '../../types';
import { 
  Briefcase, CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight, Send,
  Rocket, Calendar, MapPin, Building2, Zap, Trophy, Code, Users, Star,
  ExternalLink, Timer, IndianRupee, BookOpen, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock hackathons data (you can move this to API later)
const mockHackathons = [
  {
    id: '1',
    title: 'Google Summer of Code 2026',
    organizer: 'Google',
    deadline: '2026-04-15',
    prize: '$3000',
    type: 'Remote',
    tags: ['Open Source', 'Coding'],
    participants: 15000,
  },
  {
    id: '2',
    title: 'Microsoft Imagine Cup',
    organizer: 'Microsoft',
    deadline: '2026-03-20',
    prize: '$100,000',
    type: 'Hybrid',
    tags: ['AI/ML', 'Innovation'],
    participants: 8000,
  },
  {
    id: '3',
    title: 'Flipkart GRiD 6.0',
    organizer: 'Flipkart',
    deadline: '2026-02-28',
    prize: '₹5,00,000',
    type: 'Online',
    tags: ['E-commerce', 'Tech'],
    participants: 25000,
  },
  {
    id: '4',
    title: 'Amazon ML Challenge',
    organizer: 'Amazon',
    deadline: '2026-03-10',
    prize: '₹3,00,000',
    type: 'Online',
    tags: ['Machine Learning', 'Data'],
    participants: 12000,
  },
];

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Job[]>([]);
  const [hackathons] = useState(mockHackathons);

  useEffect(() => {
    const loadData = async () => {
      const allApps = await Api.getApplications();
      setApplications(allApps.filter(a => a.studentId === user?.id));
      const jobs = await Api.getJobs();
      // Get latest 4 internships
      setInternships(jobs.filter(j => j.status !== 'Stopped').slice(0, 4));
    };
    loadData();
  }, [user]);

  const stats = [
    { 
      label: 'Applied', 
      value: applications.length, 
      icon: Send, 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      darkBg: 'bg-blue-900/30',
      iconBg: 'bg-blue-100'
    },
    { 
      label: 'Offer', 
      value: applications.filter(a => a.status === 'Offered').length, 
      icon: Trophy, 
      color: 'text-green-600',
      bg: 'bg-green-50',
      darkBg: 'bg-green-900/30',
      iconBg: 'bg-green-100',
      highlight: true
    },
    { 
      label: 'Shortlisted', 
      value: applications.filter(a => a.status === 'Shortlisted').length, 
      icon: CheckCircle, 
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      darkBg: 'bg-amber-900/30',
      iconBg: 'bg-amber-100'
    },
    { 
      label: 'Pending', 
      value: applications.filter(a => a.status === 'Applied').length, 
      icon: Clock, 
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      darkBg: 'bg-slate-800',
      iconBg: 'bg-slate-100'
    },
  ];

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Get company logo/icon color
  const getCompanyColor = (name: string) => {
    const colors: { [key: string]: string } = {
      'google': 'from-blue-500 via-red-500 to-yellow-500',
      'microsoft': 'from-blue-500 to-cyan-400',
      'amazon': 'from-orange-400 to-yellow-500',
      'flipkart': 'from-yellow-400 to-blue-600',
      'meta': 'from-blue-600 to-indigo-600',
      'apple': 'from-slate-800 to-slate-600',
      'netflix': 'from-red-600 to-red-500',
      'uber': 'from-slate-900 to-slate-700',
    };
    const key = name.toLowerCase();
    for (const [company, gradient] of Object.entries(colors)) {
      if (key.includes(company)) return gradient;
    }
    return 'from-violet-500 to-purple-600';
  };

  return (
    <div className="space-y-4 px-4 py-4">
      {/* Welcome Card - Clean Light Design */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="relative z-10">
          <p className="text-violet-200 text-xs font-medium mb-1">Welcome back,</p>
          <h1 className="text-xl font-bold mb-1">
            {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-violet-100 text-sm mb-4">
            Find your dream internship today
          </p>
          <Link 
            to="/student/internships" 
            className="inline-flex items-center gap-2 bg-white text-violet-600 px-4 py-2.5 rounded-xl font-semibold text-sm shadow-lg active:scale-95 transition-transform"
          >
            <Rocket size={16} />
            Explore Internships
          </Link>
        </div>
      </div>

      {/* Stats Grid - Clean Cards */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
            <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-2 ${stat.iconBg}`}>
              <stat.icon className={stat.color} size={18} />
            </div>
            <p className="text-lg font-bold text-slate-800">{stat.value}</p>
            <p className="text-[10px] text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Internships Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Briefcase className="text-indigo-600" size={16} />
            </div>
            <h2 className="font-semibold text-slate-800 text-sm">Latest Internships</h2>
          </div>
          <Link to="/student/internships" className="text-violet-600 text-xs font-semibold flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {internships.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                <Briefcase className="text-slate-400" size={24} />
              </div>
              <p className="text-slate-500 text-sm">No internships available</p>
            </div>
          ) : (
            internships.map((internship) => (
              <Link 
                key={internship.id} 
                to="/student/internships"
                className="block p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${getCompanyColor(internship.companyName)} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                    {internship.companyName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{internship.title}</h3>
                        <p className="text-xs text-slate-500">{internship.companyName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <MapPin size={10} />
                        {internship.location.includes('Remote') ? 'Remote' : internship.location.split(',')[0]}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <IndianRupee size={10} />
                        {internship.package} LPA
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Hackathons Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Trophy className="text-amber-600" size={16} />
            </div>
            <h2 className="font-semibold text-slate-800 text-sm">Upcoming Hackathons</h2>
          </div>
          <Link to="/student/hackathons" className="text-violet-600 text-xs font-semibold flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </Link>
        </div>
        
        {/* Horizontal Scroll Hackathons */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-3 p-4">
            {hackathons.slice(0, 4).map((hackathon) => (
              <Link
                key={hackathon.id}
                to="/student/hackathons"
                className="flex-shrink-0 w-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:border-violet-200 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getCompanyColor(hackathon.organizer)} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>
                    {hackathon.organizer.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{hackathon.organizer}</p>
                    <p className="text-xs font-medium text-violet-600">{hackathon.type}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-2">{hackathon.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">{hackathon.prize}</span>
                  <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                    <Timer size={10} />
                    {getDaysLeft(hackathon.deadline)}d left
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          to="/student/courses"
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="text-emerald-600" size={20} />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Courses</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upskill yourself</p>
        </Link>
        
        <Link 
          to="/student/profile"
          className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
            <Users className="text-violet-600" size={20} />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">Profile</h3>
          <p className="text-xs text-slate-500 mt-0.5">Complete your profile</p>
        </Link>
      </div>
    </div>
  );
};

