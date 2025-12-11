import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, Application } from '../../types';
import { Briefcase, MapPin, IndianRupee, Clock } from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApps, setMyApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const allJobs = await Api.getJobs();
      const apps = await Api.getApplications();
      
      // Basic eligibility check
      const eligibleJobs = allJobs.filter(job => 
        job.eligibility.minCGPA <= (user?.cgpa || 0) &&
        (job.eligibility.branches.includes(user?.branch || '') || job.eligibility.branches.length === 0)
      );
      
      setJobs(eligibleJobs);
      setMyApps(apps.filter(a => a.studentId === user?.id).map(a => a.jobId));
    };
    fetchData();
  }, [user]);

  const handleApply = async (job: Job) => {
    if (!user) return;
    if (!user.resumeUrl) {
      alert("Please upload a resume in your Profile before applying.");
      return;
    }
    
    setLoading(true);
    await Api.applyForJob(job.id, user.id, user.name, job.title, job.companyName);
    await Api.addNotification(job.companyId, `New applicant ${user.name} for ${job.title}`);
    setMyApps([...myApps, job.id]);
    setLoading(false);
    alert('Applied successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Eligible Jobs</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          My CGPA: {user?.cgpa} | Branch: {user?.branch}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => {
          const isApplied = myApps.includes(job.id);
          return (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                  <p className="text-slate-500 font-medium mb-2">{job.companyName}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 my-4">
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      <IndianRupee size={16} /> {job.package} LPA
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      <MapPin size={16} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                      <Clock size={16} /> {job.type}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                  
                  <div className="text-xs text-slate-500">
                    <strong>Eligibility:</strong> {job.eligibility.minCGPA}+ CGPA, {job.eligibility.branches.join(', ')}
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  {isApplied ? (
                    <button disabled className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium text-sm text-center cursor-default">
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(job)}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors text-center"
                    >
                      Apply Now
                    </button>
                  )}
                  <div className="text-xs text-center text-slate-400">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {jobs.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
            No jobs found matching your eligibility criteria.
          </div>
        )}
      </div>
    </div>
  );
};