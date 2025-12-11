import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { JobType } from '../../types';

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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Post New Job</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required rows={4} className="w-full px-4 py-2 border rounded-lg" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Package (LPA)</label>
              <input required type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
              <select className="w-full px-4 py-2 border rounded-lg" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as JobType})}>
                <option value={JobType.FULL_TIME}>Full Time</option>
                <option value={JobType.INTERNSHIP}>Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
              <input required type="date" className="w-full px-4 py-2 border rounded-lg" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <h3 className="font-medium text-slate-800 mb-4">Eligibility & Rounds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Min CGPA</label>
                    <input required type="number" step="0.1" className="w-full px-4 py-2 border rounded-lg" value={formData.minCGPA} onChange={e => setFormData({...formData, minCGPA: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Eligible Branches (comma separated)</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.branches} onChange={e => setFormData({...formData, branches: e.target.value})} />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hiring Rounds (comma separated)</label>
                    <input required type="text" className="w-full px-4 py-2 border rounded-lg" value={formData.rounds} onChange={e => setFormData({...formData, rounds: e.target.value})} />
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};