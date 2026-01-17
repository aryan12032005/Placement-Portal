import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Api } from '../../services/api';
import { uploadResume, deleteResume, uploadProfilePicture, deleteProfilePicture } from '../../services/supabase';
import { Upload, FileText, Save, User as UserIcon, GraduationCap, Mail, Phone, Linkedin, Edit2, Loader2, X, Camera } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, login } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    linkedIn: user?.linkedIn || '',
    rollNumber: user?.rollNumber || '',
    branch: user?.branch || '',
    course: user?.course || '',
    collegeName: user?.collegeName || '',
    graduationYear: user?.graduationYear || new Date().getFullYear(),
    educationStatus: (user?.educationStatus || 'Pursuing') as 'Pursuing' | 'Graduated' | 'Undergraduate',
    cgpa: user?.cgpa || 0,
    skills: user?.skills?.join(', ') || '',
    resumeUrl: user?.resumeUrl || '',
    profilePicture: user?.profilePicture || ''
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
      resumeUrl: formData.resumeUrl,
      profilePicture: formData.profilePicture
    };

    await Api.updateUser(updatedUser);
    login(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error('File size should be less than 5MB'); return; }

      setUploading(true);
      try {
        const resumeUrl = await uploadResume(file, user.id);
        if (resumeUrl) {
          setFormData({ ...formData, resumeUrl });
          toast.success('Resume uploaded successfully!');
        } else {
          toast.error('Failed to upload resume.');
        }
      } catch (error) {
        toast.error('Failed to upload resume');
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

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) { 
        toast.error('Please upload an image file (JPEG, PNG, GIF, or WebP)'); 
        return; 
      }
      if (file.size > 2 * 1024 * 1024) { 
        toast.error('File size should be less than 2MB'); 
        return; 
      }

      setUploadingPicture(true);
      try {
        // Delete old picture if exists
        if (formData.profilePicture) {
          await deleteProfilePicture(formData.profilePicture);
        }
        
        const pictureUrl = await uploadProfilePicture(file, user.id);
        if (pictureUrl) {
          setFormData({ ...formData, profilePicture: pictureUrl });
          
          // Auto-save the profile picture
          const updatedUser = { ...user, profilePicture: pictureUrl };
          await Api.updateUser(updatedUser);
          login(updatedUser);
          
          toast.success('Profile picture uploaded successfully!');
        } else {
          toast.error('Failed to upload profile picture. Check browser console for details.');
        }
      } catch (error: any) {
        console.error('Profile picture upload error:', error);
        toast.error(`Failed to upload profile picture: ${error?.message || 'Unknown error'}`);
      } finally {
        setUploadingPicture(false);
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (formData.profilePicture && user) {
      await deleteProfilePicture(formData.profilePicture);
      setFormData({ ...formData, profilePicture: '' });
      
      // Auto-save the removal
      const updatedUser = { ...user, profilePicture: '' };
      await Api.updateUser(updatedUser);
      login(updatedUser);
    }
  };

  const cardClass = `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border`;
  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`;
  const inputClass = `w-full px-4 py-2.5 rounded-lg border outline-none transition-all ${
    isDark 
      ? 'bg-slate-700 border-slate-600 text-white focus:border-indigo-500' 
      : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
  }`;
  const displayClass = `py-2.5 px-4 rounded-lg ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-800'}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className={`${cardClass} p-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Profile Picture with Upload */}
            <div className="relative group">
              {formData.profilePicture ? (
                <img 
                  src={formData.profilePicture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Upload overlay */}
              <label className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingPicture ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploadingPicture}
                />
              </label>
              {/* Remove button */}
              {formData.profilePicture && (
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {formData.name || 'Your Name'}
              </h1>
              <p className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <Mail size={14} /> {user?.email}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CGPA', value: formData.cgpa || 0 },
          { label: 'Grad Year', value: formData.graduationYear },
          { label: 'Skills', value: formData.skills.split(',').filter(s => s.trim()).length },
          { label: 'Resume', value: formData.resumeUrl ? '✓' : '✗' },
        ].map((stat) => (
          <div key={stat.label} className={`${cardClass} p-4 text-center`}>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Personal Information */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <UserIcon size={20} className="text-indigo-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
              ) : (
                <p className={displayClass}>{formData.name || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              {isEditing ? (
                <input type="tel" className={inputClass} value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
              ) : (
                <p className={displayClass}>{formData.phone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>LinkedIn Profile</label>
              {isEditing ? (
                <input type="url" className={inputClass} value={formData.linkedIn}
                  onChange={(e) => setFormData({...formData, linkedIn: e.target.value})} placeholder="https://linkedin.com/in/..." />
              ) : (
                <p className={displayClass}>
                  {formData.linkedIn ? (
                    <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2">
                      <Linkedin size={16} /> View Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Roll Number</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} placeholder="2K23CSUN01000" />
              ) : (
                <p className={displayClass}>{formData.rollNumber || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education Details */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <GraduationCap size={20} className="text-indigo-600" /> Education Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>College / University</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.collegeName}
                  onChange={(e) => setFormData({...formData, collegeName: e.target.value})} placeholder="Enter college name" />
              ) : (
                <p className={displayClass}>{formData.collegeName || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Course / Degree</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})} placeholder="B.Tech Computer Science" />
              ) : (
                <p className={displayClass}>{formData.course || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Branch / Specialization</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})} placeholder="Computer Science" />
              ) : (
                <p className={displayClass}>{formData.branch || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Education Status</label>
              {isEditing ? (
                <select className={inputClass} value={formData.educationStatus}
                  onChange={(e) => setFormData({...formData, educationStatus: e.target.value as 'Pursuing' | 'Graduated' | 'Undergraduate'})}>
                  <option value="Pursuing">Currently Pursuing</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Undergraduate">Undergraduate</option>
                </select>
              ) : (
                <p className={displayClass}>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    formData.educationStatus === 'Graduated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>{formData.educationStatus}</span>
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Graduation Year</label>
              {isEditing ? (
                <input type="number" min="2000" max="2030" className={inputClass} value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: Number(e.target.value)})} />
              ) : (
                <p className={displayClass}>{formData.graduationYear}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>CGPA</label>
              {isEditing ? (
                <input type="text" className={inputClass} value={formData.cgpa}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData({...formData, cgpa: value === '' ? 0 : parseFloat(value) || 0});
                    }
                  }} placeholder="8.5" />
              ) : (
                <p className={displayClass}><span className="text-xl font-bold text-indigo-600">{formData.cgpa}</span> / 10</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Resume */}
        <div className={`${cardClass} p-6`}>
          <h3 className={`text-lg font-semibold mb-5 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <FileText size={20} className="text-indigo-600" /> Skills & Resume
          </h3>
          
          <div className="mb-6">
            <label className={labelClass}>Technical Skills (comma separated)</label>
            {isEditing ? (
              <textarea rows={3} className={inputClass} value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, Python..." />
            ) : (
              <div className="flex flex-wrap gap-2 py-2">
                {formData.skills.split(',').filter(s => s.trim()).map((skill, i) => (
                  <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    isDark ? 'bg-slate-700 text-slate-300' : 'bg-indigo-50 text-indigo-700'
                  }`}>{skill.trim()}</span>
                ))}
                {!formData.skills && <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>No skills added</span>}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Resume</label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center ${
              formData.resumeUrl 
                ? isDark ? 'border-emerald-700 bg-emerald-900/20' : 'border-emerald-300 bg-emerald-50' 
                : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-indigo-400'
            }`}>
              {uploading ? (
                <div className="flex items-center justify-center gap-3 text-indigo-600">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="font-medium">Uploading...</span>
                </div>
              ) : formData.resumeUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <FileText className="text-emerald-600" size={32} />
                  <p className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Resume Uploaded</p>
                  <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" 
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors text-sm">
                    View Resume
                  </a>
                  {isEditing && (
                    <button type="button" onClick={handleRemoveResume} className="text-sm text-red-500 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" id="resume-upload" disabled={!isEditing} />
                  <label htmlFor="resume-upload" className={`flex flex-col items-center gap-2 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                    <Upload className={isDark ? 'text-slate-500' : 'text-slate-400'} size={32} />
                    <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Click to upload resume</p>
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>PDF format, max 5MB</p>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setIsEditing(false)}
              className={`px-5 py-2.5 rounded-lg font-medium border transition-colors ${
                isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}>
              Cancel
            </button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Save size={18} /> Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
