import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  Trophy, Link as LinkIcon, FileText, Calendar, Award, Users, MapPin, 
  ArrowLeft, Send, Loader2, Globe, Sparkles, Tag, Clock, ExternalLink,
  CheckCircle, AlertCircle
} from 'lucide-react';

interface HackathonFormData {
  title: string;
  organizer: string;
  description: string;
  deadline: string;
  startDate: string;
  endDate: string;
  prize: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  location: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string;
  registrationUrl: string;
}

export const PostHackathon: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [inputMode, setInputMode] = useState<'manual' | 'url'>('manual');
  const [urlInput, setUrlInput] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);
  
  const [formData, setFormData] = useState<HackathonFormData>({
    title: '',
    organizer: '',
    description: '',
    deadline: '',
    startDate: '',
    endDate: '',
    prize: '',
    mode: 'Online',
    location: '',
    difficulty: 'Intermediate',
    tags: '',
    registrationUrl: ''
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
      // In production, this would call a backend API that scrapes the hackathon page
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock data based on URL patterns
      let fetchedData: Partial<HackathonFormData> = {};

      if (urlInput.includes('unstop') || urlInput.includes('dare2compete')) {
        fetchedData = {
          title: 'Unstop Hackathon Challenge',
          organizer: 'Unstop',
          description: 'Join this exciting hackathon challenge on Unstop platform. Build innovative solutions and compete with the best minds.',
          prize: '₹5,00,000',
          mode: 'Online',
          difficulty: 'Intermediate',
          tags: 'Innovation, Technology, Problem Solving',
          registrationUrl: urlInput
        };
      } else if (urlInput.includes('devfolio')) {
        fetchedData = {
          title: 'Devfolio Hackathon',
          organizer: 'Devfolio',
          description: 'A premier hackathon hosted on Devfolio. Build, ship, and win amazing prizes!',
          prize: '₹3,00,000',
          mode: 'Hybrid',
          difficulty: 'Intermediate',
          tags: 'Web3, Blockchain, Open Source',
          registrationUrl: urlInput
        };
      } else if (urlInput.includes('hackerearth')) {
        fetchedData = {
          title: 'HackerEarth Challenge',
          organizer: 'HackerEarth',
          description: 'Participate in this competitive programming and hackathon challenge on HackerEarth.',
          prize: '₹2,00,000',
          mode: 'Online',
          difficulty: 'Advanced',
          tags: 'Competitive Programming, Algorithms, DSA',
          registrationUrl: urlInput
        };
      } else if (urlInput.includes('mlh') || urlInput.includes('majorleaguehacking')) {
        fetchedData = {
          title: 'MLH Hackathon',
          organizer: 'Major League Hacking',
          description: 'Official MLH hackathon event. Learn, build, and share with the global hacker community.',
          prize: 'Swag + Certificates',
          mode: 'Hybrid',
          difficulty: 'Beginner',
          tags: 'Learning, Community, Beginner Friendly',
          registrationUrl: urlInput
        };
      } else {
        // Generic fetch for unknown URLs
        fetchedData = {
          title: 'Hackathon Event',
          organizer: 'Organization',
          description: 'Details fetched from the provided URL. Please verify and update the information.',
          registrationUrl: urlInput
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
    
    // In production, this would save to database
    console.log('Posting hackathon:', formData);
    
    alert('Hackathon posted successfully!');
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Post New Hackathon</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Add a hackathon for students to discover</p>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className={`rounded-xl shadow-lg border overflow-hidden mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}">
          <button
            onClick={() => setInputMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              inputMode === 'manual'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
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
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <Globe size={32} className="text-white" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Auto-Fetch Hackathon Details</h2>
              <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Paste a hackathon URL from Unstop, Devfolio, HackerEarth, or MLH
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="url"
                  placeholder="https://unstop.com/hackathons/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`w-full pl-11 pr-4 py-4 border rounded-xl outline-none transition-all text-lg ${
                    isDark 
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' 
                      : 'bg-slate-50 border-slate-200 focus:border-purple-500'
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
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50"
              >
                {fetchLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Fetching details...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Fetch Hackathon Details
                  </>
                )}
              </button>

              {/* Supported Platforms */}
              <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Supported Platforms:</p>
                <div className="flex flex-wrap gap-2">
                  {['Unstop', 'Devfolio', 'HackerEarth', 'MLH', 'Devpost'].map(platform => (
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
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Trophy size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">InternHub Admin</h2>
                  <p className="text-white/80 text-sm">Posting a new hackathon</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Trophy size={16} />
                  </div>
                  Hackathon Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Hackathon Title</label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="e.g., Smart India Hackathon 2025"
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Organizer</label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="e.g., Google, Microsoft, Flipkart"
                      value={formData.organizer} 
                      onChange={e => setFormData({...formData, organizer: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Award size={16} className="text-purple-500" /> Prize
                    </label>
                    <input 
                      required 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="e.g., ₹5,00,000 or Swag + Certificates"
                      value={formData.prize} 
                      onChange={e => setFormData({...formData, prize: e.target.value})} 
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Description</label>
                    <textarea 
                      required 
                      rows={4} 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="Describe the hackathon, its goals, and what participants will build..."
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Mode</label>
                    <select 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      value={formData.mode} 
                      onChange={e => setFormData({...formData, mode: e.target.value as any})}
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Difficulty Level</label>
                    <select 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      value={formData.difficulty} 
                      onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {formData.mode !== 'Online' && (
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <MapPin size={16} className="text-purple-500" /> Location
                      </label>
                      <input 
                        type="text" 
                        className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                        placeholder="e.g., Bangalore, India"
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className={`border-t pt-8 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Calendar size={16} />
                  </div>
                  Important Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Clock size={14} className="text-red-500" /> Registration Deadline
                    </label>
                    <input 
                      required 
                      type="date" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      value={formData.deadline} 
                      onChange={e => setFormData({...formData, deadline: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Start Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      value={formData.startDate} 
                      onChange={e => setFormData({...formData, startDate: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>End Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      value={formData.endDate} 
                      onChange={e => setFormData({...formData, endDate: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Tags & Registration */}
              <div className={`border-t pt-8 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Tag size={16} />
                  </div>
                  Additional Info
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Tags (comma separated)</label>
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="e.g., AI/ML, Web Development, Blockchain"
                      value={formData.tags} 
                      onChange={e => setFormData({...formData, tags: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <ExternalLink size={14} className="text-purple-500" /> Registration URL
                    </label>
                    <input 
                      required 
                      type="url" 
                      className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500' : 'bg-white border-slate-200 focus:border-purple-500'}`}
                      placeholder="https://unstop.com/hackathons/..."
                      value={formData.registrationUrl} 
                      onChange={e => setFormData({...formData, registrationUrl: e.target.value})} 
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
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Send size={18} /> Post Hackathon
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
