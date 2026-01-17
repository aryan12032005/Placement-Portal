import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { Api } from '../../services/api';
import { 
  Trophy, Link as LinkIcon, FileText, Calendar, Award, Users, MapPin, 
  ArrowLeft, Send, Loader2, Globe, Sparkles, Tag, Clock, ExternalLink,
  CheckCircle, AlertCircle, Trash2, ChevronDown, ChevronUp, Settings
} from 'lucide-react';
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog';

// Helper function to parse various date formats into YYYY-MM-DD
const parseFlexibleDate = (dateStr: string): string => {
  if (!dateStr || dateStr === 'Not mentioned' || dateStr === 'Not Disclosed') return '';
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  const months: { [key: string]: number } = {
    'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
    'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
    'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'september': 8,
    'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
  };
  
  const cleanStr = dateStr.toLowerCase().replace(/[,]/g, '').trim();
  
  // Try "29 Jan 2026"
  let match = cleanStr.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s*([a-z]+)\s*(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = months[match[2]];
    const year = parseInt(match[3]);
    if (month !== undefined && day >= 1 && day <= 31 && year >= 2020) {
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Try "Jan 29 2026"
  match = cleanStr.match(/([a-z]+)\s*(\d{1,2})(?:st|nd|rd|th)?\s*(\d{4})/);
  if (match) {
    const month = months[match[1]];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    if (month !== undefined && day >= 1 && day <= 31 && year >= 2020) {
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Try DD/MM/YYYY
  match = cleanStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2020) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Fallback: try native Date parsing
  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2020) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {}
  
  return '';
};

interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  deadline: string;
  mode: string;
  status: string;
  postedDate: string;
}

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
  const { confirm, dialogProps } = useConfirmDialog();
  
  const [inputMode, setInputMode] = useState<'manual' | 'url'>('manual');
  const [urlInput, setUrlInput] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);
  
  // Management section state
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [showManagement, setShowManagement] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loadingHackathons, setLoadingHackathons] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoadingHackathons(true);
    const data = await Api.getHackathons();
    setHackathons(data);
    setLoadingHackathons(false);
  };

  const handleDeleteHackathon = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: 'Delete Hackathon',
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setDeleting(id);
    try {
      await Api.deleteHackathon(id);
      setHackathons(hackathons.filter(h => h.id !== id));
      toast.success('Hackathon deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete hackathon');
    }
    setDeleting(null);
  };
  
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

    // Validate URL format
    try {
      new URL(urlInput.trim());
    } catch {
      setFetchError('Please enter a valid URL (e.g., https://example.com/hackathon)');
      return;
    }

    setFetchLoading(true);
    setFetchError('');
    setFetchSuccess(false);

    try {
      // Call backend hackathon extraction API (uses ScraperAPI + OpenRouter)
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api' 
        : 'https://placement-portal-1ca3.onrender.com/api';
      
      const response = await fetch(`${API_URL}/extract-hackathon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data from URL');
      }

      const data = await response.json();
      console.log('Extracted hackathon data:', data);

      // Track which fields couldn't be extracted
      const missingFields: string[] = [];
      
      const isValid = (val: string) => val && val !== 'Not mentioned' && val !== 'Not Disclosed';

      // Parse dates with improved parsing
      const deadlineVal = parseFlexibleDate(data.deadline);
      const startDateVal = parseFlexibleDate(data.startDate);
      const endDateVal = parseFlexibleDate(data.endDate);
      
      if (!deadlineVal) missingFields.push('Deadline');
      if (!startDateVal) missingFields.push('Start Date');
      if (!endDateVal) missingFields.push('End Date');
      if (!isValid(data.prize)) missingFields.push('Prize');
      if (!isValid(data.title)) missingFields.push('Title');

      // Map extracted data to form fields - no fallback defaults
      const fetchedData: Partial<HackathonFormData> = {
        title: isValid(data.title) ? data.title : '',
        organizer: isValid(data.organizer) ? data.organizer : '',
        description: isValid(data.description) ? data.description : '',
        prize: isValid(data.prize) ? data.prize : '',
        mode: (data.mode === 'Online' || data.mode === 'Offline' || data.mode === 'Hybrid') ? data.mode : 'Online',
        difficulty: (data.difficulty === 'Beginner' || data.difficulty === 'Intermediate' || data.difficulty === 'Advanced') ? data.difficulty : 'Intermediate',
        tags: isValid(data.tags) ? data.tags : '',
        location: isValid(data.location) ? data.location : '',
        registrationUrl: urlInput.trim(),
        deadline: deadlineVal,
        startDate: startDateVal,
        endDate: endDateVal,
      };

      // Show toast with extraction results
      if (missingFields.length > 0) {
        toast(`Some fields couldn't be extracted: ${missingFields.join(', ')}. Please fill them manually.`, {
          icon: '⚠️',
          style: { background: '#F59E0B', color: '#fff' },
          duration: 5000,
        });
      } else {
        toast.success('All fields extracted successfully!');
      }

      setFormData(prev => ({ ...prev, ...fetchedData }));
      setFetchSuccess(true);
      setInputMode('manual'); // Switch to manual to show and edit the fetched data

    } catch (error) {
      console.error('Fetch error:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to fetch data from URL. Please try again or enter details manually.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await Api.postHackathon(formData);
      toast.success('Hackathon posted successfully!');
      // Refresh the hackathons list
      fetchHackathons();
      // Reset form
      setFormData({
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
    } catch (error) {
      toast.error('Failed to post hackathon. Please try again.');
    }
  };

  return (
    <>
    <ConfirmDialog {...dialogProps} />
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Manage Hackathons</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Post new hackathons or manage existing ones</p>
        </div>
      </div>

      {/* Manage Existing Hackathons Section */}
      <div className={`rounded-xl shadow-lg border overflow-hidden mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <button
          onClick={() => setShowManagement(!showManagement)}
          className={`w-full flex items-center justify-between p-4 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'} transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/50' : 'bg-purple-100'}`}>
              <Settings size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div className="text-left">
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Manage Existing Hackathons
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {hackathons.length} hackathons posted
              </p>
            </div>
          </div>
          {showManagement ? <ChevronUp size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} /> : <ChevronDown size={20} className={isDark ? 'text-slate-400' : 'text-slate-500'} />}
        </button>
        
        {showManagement && (
          <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {loadingHackathons ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading hackathons...</p>
              </div>
            ) : hackathons.length === 0 ? (
              <div className="p-8 text-center">
                <Trophy size={40} className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No hackathons posted yet</p>
              </div>
            ) : (
              <div className="divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}">
                {hackathons.map((hackathon) => (
                  <div key={hackathon.id} className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold`}>
                        {hackathon.organizer?.charAt(0) || 'H'}
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{hackathon.title}</h3>
                        <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{hackathon.organizer}</span>
                          <span>•</span>
                          <span>{hackathon.mode}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            hackathon.status === 'Ongoing' ? 'bg-green-100 text-green-700' : 
                            hackathon.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {hackathon.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHackathon(hackathon.id, hackathon.title)}
                      disabled={deleting === hackathon.id}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-500 hover:text-red-600'
                      } ${deleting === hackathon.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="Delete hackathon"
                    >
                      {deleting === hackathon.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post New Hackathon Section */}
      <div className={`mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Trophy size={20} className="text-purple-500" />
          Post New Hackathon
        </h2>
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
    </>
  );
};
