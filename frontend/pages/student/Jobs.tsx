import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Job, Application } from '../../types';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle, Search, Building2, Calendar, Timer, Rocket, Sparkles } from 'lucide-react';

export const StudentJobs: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [internships, setInternships] = useState<Job[]>([]);
  const [myApps, setMyApps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRecent, setFilterRecent] = useState<boolean>(false);

  const isRecentlyPosted = (postedDate: string) => {
    const posted = new Date(postedDate);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Posted within last 7 days
  };
  useEffect(() => {
    const fetchData = async () => {
      const allJobs = await Api.getJobs();
      const apps = await Api.getApplications();
      const activeInternships = allJobs.filter(job => job.status !== 'Stopped');
      setInternships(activeInternships);
      setMyApps(apps.filter(a => a.studentId === user?.id).map(a => a.jobId));
    };
    fetchData();
  }, [user]);

  const checkEligibility = (internship: Job): { eligible: boolean; reason: string } => {
    if (!user) return { eligible: false, reason: 'Not logged in' };
    
    const meetsCGPA = internship.eligibility.minCGPA <= (user.cgpa || 0);
    if (!meetsCGPA) {
      return { eligible: false, reason: `Requires ${internship.eligibility.minCGPA}+ CGPA` };
    }
    
    const userBranch = (user.branch || '').toLowerCase();
    const branchAliases: { [key: string]: string[] } = {
      'computer science': ['cse', 'cs', 'computer', 'btech cse', 'b.tech cse', 'computer science'],
      'information technology': ['it', 'infotech', 'btech it', 'b.tech it', 'information technology'],
      'electronics': ['ece', 'eee', 'electronics', 'electrical', 'btech ece', 'b.tech ece'],
      'mechanical': ['mech', 'me', 'mechanical', 'btech mech', 'b.tech mech'],
      'civil': ['civil', 'ce', 'btech civil', 'b.tech civil'],
    };
    
    const branchMatch = internship.eligibility.branches.length === 0 || 
      internship.eligibility.branches.some(branch => {
        const branchLower = branch.toLowerCase();
        if (userBranch.includes(branchLower) || branchLower.includes(userBranch)) return true;
        for (const [key, aliases] of Object.entries(branchAliases)) {
          const branchMatchesKey = branchLower.includes(key) || aliases.some(a => branchLower.includes(a));
          const userMatchesKey = userBranch.includes(key) || aliases.some(a => userBranch.includes(a));
          if (branchMatchesKey && userMatchesKey) return true;
        }
        return false;
      });
    
    if (!branchMatch) return { eligible: false, reason: `Branch not eligible` };
    return { eligible: true, reason: '' };
  };

  const handleApply = async (internship: Job) => {
    if (!user) return;
    const { eligible, reason } = checkEligibility(internship);
    if (!eligible) { alert(`You are not eligible. ${reason}`); return; }
    if (!user.resumeUrl) { alert("Please upload a resume in your Profile before applying."); return; }
    
    setLoading(true);
    await Api.applyForJob(internship.id, user.id, user.name, internship.title, internship.companyName);
    await Api.addNotification(internship.companyId, `New applicant ${user.name} for ${internship.title}`);
    setMyApps([...myApps, internship.id]);
    setLoading(false);
    alert('Applied successfully!');
  };

  const filteredInternships = internships
    .filter(internship => {
      const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            internship.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRecent = !filterRecent || isRecentlyPosted(internship.postedDate || new Date().toISOString());
      return matchesSearch && matchesRecent;
    })
    .sort((a, b) => new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime()); // Sort by recent first

  const getDaysLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Available Internships</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>{internships.length} opportunities available</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2.5 rounded-lg border w-64 outline-none transition-all ${
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500' 
                  : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
          </div>
          <button
            onClick={() => setFilterRecent(!filterRecent)}
            className={`px-4 py-2.5 rounded-lg border flex items-center gap-2 transition-all font-medium text-sm ${
              filterRecent
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : isDark ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={16} />
            Recent
          </button>
          <div className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
            isDark ? 'bg-slate-700 text-slate-300' : 'bg-indigo-50 text-indigo-700'
          }`}>
            <span>CGPA: {user?.cgpa || 0}</span>
            <span className={isDark ? 'text-slate-500' : 'text-indigo-300'}>•</span>
            <span>{user?.branch || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Internships List */}
      <div className="space-y-4">
        {filteredInternships.map((internship) => {
          const isApplied = myApps.includes(internship.id);
          const { eligible, reason } = checkEligibility(internship);
          const daysLeft = getDaysLeft(internship.deadline);
          const isRecent = isRecentlyPosted(internship.postedDate || new Date().toISOString());
          
          return (
            <div 
              key={internship.id} 
              className={`p-6 rounded-xl border transition-all relative ${
                isDark 
                  ? `bg-slate-800 ${isApplied ? 'border-emerald-700' : 'border-slate-700 hover:border-slate-600'}` 
                  : `bg-white ${isApplied ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`
              }`}
            >
              {/* Recently Posted Badge */}
              {isRecent && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center gap-1 shadow-lg">
                    <Sparkles size={12} />
                    New
                  </span>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row justify-between gap-5">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {internship.companyName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{internship.title}</h3>
                        {isApplied && (
                          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle size={12} /> Applied
                          </span>
                        )}
                        {!eligible && !isApplied && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            {reason}
                          </span>
                        )}
                        {daysLeft <= 3 && daysLeft > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
                            <Timer size={12} /> {daysLeft} days left!
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Building2 size={14} /> {internship.companyName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <IndianRupee size={14} /> {internship.package} LPA
                    </span>
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <MapPin size={14} /> {internship.location}
                    </span>
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Clock size={14} /> {internship.type}
                    </span>
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Calendar size={14} /> Deadline: {new Date(internship.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <p className={`text-sm mt-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {internship.description}
                  </p>
                  
                  <p className={`mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    <strong>Eligibility:</strong> {internship.eligibility.minCGPA}+ CGPA • {internship.eligibility.branches.join(', ') || 'All branches'}
                  </p>
                </div>

                <div className="flex items-center">
                  {isApplied ? (
                    <button disabled className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 cursor-default">
                      <CheckCircle size={16} /> Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(internship)}
                      disabled={loading || !eligible}
                      className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        eligible 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : `${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-500'} cursor-not-allowed`
                      }`}
                    >
                      {eligible ? 'Apply Now' : 'Not Eligible'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredInternships.length === 0 && (
          <div className={`text-center py-16 rounded-xl border-2 border-dashed ${
            isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200'
          }`}>
            <div className={`w-14 h-14 ${isDark ? 'bg-slate-700' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Rocket className={isDark ? 'text-slate-500' : 'text-slate-400'} size={28} />
            </div>
            <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No internships found</p>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Try adjusting your search or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};
