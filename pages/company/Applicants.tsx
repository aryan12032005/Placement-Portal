import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus, Job } from '../../types';
import { Download, Check, X } from 'lucide-react';

export const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterJob, setFilterJob] = useState('all');

  useEffect(() => {
    const load = async () => {
      const allJobs = await Api.getJobs();
      const myJobs = allJobs.filter(j => j.companyId === user?.id);
      setJobs(myJobs);

      const allApps = await Api.getApplications();
      const myApps = allApps.filter(a => myJobs.find(j => j.id === a.jobId));
      setApplications(myApps);
    };
    load();
  }, [user]);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await Api.updateApplicationStatus(appId, status);
    // Refresh local state
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    
    // Notify student
    const app = applications.find(a => a.id === appId);
    if(app) await Api.addNotification(app.studentId, `Your application for ${app.jobTitle} is now ${status}`);
  };

  const filteredApps = filterJob === 'all' 
    ? applications 
    : applications.filter(a => a.jobId === filterJob);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Applicants Management</h1>
        <select 
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none"
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
        >
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Candidate</th>
              <th className="px-6 py-4 font-medium">Job Role</th>
              <th className="px-6 py-4 font-medium">Resume</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{app.studentName}</td>
                <td className="px-6 py-4">{app.jobTitle}</td>
                <td className="px-6 py-4">
                  <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                    <Download size={14} /> PDF
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    app.status === ApplicationStatus.SHORTLISTED ? 'bg-green-100 text-green-700' : 
                    app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>{app.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(app.id, ApplicationStatus.SHORTLISTED)}
                      className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100" title="Shortlist"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(app.id, ApplicationStatus.REJECTED)}
                      className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredApps.length === 0 && <div className="p-8 text-center text-slate-500">No applicants found.</div>}
      </div>
    </div>
  );
};