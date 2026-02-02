import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application, Job } from '../../types';
import { 
  Send, CheckCircle, Clock, Trophy, ArrowRight, MapPin, IndianRupee, Timer, Rocket, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Job[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allApps = await Api.getApplications();
      setApplications(allApps.filter(a => a.studentId === user?.id));
      const jobs = await Api.getJobs();
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
    <div className="px-4 py-4 space-y-5">
      {/* Welcome Header - Purple Gradient Card matching reference */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-5 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold mb-2">
            {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-violet-100 text-sm mb-4 max-w-[250px]">
            Find internships, track applications, and boost your career
          </p>
          
          <Link 
            to="/student/internships" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
          >
            ExploreIps
          </Link>
        </div>
      </div>

      {/* Stats Card - White card with icons */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border p-4 shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <span></span>
          <Link to="/student/internships" className={`text-sm font-medium flex items-center gap-1 ${isDark ? 'text-violet-400' : 'text-violet-600'}`}>
            View all <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 relative ${
                stat.highlight 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                  : isDark ? stat.darkBg : stat.iconBg
              }`}>
                {stat.highlight ? (
                  <>
                    <span className="text-white font-bold text-lg">{stat.value}</span>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                      <Trophy size={12} className="text-white" />
                    </div>
                  </>
                ) : (
                  <stat.icon className={stat.color} size={24} />
                )}
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {!stat.highlight && <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-bold`}>{stat.value}</span>} {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Internships Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Latest Internships
          </h2>
        </div>

        <div className="space-y-3">
          {internships.length === 0 ? (
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center`}>
              <div className={`w-16 h-16 mx-auto mb-3 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                <Rocket className={isDark ? 'text-slate-500' : 'text-slate-400'} size={28} />
              </div>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No internships available</p>
            </div>
          ) : (
            internships.map((internship) => {
              const daysLeft = getDaysLeft(internship.deadline);
              return (
                <Link
                  key={internship.id}
                  to="/student/internships"
                  className={`block ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex items-start gap-3">
                    {/* Company Logo */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCompanyColor(internship.companyName)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {internship.companyName.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} line-clamp-1`}>
                            {internship.title}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            by {internship.companyName}
                          </p>
                        </div>
                        
                        {/* Location Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {internship.location.includes('Remote') ? 'Remote' : internship.location.split(',')[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <IndianRupee size={14} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {internship.package >= 1 ? `₹${internship.package.toLocaleString()}` : `₹${(internship.package * 100000).toLocaleString()}`}
                          </span>
                        </div>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {daysLeft} days left
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Apply Button for remaining internships */}
        {internships.length > 0 && (
          <div className="mt-3 space-y-2">
            {internships.slice(0, 2).map((internship) => (
              <div
                key={`apply-${internship.id}`}
                className={`flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} rounded-2xl border p-4`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCompanyColor(internship.companyName)} flex items-center justify-center`}>
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{internship.title}</h4>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>by {internship.companyName}</p>
                  </div>
                </div>
                <Link
                  to="/student/internships"
                  className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
