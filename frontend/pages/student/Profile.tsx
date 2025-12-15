import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../services/api';
import { uploadResume, deleteResume } from '../../services/supabase';
import { Upload, FileText, Save, User as UserIcon, GraduationCap, Mail, Phone, Linkedin, Edit2, Loader2 } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    linkedIn: user?.linkedIn || '',
    rollNumber: user?.rollNumber || '',
    branch: user?.branch || '',
    course: user?.course || '',
    collegeName: user?.collegeName || '',
    graduationYear: user?.graduationYear || new Date().getFullYear(),
    educationStatus: user?.educationStatus || 'Pursuing',
    cgpa: user?.cgpa || 0,
    skills: user?.skills?.join(', ') || '',
    resumeUrl: user?.resumeUrl || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      linkedIn: formData.linkedIn,
      rollNumber: formData.rollNumber,
      branch: formData.branch,
      course: formData.course,
      collegeName: formData.collegeName,
      graduationYear: Number(formData.graduationYear),
      educationStatus: formData.educationStatus as 'Pursuing' | 'Graduated' | 'Undergraduate',
      cgpa: Number(formData.cgpa),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      resumeUrl: formData.resumeUrl
    };

    await Api.updateUser(updatedUser);
    login(updatedUser);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setUploading(true);
      try {
        const resumeUrl = await uploadResume(file, user.id);
        if (resumeUrl) {
          setFormData({ ...formData, resumeUrl });
          alert('Resume uploaded successfully!');
        } else {
          alert('Failed to upload resume. Please check your Supabase configuration.');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload resume');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRemoveResume = async () => {
    if (formData.resumeUrl) {
      await deleteResume(formData.resumeUrl);
      setFormData({ ...formData, resumeUrl: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg border border-white/30">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{formData.name || 'Your Name'}</h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <Mail size={16} /> {user?.email}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur hover:bg-white/30 rounded-xl transition-all text-white font-medium border border-white/30"
            >
              <Edit2 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <form onSubmit={handleUpdate}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
            <p className="text-3xl font-bold text-purple-600">{formData.cgpa || 0}</p>
            <p className="text-slate-500 text-sm font-medium">CGPA</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
            <p className="text-3xl font-bold text-blue-600">{formData.graduationYear}</p>
            <p className="text-slate-500 text-sm font-medium">Grad Year</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
            <p className="text-3xl font-bold text-emerald-600">{formData.skills.split(',').filter(s => s.trim()).length}</p>
            <p className="text-slate-500 text-sm font-medium">Skills</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 text-center">
            <p className="text-xl font-bold text-amber-600">{formData.resumeUrl ? '✓' : '✗'}</p>
            <p className="text-slate-500 text-sm font-medium">Resume</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
              <UserIcon size={18} />
            </div>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Full Name"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">{formData.name || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" /> {formData.phone || 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">LinkedIn Profile</label>
              {isEditing ? (
                <input
                  type="url"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({...formData, linkedIn: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">
                  {formData.linkedIn ? (
                    <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                      <Linkedin size={16} /> View Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Roll Number / ID</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  placeholder="2K23CSUN01000"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">{formData.rollNumber || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={18} />
            </div>
            Education Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">College / University</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                  placeholder="Enter your college name"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">{formData.collegeName || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Course / Degree</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  placeholder="B.Tech Computer Science"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">{formData.course || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Branch / Specialization</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  placeholder="Computer Science & Engineering"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">{formData.branch || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Education Status</label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.educationStatus}
                  onChange={(e) => setFormData({...formData, educationStatus: e.target.value})}
                >
                  <option value="Pursuing">Currently Pursuing</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Undergraduate">Undergraduate</option>
                </select>
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.educationStatus === 'Graduated' ? 'bg-green-100 text-green-700' : 
                    formData.educationStatus === 'Pursuing' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {formData.educationStatus}
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Graduation Year</label>
              {isEditing ? (
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: Number(e.target.value)})}
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl font-semibold">{formData.graduationYear}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">CGPA / Percentage</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  value={formData.cgpa}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData({...formData, cgpa: value === '' ? 0 : parseFloat(value) || 0});
                    }
                  }}
                  placeholder="Enter CGPA (e.g., 8.5)"
                />
              ) : (
                <p className="text-slate-800 py-3 bg-slate-50 px-4 rounded-xl">
                  <span className="text-2xl font-bold text-purple-600">{formData.cgpa}</span>
                  <span className="text-slate-400 text-sm ml-2">/ 10</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Resume */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            Skills & Resume
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Technical Skills (comma separated)</label>
            {isEditing ? (
              <textarea
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="React, Node.js, Python, Java, SQL..."
              />
            ) : (
              <div className="flex flex-wrap gap-2 py-3">
                {formData.skills.split(',').filter(s => s.trim()).map((skill, i) => (
                  <span key={i} className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium border border-purple-200">
                    {skill.trim()}
                  </span>
                ))}
                {!formData.skills && <span className="text-slate-400">No skills added</span>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Resume</label>
            <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              formData.resumeUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-purple-400 hover:bg-purple-50'
            }`}>
              {uploading ? (
                <div className="flex items-center justify-center gap-3 text-purple-600">
                  <Loader2 size={28} className="animate-spin" />
                  <span className="font-semibold text-lg">Uploading to Supabase...</span>
                </div>
              ) : formData.resumeUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700 mb-2">Resume Uploaded ✓</p>
                    <a 
                      href={formData.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-emerald-700 transition-all"
                    >
                      <FileText size={18} /> View Resume
                    </a>
                  </div>
                  {isEditing && (
                    <button 
                      type="button" 
                      onClick={handleRemoveResume}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove Resume
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={!isEditing || uploading}
                  />
                  <label htmlFor="resume-upload" className={`flex flex-col items-center gap-3 ${isEditing && !uploading ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                      <Upload size={32} />
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium">Click to upload resume</p>
                      <p className="text-slate-400 text-sm">PDF format, max 5MB</p>
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};