import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { JobType } from '../../types';
import { Briefcase, MapPin, IndianRupee, Calendar, GraduationCap, Users, Send, ArrowLeft } from 'lucide-react';

export const PostJob: React.FC = () => {
  const { user } = useAuth();
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
          className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Post New Job</h1>
          <p className="text-slate-500">Create a new job listing for students</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white">
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white">
                <Briefcase size={16} />
              </div>
              Job Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., Software Engineer, Data Analyst"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
                <textarea 
                  required 
                  rows={4} 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <IndianRupee size={16} className="text-emerald-600" /> Package (LPA)
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.1" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., 12"
                  value={formData.package} 
                  onChange={e => setFormData({...formData, package: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Location
                </label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., Bangalore, Remote"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                >
                  <option value={JobType.FULL_TIME}>Full Time</option>
                  <option value={JobType.INTERNSHIP}>Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-600" /> Application Deadline
                </label>
                <input 
                  required 
                  type="date" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="border-t-2 border-slate-100 pt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                <GraduationCap size={16} />
              </div>
              Eligibility & Selection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum CGPA</label>
                <input 
                  required 
                  type="number" 
                  step="0.1" 
                  max="10"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all" 
                  placeholder="e.g., 7.0"
                  value={formData.minCGPA} 
                  onChange={e => setFormData({...formData, minCGPA: Number(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Eligible Branches (comma separated)</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all" 
                  value={formData.branches} 
                  onChange={e => setFormData({...formData, branches: e.target.value})} 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-amber-600" /> Hiring Rounds (comma separated)
                </label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all" 
                  value={formData.rounds} 
                  onChange={e => setFormData({...formData, rounds: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100">
            <button 
              type="button"
              onClick={() => navigate('/company/dashboard')}
              className="px-6 py-3 border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Send size={18} /> Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};