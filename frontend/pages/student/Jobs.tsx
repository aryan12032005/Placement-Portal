import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Job, Application } from '../../types';
import { Briefcase, MapPin, IndianRupee, Clock, CheckCircle, Search, Building2, Calendar, Timer, Rocket, Sparkles, ExternalLink, Zap, Target, TrendingUp } from 'lucide-react';

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
    if (!eligible) { toast.error(`You are not eligible. ${reason}`); return; }
    if (!user.resumeUrl) { toast.error("Please upload a resume in your Profile before applying."); return; }
    
    setLoading(true);
    await Api.applyForJob(internship.id, user.id, user.name, internship.title, internship.companyName);
    await Api.addNotification(internship.companyId, `New applicant ${user.name} for ${internship.title}`);
    setMyApps([...myApps, internship.id]);
    setLoading(false);
    toast.success('Applied successfully!');
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
    <div className="space-y-4 md:space-y-6 px-1">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl md:rounded-3xl p-5 md:p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div className="p-2.5 md:p-3 bg-white/20 backdrop-blur rounded-xl">
            <Briefcase size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Internships</h1>
            <p className="text-white/80 text-sm md:text-base">Discover and apply to internships</p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Zap size={16} className="text-yellow-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{internships.length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Available</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <CheckCircle size={16} className="text-green-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{myApps.length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Applied</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Target size={16} className="text-blue-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{internships.filter(j => checkEligibility(j).eligible).length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">Eligible</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4">
            <div className="flex items-center gap-1.5 md:gap-2">
              <TrendingUp size={16} className="text-pink-300 md:w-5 md:h-5" />
              <span className="text-lg md:text-2xl font-bold">{internships.filter(j => isRecentlyPosted(j.postedDate || new Date().toISOString())).length}</span>
            </div>
            <p className="text-[10px] md:text-sm text-white/70">New</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-10 pr-4 py-3 rounded-xl border w-full outline-none transition-all ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-violet-500' 
                : 'bg-white border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'
            }`}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRecent(!filterRecent)}
            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all font-medium text-sm ${
              filterRecent
                ? 'bg-violet-600 border-violet-600 text-white'
                : isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={14} />
            Recent
          </button>
          <div className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${
            isDark ? 'bg-slate-800 border border-slate-700 text-slate-300' : 'bg-violet-50 text-violet-700'
          }`}>
            <span>CGPA: {user?.cgpa || 0}</span>
            <span className={isDark ? 'text-slate-600' : 'text-violet-300'}>•</span>
            <span className="truncate max-w-[100px]">{user?.branch || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Internships List */}
      <div className="space-y-3 md:space-y-4">
        {filteredInternships.map((internship) => {
          const isApplied = myApps.includes(internship.id);
          const { eligible, reason } = checkEligibility(internship);
          const daysLeft = getDaysLeft(internship.deadline);
          const isRecent = isRecentlyPosted(internship.postedDate || new Date().toISOString());
          
          return (
            <div 
              key={internship.id} 
              className={`p-4 md:p-6 rounded-2xl border transition-all relative ${
                isDark 
                  ? `bg-slate-800 ${isApplied ? 'border-emerald-700' : 'border-slate-700 hover:border-slate-600'}` 
                  : `bg-white ${isApplied ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`
              }`}
            >
              {/* Recently Posted Badge */}
              {isRecent && (
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                  <span className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center gap-1 shadow-lg">
                    <Sparkles size={10} className="md:w-3 md:h-3" />
                    New
                  </span>
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                      {internship.companyName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <h3 className={`text-base md:text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{internship.title}</h3>
                        {isApplied && (
                          <span className="flex items-center gap-1 text-[10px] md:text-xs bg-emerald-100 text-emerald-700 px-1.5 md:px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle size={10} className="md:w-3 md:h-3" /> Applied
                          </span>
                        )}
                      </div>
                      {!eligible && !isApplied && (
                        <span className="inline-block text-[10px] md:text-xs bg-amber-100 text-amber-700 px-1.5 md:px-2 py-0.5 rounded-full font-medium mt-1">
                          {reason}
                        </span>
                      )}
                      {daysLeft <= 3 && daysLeft > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs bg-red-100 text-red-700 px-1.5 md:px-2 py-0.5 rounded-full font-medium animate-pulse mt-1 ml-1">
                          <Timer size={10} className="md:w-3 md:h-3" /> {daysLeft}d left
                        </span>
                      )}
                      <p className={`text-xs md:text-sm mt-0.5 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Building2 size={12} className="md:w-3.5 md:h-3.5" /> {internship.companyName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3">
                    <span className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <IndianRupee size={12} className="md:w-3.5 md:h-3.5" /> {internship.package} LPA
                    </span>
                    <span className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <MapPin size={12} className="md:w-3.5 md:h-3.5" /> {internship.location}
                    </span>
                    <span className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Clock size={12} className="md:w-3.5 md:h-3.5" /> {internship.type}
                    </span>
                    <span className={`flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[11px] md:text-sm ${
                      isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Calendar size={12} className="md:w-3.5 md:h-3.5" /> {new Date(internship.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <p className={`text-xs md:text-sm mt-2.5 md:mt-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {internship.description}
                  </p>
                  
                  <p className={`mt-2.5 md:mt-3 text-[10px] md:text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    <strong>Eligibility:</strong> {internship.eligibility.minCGPA}+ CGPA • {internship.eligibility.branches.join(', ') || 'All branches'}
                  </p>
                </div>

                <div className="flex items-center mt-2">
                  {internship.registrationUrl ? (
                    <a
                      href={internship.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-lg"
                    >
                      Register Now
                      <ExternalLink size={14} />
                    </a>
                  ) : isApplied ? (
                    <button disabled className="flex-1 md:flex-none bg-emerald-600 text-white px-4 md:px-5 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-default">
                      <CheckCircle size={16} /> Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApply(internship)}
                      disabled={loading || !eligible}
                      className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                        eligible 
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md' 
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
