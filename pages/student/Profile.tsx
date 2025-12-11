import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../services/api';
import { Upload, FileText, Save } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    cgpa: user?.cgpa || 0,
    skills: user?.skills?.join(', ') || '',
    resumeUrl: user?.resumeUrl || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      cgpa: Number(formData.cgpa),
      skills: formData.skills.split(',').map(s => s.trim()),
      resumeUrl: formData.resumeUrl
    };

    await Api.updateUser(updatedUser);
    login(updatedUser); // Update context
    alert('Profile updated successfully!');
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload
      setFormData({ ...formData, resumeUrl: `https://fake-cloud.com/${file.name}` });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-8">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-slate-500">{user?.email}</p>
            <p className="text-sm text-slate-400 mt-1">{user?.rollNumber} • {user?.branch}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">CGPA</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.cgpa}
                onChange={(e) => setFormData({...formData, cgpa: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Skills (comma separated)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              placeholder="React, Java, Python..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Resume</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
              {formData.resumeUrl ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <FileText size={24} />
                  <span className="font-medium">Resume Uploaded</span>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, resumeUrl: ''})}
                    className="ml-4 text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-2 text-slate-500">
                    <Upload size={32} />
                    <span>Click to upload resume (PDF/DOC)</span>
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};