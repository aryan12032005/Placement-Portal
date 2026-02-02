import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Shield, ArrowLeft, Briefcase, Trophy, BookOpen } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await Api.login(email, password);
      
      if (user) {
        if (isAdminLogin && user.role !== UserRole.ADMIN) {
          setError('Access denied. Admin credentials required.');
          setLoading(false);
          return;
        }
        
        if (!isAdminLogin && user.role === UserRole.ADMIN) {
          setError('Please use Admin Login for admin access.');
          setLoading(false);
          return;
        }
        
        login(user);
        if (user.role === UserRole.ADMIN) {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setLoading(true);
    
    try {
      if (credentialResponse.credential) {
        const user = await Api.googleLogin(credentialResponse.credential);
        
        if (user) {
          login(user);
          navigate('/student/dashboard');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button for admin */}
      {isAdminLogin && (
        <div className="px-4 py-3 flex items-center bg-white sticky top-0 z-10">
          <button
            onClick={() => { setIsAdminLogin(false); setError(''); setEmail(''); setPassword(''); }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 ${
            isAdminLogin 
              ? 'bg-gradient-to-br from-slate-700 to-slate-900' 
              : 'bg-gradient-to-br from-violet-500 to-purple-600'
          } shadow-xl`}>
            {isAdminLogin ? (
              <Shield className="text-white" size={40} />
            ) : (
              <GraduationCap className="text-white" size={40} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isAdminLogin ? 'Admin Portal' : 'InternHub'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdminLogin ? 'Sign in to manage the platform' : 'Your gateway to amazing internships'}
          </p>
        </div>

        {/* Features Pills - Only for student login */}
        {!isAdminLogin && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
              <Briefcase size={12} />
              <span>Internships</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              <Trophy size={12} />
              <span>Hackathons</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
              <BookOpen size={12} />
              <span>Courses</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-100 focus:border-violet-400 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <button type="button" className="text-xs text-violet-600 hover:text-violet-700 font-medium">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-100 focus:border-violet-400 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:scale-100 text-white text-base ${
              isAdminLogin 
                ? 'bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-300' 
                : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-200'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              isAdminLogin ? 'Sign In as Admin' : 'Sign In'
            )}
          </button>
        </form>

        {/* Divider - Only for student login */}
        {!isAdminLogin && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
                width="320"
              />
            </div>

            {/* Register Link */}
            <p className="text-center mt-8 text-slate-500 text-sm">
              New to InternHub?{' '}
              <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700">
                Create account
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Admin Login Button - Fixed at bottom */}
      {!isAdminLogin && (
        <div className="px-6 pb-8 pt-4 border-t border-slate-100 bg-white">
          <button
            onClick={() => { setIsAdminLogin(true); setError(''); setEmail(''); setPassword(''); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-2xl transition-colors"
          >
            <Shield size={16} />
            Admin Login
          </button>
        </div>
      )}
    </div>
  );
};