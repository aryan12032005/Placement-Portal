import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, Application } from '../../types';
import { Users, Briefcase, TrendingUp, Edit, Plus, Building2, Target, ArrowUpRight, StopCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allJobs = await Api.getJobs();
      const myJobs = allJobs.filter(j => j.companyId === user?.id);
      setJobs(myJobs);

      const allApps = await Api.getApplications();
      // Filter applications for my jobs
      const myJobIds = myJobs.map(j => j.id);
      setApplications(allApps.filter(a => myJobIds.includes(a.jobId)));
    };
    loadData();
  }, [user]);

  const handleStopRecruiting = async (jobId: string) => {
    if (window.confirm('Are you sure you want to stop recruiting for this job?')) {
      try {
        await Api.stopRecruiting(jobId);
        const allJobs = await Api.getJobs();
        const myJobs = allJobs.filter(j => j.companyId === user?.id);
        setJobs(myJobs);
      } catch (error) {
        alert('Failed to stop recruiting');
      }
    }
  };

  const activeJobs = jobs.filter(j => j.status !== 'Stopped');
  const stats = [
    { 
      label: 'Active Jobs', 
      value: activeJobs.length, 
      icon: Briefcase, 
      gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/25',
      iconBg: 'bg-emerald-500',
      ring: 'ring-emerald-400/30'
    },
    { 
      label: 'Total Applicants', 
      value: applications.length, 
      icon: Users, 
      gradient: 'from-blue-600 via-blue-500 to-cyan-400',
      glow: 'shadow-blue-500/25',
      iconBg: 'bg-blue-500',
      ring: 'ring-blue-400/30'
    },
    { 
      label: 'Avg per Job', 
      value: activeJobs.length ? Math.round(applications.length / activeJobs.length) : 0, 
      icon: TrendingUp, 
      gradient: 'from-purple-600 via-pink-500 to-rose-400',
      glow: 'shadow-purple-500/25',
      iconBg: 'bg-purple-500',
      ring: 'ring-purple-400/30'
    },
    { 
      label: 'Shortlisted', 
      value: applications.filter(a => a.status === 'Shortlisted').length, 
      icon: Target, 
      gradient: 'from-amber-500 via-orange-500 to-yellow-400',
      glow: 'shadow-orange-500/25',
      iconBg: 'bg-orange-500',
      ring: 'ring-orange-400/30'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 size={28} className="text-emerald-200" />
              <h1 className="text-3xl font-bold">{user?.companyName || user?.name}</h1>
            </div>
            <p className="text-white/80 text-lg">Find the best talent for your team</p>
          </div>
          <Link 
            to="/company/post-job" 
            className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
          >
            <Plus size={20} /> Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`relative group cursor-pointer`}
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

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="text-emerald-500" size={24} />
              Your Job Postings
            </h2>
            <Link to="/company/applicants" className="text-emerald-600 font-semibold text-sm hover:underline flex items-center gap-1">
              View all applicants <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Job Title</th>
                <th className="px-6 py-4 font-semibold">Posted Date</th>
                <th className="px-6 py-4 font-semibold">Applicants</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Briefcase className="text-slate-400" size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No jobs posted yet</p>
                      <Link to="/company/post-job" className="text-emerald-600 font-semibold hover:underline">
                        Post your first job →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {job.title.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{job.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(job.postedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {applications.filter(a => a.jobId === job.id).length} applicants
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Stopped' 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {job.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/company/edit-job/${job.id}`)}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        {job.status !== 'Stopped' && (
                          <button 
                            onClick={() => handleStopRecruiting(job.id)}
                            className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
                          >
                            <StopCircle size={14} /> Stop
                          </button>
                        )}
                      </div>
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