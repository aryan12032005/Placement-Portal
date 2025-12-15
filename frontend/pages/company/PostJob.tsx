import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { JobType } from '../../types';
import { Briefcase, MapPin, IndianRupee, Calendar, GraduationCap, Users, Send, ArrowLeft } from 'lucide-react';

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: '',
    location: '',
    type: JobType.FULL_TIME,
    minCGPA: 0,
    branches: 'Computer Science, Information Technology, Electronics',
    deadline: '',
    rounds: 'Online Test, Technical Interview, HR'
  });

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

    alert('Job posted successfully!');
    navigate('/company/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/company/dashboard')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <ArrowLeft size={20} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Post New Job</h1>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Create a new job listing for students</p>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Form Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.companyName || user?.name}</h2>
              <p className="text-white/80 text-sm">Posting a new opportunity</p>
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
              Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Job Title</label>
                <input 
                  required 
                  type="text" 
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                  placeholder="e.g., Software Engineer, Data Analyst"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Job Description</label>
                <textarea 
                  required 
                  rows={4} 
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <IndianRupee size={16} className="text-indigo-500" /> Package (LPA)
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.1" 
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                  placeholder="e.g., 12"
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
                <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Job Type</label>
                <select 
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-all ${isDark ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                >
                  <option value={JobType.FULL_TIME}>Full Time</option>
                  <option value={JobType.INTERNSHIP}>Internship</option>
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
              onClick={() => navigate('/company/dashboard')}
              className={`px-6 py-3 border rounded-xl font-semibold transition-all ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition-all"
            >
              <Send size={18} /> Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
