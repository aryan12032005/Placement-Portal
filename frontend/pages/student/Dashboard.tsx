import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, Job } from '../../types';
import { Briefcase, CheckCircle, Clock, XCircle, TrendingUp, Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
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
    { 
      label: 'Applied', 
      value: applications.length, 
      icon: Briefcase, 
      gradient: 'from-blue-600 via-blue-500 to-cyan-400',
      glow: 'shadow-blue-500/25',
      iconBg: 'bg-blue-500',
      ring: 'ring-blue-400/30'
    },
    { 
      label: 'Shortlisted', 
      value: applications.filter(a => a.status === 'Shortlisted').length, 
      icon: CheckCircle, 
      gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/25',
      iconBg: 'bg-emerald-500',
      ring: 'ring-emerald-400/30'
    },
    { 
      label: 'Pending', 
      value: applications.filter(a => a.status === 'Applied').length, 
      icon: Clock, 
      gradient: 'from-amber-500 via-orange-500 to-yellow-400',
      glow: 'shadow-orange-500/25',
      iconBg: 'bg-orange-500',
      ring: 'ring-orange-400/30'
    },
    { 
      label: 'Offers', 
      value: applications.filter(a => a.status === 'Offered').length, 
      icon: Sparkles, 
      gradient: 'from-purple-600 via-pink-500 to-rose-400',
      glow: 'shadow-purple-500/25',
      iconBg: 'bg-purple-500',
      ring: 'ring-purple-400/30'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/80 text-lg">Ready to find your dream job?</p>
          <Link 
            to="/student/jobs" 
            className="inline-flex items-center gap-2 mt-4 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all hover:scale-105"
          >
            Browse Jobs <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`relative group cursor-pointer`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Animated gradient border */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`}></div>
            
            {/* Card content */}
            <div className={`relative bg-white rounded-2xl p-6 shadow-xl ${stat.glow} shadow-2xl ring-1 ${stat.ring} hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]`}>
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl`}></div>
              </div>
              
              {/* Icon with animated ring */}
              <div className="relative mb-4">
                <div className={`absolute inset-0 ${stat.iconBg} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Value with gradient text */}
              <div className="relative">
                <p className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="text-slate-600 font-semibold mt-1 tracking-wide">{stat.label}</p>
              </div>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={24} />
              Recent Applications
            </h2>
            <Link to="/student/jobs" className="text-purple-600 font-semibold text-sm hover:underline">
              View all jobs →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Company</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Applied Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Briefcase className="text-slate-400" size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No applications yet</p>
                      <Link to="/student/jobs" className="text-purple-600 font-semibold hover:underline">
                        Browse available jobs →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {app.companyName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{app.companyName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{app.jobTitle}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        app.status === 'Shortlisted' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                        app.status === 'Offered' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
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