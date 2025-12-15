import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application, Job } from '../../types';
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp, ArrowUpRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allApps = await Api.getApplications();
      setApplications(allApps.filter(a => a.studentId === user?.id));
      setJobs(await Api.getJobs());
    };
    loadData();
  }, [user]);

  const stats = [
    { label: 'Applied', value: applications.length, icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: applications.filter(a => a.status === 'Applied').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Offers', value: applications.filter(a => a.status === 'Offered').length, icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Track your applications and find new opportunities
            </p>
          </div>
          <Link 
            to="/student/jobs" 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Browse Jobs <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-5 border`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : stat.bg}`}>
                <stat.icon className={isDark ? 'text-slate-300' : stat.color} size={20} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Applications</h2>
          <Link to="/student/jobs" className="text-indigo-600 text-sm font-medium hover:underline">
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
                      <div className={`w-12 h-12 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                        <Briefcase className={isDark ? 'text-slate-500' : 'text-slate-400'} size={24} />
                      </div>
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No applications yet</p>
                      <Link to="/student/jobs" className="text-indigo-600 font-medium text-sm hover:underline">
                        Browse jobs →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
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
    </div>
  );
};
