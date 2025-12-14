import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Building2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    // Student specific
    rollNumber: '',
    branch: '',
    // Company specific
    companyName: '',
    industry: '',
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Api.register({
        role,
        name: role === UserRole.COMPANY ? formData.companyName : formData.name,
        email: formData.email,
        password: formData.password,
        ...(role === UserRole.STUDENT && {
          rollNumber: formData.rollNumber,
          branch: formData.branch,
          cgpa: 0,
          skills: [],
        }),
        ...(role === UserRole.COMPANY && {
          companyName: formData.companyName,
          industry: formData.industry,
        })
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      alert(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a</label>
            <div className="flex gap-4">
              {[UserRole.STUDENT, UserRole.COMPANY].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{r.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {role === UserRole.STUDENT ? (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Roll Number"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                />
                 <input
                  type="text"
                  placeholder="Branch (e.g. Computer Science)"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Company Name"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Industry"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                />
              </>
            )}
            
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Register
          </button>
        </form>
         <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">Back to Login</Link>
          </div>
      </div>
    </div>
  );
};