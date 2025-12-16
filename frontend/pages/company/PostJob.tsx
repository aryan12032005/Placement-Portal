import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobType } from '../../types';
import { 
  Briefcase, MapPin, IndianRupee, Calendar, GraduationCap, Users, Send, ArrowLeft,
  Link as LinkIcon, FileText, Globe, Sparkles, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [inputMode, setInputMode] = useState<'manual' | 'url'>('manual');
  const [urlInput, setUrlInput] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: '',
    location: '',
    type: JobType.INTERNSHIP,
    minCGPA: 0,
    branches: 'Computer Science, Information Technology, Electronics',
    deadline: '',
    rounds: 'Online Test, Technical Interview, HR'
  });

  const handleFetchFromUrl = async () => {
    if (!urlInput.trim()) {
      setFetchError('Please enter a valid URL');
      return;
    }

    setFetchLoading(true);
    setFetchError('');
    setFetchSuccess(false);

    try {
      // Simulate fetching data from URL
      // In production, this would call a backend API that scrapes the internship page
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data based on URL patterns
      let fetchedData: Partial<typeof formData> = {};

      if (urlInput.includes('internshala')) {
        fetchedData = {
          title: 'Software Development Intern',
          description: 'Work on exciting projects with our engineering team. Learn industry best practices and contribute to real products.',
          package: '25000',
          location: 'Bangalore',
          type: JobType.INTERNSHIP,
          minCGPA: 7.0,
          branches: 'Computer Science, Information Technology',
          rounds: 'Online Assessment, Technical Interview'
        };
      } else if (urlInput.includes('linkedin')) {
        fetchedData = {
          title: 'Data Science Intern',
          description: 'Join our data team to work on ML models and analytics. Great learning opportunity with mentorship.',
          package: '30000',
          location: 'Remote',
          type: JobType.INTERNSHIP,
          minCGPA: 7.5,
          branches: 'Computer Science, Mathematics, Statistics',
          rounds: 'Resume Screening, Technical Round, HR'
        };
      } else if (urlInput.includes('unstop') || urlInput.includes('dare2compete')) {
        fetchedData = {
          title: 'Product Management Intern',
          description: 'Work closely with product managers to understand user needs and help build product roadmaps.',
          package: '20000',
          location: 'Mumbai',
          type: JobType.INTERNSHIP,
          minCGPA: 6.5,
          branches: 'All Branches',
          rounds: 'Case Study, Interview'
        };
      } else if (urlInput.includes('naukri') || urlInput.includes('indeed')) {
        fetchedData = {
          title: 'Full Stack Developer Intern',
          description: 'Build web applications using modern technologies. Work on both frontend and backend development.',
          package: '35000',
          location: 'Hyderabad',
          type: JobType.INTERNSHIP,
          minCGPA: 7.0,
          branches: 'Computer Science, Information Technology, Electronics',
          rounds: 'Coding Test, Technical Interview, HR Interview'
        };
      } else {
        // Generic fetch for unknown URLs
        fetchedData = {
          title: 'Internship Opportunity',
          description: 'Details fetched from the provided URL. Please verify and update the information.',
          package: '',
          location: '',
          type: JobType.INTERNSHIP
        };
      }

      setFormData(prev => ({ ...prev, ...fetchedData }));
      setFetchSuccess(true);
      setInputMode('manual'); // Switch to manual to show and edit the fetched data

    } catch (error) {
      setFetchError('Failed to fetch data from URL. Please try again or enter details manually.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await Api.postJob({
      companyId: user.id,
      title: formData.title,
      description: formData.description,
      package: Number(formData.package),
      location: formData.location,
      type: formData.type,
      deadline: formData.deadline,
      eligibility: {
        minCGPA: Number(formData.minCGPA),
        branches: formData.branches.split(',').map(b => b.trim())
      },
      rounds: formData.rounds.split(',').map(r => r.trim())
    }, user.companyName || user.name);

    alert('Internship posted successfully!');
    navigate('/admin/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <ArrowLeft size={20} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Post New Internship</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Create a new internship opportunity for students</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Input Mode Toggle */}
        <div className={`flex border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={() => setInputMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              inputMode === 'manual'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} />
            Enter Manually
          </button>
          <button
            onClick={() => setInputMode('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              inputMode === 'url'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LinkIcon size={18} />
            Fetch from URL
          </button>
        </div>

        {/* URL Input Section */}
        {inputMode === 'url' && (
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg">
                <Globe size={32} className="text-white" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Auto-Fetch Internship Details</h2>
              <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Paste an internship URL from popular job portals
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="url"
                  placeholder="https://internshala.com/internship/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`w-full pl-11 pr-4 py-4 border rounded-xl outline-none transition-all text-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              {fetchError && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <AlertCircle size={18} />
                  {fetchError}
                </div>
              )}

              {fetchSuccess && (
                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-xl border border-green-100">
                  <CheckCircle size={18} />
                  Data fetched successfully! Review and edit the details below.
                </div>
              )}

              <button
                onClick={handleFetchFromUrl}
                disabled={fetchLoading || !urlInput.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {fetchLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Fetching details...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Fetch Internship Details
                  </>
                )}
              </button>

              {/* Supported Platforms */}
              <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Supported Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {['Internshala', 'LinkedIn', 'Unstop', 'Naukri', 'Indeed', 'AngelList'].map(platform => (
                    <span key={platform} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${isDark ? 'bg-slate-600 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Form */}
        {inputMode === 'manual' && (
          <>
            {/* Form Header */}
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">InternHub Admin</h2>
                  <p className="text-white/80 text-sm">Posting a new internship opportunity</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Briefcase size={16} />
                  </div>
                  Internship Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Internship Title</label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g., Software Development Intern, Data Science Intern"
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Internship Description</label>
                    <textarea 
                      required 
                      rows={4} 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="Describe the internship role, responsibilities, learning opportunities..."
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <IndianRupee size={16} className="text-indigo-500" /> Stipend (per month)
                    </label>
                    <input 
                      required 
                      type="number" 
                      step="1000" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g., 25000"
                      value={formData.package} 
                      onChange={e => setFormData({...formData, package: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <MapPin size={16} className="text-indigo-500" /> Location
                    </label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g., Bangalore, Remote"
                      value={formData.location} 
                      onChange={e => setFormData({...formData, location: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Internship Type</label>
                    <select 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      value={formData.type} 
                      onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                    >
                      <option value={JobType.INTERNSHIP}>Internship</option>
                      <option value={JobType.FULL_TIME}>Full Time (PPO)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Calendar size={16} className="text-indigo-500" /> Application Deadline
                    </label>
                    <input 
                      required 
                      type="date" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      value={formData.deadline} 
                      onChange={e => setFormData({...formData, deadline: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div className={`border-t pt-8 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <GraduationCap size={16} />
                  </div>
                  Eligibility & Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Minimum CGPA</label>
                    <input 
                      required 
                      type="number" 
                      step="0.1" 
                      max="10"
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      placeholder="e.g., 7.0"
                      value={formData.minCGPA} 
                      onChange={e => setFormData({...formData, minCGPA: Number(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Eligible Branches (comma separated)</label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      value={formData.branches} 
                      onChange={e => setFormData({...formData, branches: e.target.value})} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Users size={16} className="text-indigo-500" /> Hiring Rounds (comma separated)
                    </label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                      value={formData.rounds} 
                      onChange={e => setFormData({...formData, rounds: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className={`flex justify-end gap-4 pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button 
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className={`px-6 py-3 border rounded-xl font-semibold transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Send size={18} /> Post Internship
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
