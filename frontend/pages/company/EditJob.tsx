import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { JobType, Job } from '../../types';
import { Briefcase, MapPin, Calendar, GraduationCap, GitBranch, ClipboardList, IndianRupee, Pencil } from 'lucide-react';

export const EditJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package: '',
    location: '',
    type: JobType.FULL_TIME,
    minCGPA: 0,
    branches: '',
    deadline: '',
    rounds: ''
  });

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      const job = await Api.getJobById(id);
      if (job) {
        setFormData({
          title: job.title,
          description: job.description,
          package: String(job.package),
          location: job.location,
          type: job.type,
          minCGPA: job.eligibility.minCGPA,
          branches: job.eligibility.branches.join(', '),
          deadline: job.deadline.split('T')[0],
          rounds: job.rounds.join(', ')
        });
      }
      setLoading(false);
    };
    loadJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      await Api.updateJob(id, {
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
      });

      alert('Job updated successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      alert('Failed to update job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
            <Pencil size={24} />
          </div>
          <h1 className="text-2xl font-bold">Edit Job Posting</h1>
        </div>
        <p className="text-white/80">Update the job details below</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Details Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                <Briefcase size={18} className="text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800">Job Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., Software Engineer"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea 
                  required 
                  rows={4} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="Describe the role, responsibilities, and requirements..."
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <IndianRupee size={14} className="text-emerald-600" /> Package (LPA)
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.1" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., 12"
                  value={formData.package} 
                  onChange={e => setFormData({...formData, package: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-600" /> Location
                </label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  placeholder="e.g., Bangalore, Remote"
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label>
                <select 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white font-medium" 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value as JobType})}
                >
                  <option value={JobType.FULL_TIME}>Full Time</option>
                  <option value={JobType.INTERNSHIP}>Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-600" /> Deadline
                </label>
                <input 
                  required 
                  type="date" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Eligibility Section */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg">
                <GraduationCap size={18} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-slate-800">Eligibility & Process</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Minimum CGPA</label>
                  <input 
                    required 
                    type="number" 
                    step="0.1" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all" 
                    placeholder="e.g., 7.0"
                    value={formData.minCGPA} 
                    onChange={e => setFormData({...formData, minCGPA: Number(e.target.value)})} 
                  />
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <GitBranch size={14} className="text-violet-600" /> Eligible Branches
                  </label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all" 
                    placeholder="e.g., CSE, ECE, IT"
                    value={formData.branches} 
                    onChange={e => setFormData({...formData, branches: e.target.value})} 
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <ClipboardList size={14} className="text-violet-600" /> Hiring Rounds
                  </label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all" 
                    placeholder="e.g., Online Test, Technical Interview, HR"
                    value={formData.rounds} 
                    onChange={e => setFormData({...formData, rounds: e.target.value})} 
                  />
               </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t">
            <button 
              type="button" 
              onClick={() => navigate('/company/dashboard')} 
              className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-600 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Update Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
