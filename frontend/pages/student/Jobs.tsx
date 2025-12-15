import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Job, Application } from '../../types';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle, Search, Filter, Sparkles, Building2, Calendar } from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApps, setMyApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const allJobs = await Api.getJobs();
      const apps = await Api.getApplications();
      
      // Show all active jobs (not stopped)
      const activeJobs = allJobs.filter(job => job.status !== 'Stopped');
      
      setJobs(activeJobs);
      setMyApps(apps.filter(a => a.studentId === user?.id).map(a => a.jobId));
    };
    fetchData();
  }, [user]);

  // Check eligibility for a job
  const checkEligibility = (job: Job): { eligible: boolean; reason: string } => {
    if (!user) return { eligible: false, reason: 'Not logged in' };
    
    const meetsCGPA = job.eligibility.minCGPA <= (user.cgpa || 0);
    if (!meetsCGPA) {
      return { eligible: false, reason: `Requires ${job.eligibility.minCGPA}+ CGPA` };
    }
    
    const userBranch = (user.branch || '').toLowerCase();
    
    // Branch abbreviation mappings
    const branchAliases: { [key: string]: string[] } = {
      'computer science': ['cse', 'cs', 'computer', 'btech cse', 'b.tech cse', 'computer science', 'computer science and engineering'],
      'information technology': ['it', 'infotech', 'btech it', 'b.tech it', 'information technology'],
      'electronics': ['ece', 'eee', 'electronics', 'electrical', 'btech ece', 'b.tech ece', 'electronics and communication'],
      'mechanical': ['mech', 'me', 'mechanical', 'btech mech', 'b.tech mech', 'mechanical engineering'],
      'civil': ['civil', 'ce', 'btech civil', 'b.tech civil', 'civil engineering'],
    };
    
    const branchMatch = job.eligibility.branches.length === 0 || 
      job.eligibility.branches.some(branch => {
        const branchLower = branch.toLowerCase();
        // Direct match
        if (userBranch.includes(branchLower) || branchLower.includes(userBranch)) {
          return true;
        }
        // Check aliases
        for (const [key, aliases] of Object.entries(branchAliases)) {
          const branchMatchesKey = branchLower.includes(key) || aliases.some(a => branchLower.includes(a));
          const userMatchesKey = userBranch.includes(key) || aliases.some(a => userBranch.includes(a));
          if (branchMatchesKey && userMatchesKey) {
            return true;
          }
        }
        return false;
      });
    
    if (!branchMatch) {
      return { eligible: false, reason: `Branch not eligible` };
    }
    
    return { eligible: true, reason: '' };
  };

  const handleApply = async (job: Job) => {
    if (!user) return;
    
    // Check eligibility before applying
    const { eligible, reason } = checkEligibility(job);
    if (!eligible) {
      alert(`You are not eligible for this job. ${reason}`);
      return;
    }
    
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

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-purple-500" /> Available Jobs
          </h1>
          <p className="text-slate-500">{jobs.length} opportunities waiting for you</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none w-64 transition-all"
            />
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
            <span>CGPA: {user?.cgpa || 0}</span>
            <span className="w-px h-4 bg-white/30"></span>
            <span>{user?.branch || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredJobs.map((job) => {
          const isApplied = myApps.includes(job.id);
          const { eligible, reason } = checkEligibility(job);
          return (
            <div 
              key={job.id} 
              className={`bg-white p-6 rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                isApplied ? 'border-green-200 bg-green-50/30' :
                eligible ? 'border-slate-100 hover:border-purple-200' : 'border-orange-200 bg-orange-50/30'
              }`}
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                      isApplied ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      eligible ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-orange-500 to-amber-500'
                    }`}>
                      {job.companyName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
                        {isApplied && (
                          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold border border-green-200">
                            <CheckCircle size={12} /> Applied
                          </span>
                        )}
                        {!eligible && !isApplied && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold border border-orange-200">
                            {reason}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 font-medium flex items-center gap-1 mt-1">
                        <Building2 size={14} /> {job.companyName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-medium">
                      <IndianRupee size={16} /> {job.package} LPA
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-200 text-sm font-medium">
                      <MapPin size={16} /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium">
                      <Clock size={16} /> {job.type}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-medium">
                      <Calendar size={16} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mt-4 line-clamp-2">{job.description}</p>
                  
                  <div className="mt-4 text-xs text-slate-500 bg-slate-50 px-4 py-2 rounded-lg inline-block">
                    <strong>Eligibility:</strong> {job.eligibility.minCGPA}+ CGPA • {job.eligibility.branches.join(', ') || 'All branches'}
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[160px] justify-center">
                  {isApplied ? (
                    <button disabled className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold text-sm text-center cursor-default flex items-center justify-center gap-2 shadow-lg">
                      <CheckCircle size={18} /> Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(job)}
                      disabled={loading || !eligible}
                      className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all text-center shadow-lg ${
                        eligible 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white hover:shadow-xl hover:scale-105 active:scale-95' 
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {eligible ? '🚀 Apply Now' : 'Not Eligible'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 font-medium">No jobs found</p>
            <p className="text-slate-400 text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};