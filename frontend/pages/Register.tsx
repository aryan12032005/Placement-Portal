import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Sparkles, GraduationCap, Building, UserPlus, ArrowRight } from 'lucide-react';

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

  const roleConfig = {
    [UserRole.STUDENT]: { icon: GraduationCap, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-300' },
    [UserRole.COMPANY]: { icon: Building, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  };

  const currentConfig = roleConfig[role as keyof typeof roleConfig] || roleConfig[UserRole.STUDENT];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 border border-white/20">
        <div className={`bg-gradient-to-r ${currentConfig.gradient} p-8 text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-white/80">Join UniPlace today</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-4">
                {[UserRole.STUDENT, UserRole.COMPANY].map((r) => {
                  const config = roleConfig[r];
                  const Icon = config.icon;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-4 px-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-3 ${
                        role === r 
                          ? `${config.bg} ${config.border} ${config.text} shadow-lg scale-105` 
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="font-semibold capitalize">{r.toLowerCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {role === UserRole.STUDENT ? (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all bg-slate-50 hover:bg-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Roll Number"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all bg-slate-50 hover:bg-white"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Branch (e.g. Computer Science)"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all bg-slate-50 hover:bg-white"
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-slate-50 hover:bg-white"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Industry"
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all bg-slate-50 hover:bg-white"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </>
              )}
              
              <input
                type="email"
                placeholder="Email Address"
                required
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 ${role === UserRole.STUDENT ? 'focus:ring-violet-100 focus:border-violet-500' : 'focus:ring-emerald-100 focus:border-emerald-500'} outline-none transition-all bg-slate-50 hover:bg-white`}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                required
                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 ${role === UserRole.STUDENT ? 'focus:ring-violet-100 focus:border-violet-500' : 'focus:ring-emerald-100 focus:border-emerald-500'} outline-none transition-all bg-slate-50 hover:bg-white`}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-gradient-to-r ${currentConfig.gradient} hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-purple-600 font-semibold hover:underline">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};