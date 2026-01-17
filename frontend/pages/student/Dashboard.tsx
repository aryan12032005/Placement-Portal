import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application, Job } from '../../types';
import { 
  Briefcase, CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight, Send,
  Rocket, Calendar, MapPin, Building2, Zap, Trophy, Code, Users, Star,
  ExternalLink, Timer, IndianRupee, BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock hackathons data (you can move this to API later)
const mockHackathons = [
  {
    id: '1',
    title: 'Google Summer of Code 2025',
    organizer: 'Google',
    deadline: '2025-04-15',
    prize: '$3000',
    type: 'Remote',
    tags: ['Open Source', 'Coding'],
    participants: 15000,
  },
  {
    id: '2',
    title: 'Microsoft Imagine Cup',
    organizer: 'Microsoft',
    deadline: '2025-03-20',
    prize: '$100,000',
    type: 'Hybrid',
    tags: ['AI/ML', 'Innovation'],
    participants: 8000,
  },
  {
    id: '3',
    title: 'Flipkart GRiD 6.0',
    organizer: 'Flipkart',
    deadline: '2025-02-28',
    prize: '₹5,00,000',
    type: 'Online',
    tags: ['E-commerce', 'Tech'],
    participants: 25000,
  },
  {
    id: '4',
    title: 'Amazon ML Challenge',
    organizer: 'Amazon',
    deadline: '2025-03-10',
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
    { label: 'Applied', value: applications.length, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-900/30' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'bg-emerald-900/30' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Applied').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'bg-amber-900/30' },
    { label: 'Offers', value: applications.filter(a => a.status === 'Offered').length, icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-50', darkBg: 'bg-violet-900/30' },
  ];

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${isDark ? 'bg-gradient-to-r from-indigo-900/50 to-violet-900/50' : 'bg-gradient-to-r from-indigo-500 to-violet-600'} rounded-2xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold">
                {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="mt-2 text-indigo-100 max-w-md">
                Discover internships, track your applications, and participate in hackathons to boost your career.
              </p>
            </div>
            <Link 
              to="/student/internships" 
              className="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <Rocket size={18} />
              Explore Internships
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-5 border hover:shadow-lg transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isDark ? stat.darkBg : stat.bg}`}>
                <stat.icon className={stat.color} size={20} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Latest Internships */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <Briefcase className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={20} />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Latest Internships</h2>
            </div>
            <Link to="/student/internships" className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {internships.length === 0 ? (
              <div className="p-8 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                  <Briefcase className={isDark ? 'text-slate-500' : 'text-slate-400'} size={24} />
                </div>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No internships available</p>
              </div>
            ) : (
              internships.map((internship) => (
                <Link 
                  key={internship.id} 
                  to="/student/internships"
                  className={`block p-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {internship.companyName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{internship.title}</h3>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{internship.companyName}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <MapPin size={12} /> {internship.location}
                        </span>
                        <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <IndianRupee size={12} /> {internship.package} LPA
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          getDaysLeft(internship.deadline) <= 3 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <Timer size={12} /> {getDaysLeft(internship.deadline)} days left
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Hackathons */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <Code className={isDark ? 'text-violet-400' : 'text-violet-600'} size={20} />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Upcoming Hackathons</h2>
            </div>
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full font-medium">
              {hackathons.length} Active
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {hackathons.map((hackathon) => (
              <Link 
                key={hackathon.id} 
                to="/student/hackathons"
                className={`block p-4 ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{hackathon.title}</h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>by {hackathon.organizer}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                        {hackathon.prize}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar size={12} /> {new Date(hackathon.deadline).toLocaleDateString()}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Users size={12} /> {hackathon.participants.toLocaleString()}+
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        hackathon.type === 'Remote' ? 'bg-blue-100 text-blue-700' :
                        hackathon.type === 'Online' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {hackathon.type}
                      </span>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {hackathon.tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            <Send className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={20} />
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Applications</h2>
          </div>
          <Link to="/student/internships" className="text-indigo-600 text-sm font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Role</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Applied</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-14 h-14 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                        <Briefcase className={isDark ? 'text-slate-500' : 'text-slate-400'} size={28} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No applications yet</p>
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Start applying to internships!</p>
                      </div>
                      <Link to="/student/internships" className="text-indigo-600 font-medium text-sm hover:underline flex items-center gap-1">
                        <Rocket size={14} /> Browse internships
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {app.companyName.charAt(0)}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{app.companyName}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{app.jobTitle}</td>
                    <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'Offered' ? 'bg-violet-100 text-violet-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Tips */}
      <div className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100'} rounded-xl border p-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
            <Zap className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={24} />
          </div>
          <div>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Pro Tips for Success</h3>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li>• Complete your profile to increase visibility by 70%</li>
              <li>• Apply early - most internships close within 2 weeks</li>
              <li>• Participate in hackathons to stand out from other candidates</li>
              <li>• Keep your resume updated with latest projects and skills</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Learning Hub Promo */}
      <Link 
        to="/student/courses"
        className={`${isDark ? 'bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-800 hover:from-emerald-900/70 hover:to-teal-900/70' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'} rounded-xl p-6 flex items-center justify-between group transition-all cursor-pointer`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
            <BookOpen className="text-white" size={24} />
          </div>
          <div className="text-white">
            <h3 className="font-semibold text-lg">Learning Hub</h3>
            <p className="text-emerald-100 text-sm">Access free courses, notes, and resources to boost your skills</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white font-medium">
          <span className="hidden sm:inline">Explore Courses</span>
          <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </div>
      </Link>
    </div>
  );
};
