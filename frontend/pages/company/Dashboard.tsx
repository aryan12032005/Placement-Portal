import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, Application } from '../../types';
import { Users, Briefcase, TrendingUp, Edit } from 'lucide-react';
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
    { label: 'Active Jobs', value: activeJobs.length, icon: Briefcase, color: 'bg-purple-500' },
    { label: 'Total Applicants', value: applications.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Avg Applications', value: activeJobs.length ? Math.round(applications.length / activeJobs.length) : 0, icon: TrendingUp, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Recruiter Dashboard</h1>
        <Link to="/company/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
          + Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-lg text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Active Job Postings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium">Posted Date</th>
                <th className="px-6 py-4 font-medium">Applicants</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{job.title}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(job.postedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{applications.filter(a => a.jobId === job.id).length}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${job.status === 'Stopped' ? 'text-red-600' : 'text-green-600'}`}>
                      {job.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button 
                      onClick={() => navigate(`/company/edit-job/${job.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    {job.status !== 'Stopped' && (
                      <button 
                        onClick={() => handleStopRecruiting(job.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-xs border border-red-200 bg-red-50 px-3 py-1 rounded-full transition-colors"
                      >
                        Stop Recruiting
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};