import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Job, Application } from '../../types';
import { Users, Briefcase, TrendingUp, Edit, Plus, Building2, Target, StopCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog';

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { confirm, dialogProps } = useConfirmDialog();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const allJobs = await Api.getJobs();
      const myJobs = allJobs.filter(j => j.companyId === user?.id);
      setJobs(myJobs);
      const allApps = await Api.getApplications();
      const myJobIds = myJobs.map(j => j.id);
      setApplications(allApps.filter(a => myJobIds.includes(a.jobId)));
    };
    loadData();
  }, [user]);

  const handleStopRecruiting = async (jobId: string) => {
    const confirmed = await confirm({
      title: 'Stop Recruiting',
      message: 'Are you sure you want to stop recruiting for this job?',
      confirmText: 'Stop Recruiting',
      variant: 'warning'
    });
    if (confirmed) {
      try {
        await Api.stopRecruiting(jobId);
        const allJobs = await Api.getJobs();
        setJobs(allJobs.filter(j => j.companyId === user?.id));
        toast.success('Recruiting stopped successfully!');
      } catch (error) {
        toast.error('Failed to stop recruiting');
      }
    }
  };

  const activeJobs = jobs.filter(j => j.status !== 'Stopped');
  const stats = [
    { label: 'Active Jobs', value: activeJobs.length, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Applicants', value: applications.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg per Job', value: activeJobs.length ? Math.round(applications.length / activeJobs.length) : 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'Shortlisted').length, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <>
    <ConfirmDialog {...dialogProps} />
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-xl p-6 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {user?.companyName || user?.name}
              </h1>
              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Find the best talent for your team</p>
            </div>
          </div>
          <Link 
            to="/company/post-job" 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} /> Post New Job
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl p-5 border`}>
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

      {/* Jobs Table */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex justify-between items-center`}>
          <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Your Job Postings</h2>
          <Link to="/company/applicants" className="text-indigo-600 text-sm font-medium hover:underline">
            View all applicants →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Title</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Posted</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Applicants</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center`}>
                        <Briefcase className={isDark ? 'text-slate-500' : 'text-slate-400'} size={24} />
                      </div>
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No jobs posted yet</p>
                      <Link to="/company/post-job" className="text-indigo-600 font-medium text-sm hover:underline">
                        Post your first job →
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {job.title.charAt(0)}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{job.title}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {new Date(job.postedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
                        {applications.filter(a => a.jobId === job.id).length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        job.status === 'Stopped' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {job.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/company/edit-job/${job.id}`)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        {job.status !== 'Stopped' && (
                          <button 
                            onClick={() => handleStopRecruiting(job.id)}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
    </>
  );
};
