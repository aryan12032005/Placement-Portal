import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Hash, BookOpen } from 'lucide-react';

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    branch: '',
  });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Api.register({
        role: 'STUDENT',
        name: formData.name,
        email: formData.email,
        password: formData.password,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        cgpa: 0,
        skills: [],
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      alert(error.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setLoading(true);
    try {
      if (credentialResponse.credential) {
        const user = await Api.googleLogin(credentialResponse.credential);
        if (user) {
          login(user);
          navigate('/student/dashboard');
        } else {
          alert('Google sign-up failed. Please try again.');
        }
      }
    } catch (err) {
      alert('Google sign-up failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    alert('Google sign-up was cancelled or failed.');
  };

  const inputClass = "w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all bg-slate-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-500">Join InternHub to discover internships</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                className={inputClass}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Roll Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                className={inputClass}
                placeholder="2021CS1234"
                value={formData.rollNumber}
                onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
              />
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Branch</label>
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Computer Science"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className={inputClass}
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all bg-slate-50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 disabled:opacity-70 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-sm text-slate-400">Or continue with</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Google Sign Up */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signup_with"
            width="350"
          />
        </div>

        {/* Login Link */}
        <p className="text-center mt-6 text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
