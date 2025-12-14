import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Api } from '../../services/api';
import { Upload, FileText, Save, User as UserIcon, GraduationCap, Mail, Phone, Linkedin, Edit2 } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, resumeUrl: `https://cloud-storage.com/${file.name}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} /> Edit Profile
          </button>
        )}
      </div>
      
      <form onSubmit={handleUpdate}>
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  className="text-2xl font-bold text-slate-800 w-full px-3 py-2 border border-slate-300 rounded-lg mb-2"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Full Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-slate-800">{formData.name}</h2>
              )}
              <p className="text-slate-500 flex items-center gap-2 mt-1">
                <Mail size={16} /> {user?.email}
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  {formData.rollNumber || 'Roll Number'}
                </span>
                <span className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                  {formData.course || formData.branch || 'Course'}
                </span>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  formData.educationStatus === 'Graduated' ? 'bg-green-50 text-green-700' : 
                  formData.educationStatus === 'Pursuing' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {formData.educationStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserIcon size={20} className="text-blue-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.phone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">LinkedIn Profile</label>
              {isEditing ? (
                <input
                  type="url"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.linkedIn}
                  onChange={(e) => setFormData({...formData, linkedIn: e.target.value})}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              ) : (
                <p className="text-slate-800 py-2.5">
                  {formData.linkedIn ? (
                    <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Linkedin size={16} /> View Profile
                    </a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Roll Number / ID</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  placeholder="2K23CSUN01000"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.rollNumber || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Education Details */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600" /> Education Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">College / University</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({...formData, collegeName: e.target.value})}
                  placeholder="Enter your college name"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.collegeName || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Course / Degree</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  placeholder="B.Tech Computer Science"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.course || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Branch / Specialization</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  placeholder="Computer Science & Engineering"
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.branch || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Education Status</label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.educationStatus}
                  onChange={(e) => setFormData({...formData, educationStatus: e.target.value})}
                >
                  <option value="Pursuing">Currently Pursuing</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Undergraduate">Undergraduate</option>
                </select>
              ) : (
                <p className="text-slate-800 py-2.5">{formData.educationStatus}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Graduation Year</label>
              {isEditing ? (
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({...formData, graduationYear: Number(e.target.value)})}
                />
              ) : (
                <p className="text-slate-800 py-2.5">{formData.graduationYear}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">CGPA / Percentage</label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                <p className="text-slate-800 py-2.5 font-semibold">{formData.cgpa}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Resume */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Skills & Resume</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">Technical Skills (comma separated)</label>
            {isEditing ? (
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="React, Node.js, Python, Java, SQL..."
              />
            ) : (
              <div className="flex flex-wrap gap-2 py-2">
                {formData.skills.split(',').filter(s => s.trim()).map((skill, i) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                    {skill.trim()}
                  </span>
                ))}
                {!formData.skills && <span className="text-slate-400">No skills added</span>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Resume</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
              {formData.resumeUrl ? (
                <div className="flex items-center justify-center gap-3 text-green-600">
                  <FileText size={24} />
                  <span className="font-medium">Resume Uploaded</span>
                  {isEditing && (
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, resumeUrl: ''})}
                      className="ml-4 text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={!isEditing}
                  />
                  <label htmlFor="resume-upload" className={`flex flex-col items-center gap-2 text-slate-500 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <Upload size={32} />
                    <span>Click to upload resume (PDF/DOC)</span>
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
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
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