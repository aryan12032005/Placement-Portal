import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Shield, ArrowLeft } from 'lucide-react';

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
        // Validate role based on login mode
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          {isAdminLogin && (
            <button
              onClick={() => { setIsAdminLogin(false); setError(''); setEmail(''); setPassword(''); }}
              className="absolute top-4 left-4 flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back to Student Login</span>
            </button>
          )}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${isAdminLogin ? 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-slate-500/25' : 'bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/25'}`}>
            {isAdminLogin ? <Shield className="text-white" size={32} /> : <GraduationCap className="text-white" size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500">
            {isAdminLogin ? 'Sign in to access admin dashboard' : 'Sign in to discover internships'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all bg-slate-50"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <button type="button" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all bg-slate-50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 text-white ${
              isAdminLogin 
                ? 'bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 shadow-slate-300 hover:shadow-slate-400' 
                : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-purple-200 hover:shadow-purple-300'
            }`}
          >
            {loading ? 'Signing in...' : (isAdminLogin ? 'Sign In as Admin' : 'Sign In')}
          </button>
        </form>

        {/* Divider - Hide for admin */}
        {!isAdminLogin && (
          <>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-400">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                width="350"
              />
            </div>

            {/* Register Link */}
            <p className="text-center mt-6 text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 font-semibold hover:text-purple-700">
                Create free account
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Admin Login Button - Bottom Right Corner */}
      {!isAdminLogin && (
        <button
          onClick={() => { setIsAdminLogin(true); setError(''); setEmail(''); setPassword(''); }}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl shadow-lg transition-all hover:scale-105"
        >
          <Shield size={16} />
          Admin Login
        </button>
      )}
    </div>
  );
};