import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Building2, ArrowRight, Sparkles, GraduationCap, Building, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const user = await Api.login(email, password);
      
      if (user) {
        if (user.role !== role) {
           setError('Role mismatch. Please select the correct role.');
           return;
        }
        if (!user.approved && user.role !== UserRole.STUDENT) { // Students are auto-approved in this logic usually, but let's stick to backend
           // Backend defaults approved=false. 
           // If backend logic requires approval, we should check it.
           // For now, let's assume if login succeeds, it's fine, or check user.approved
           if (!user.approved && user.role !== UserRole.STUDENT) {
             setError('Account waiting for admin approval.');
             return;
           }
        }
        login(user);
        switch(user.role) {
          case UserRole.STUDENT: navigate('/student/dashboard'); break;
          case UserRole.COMPANY: navigate('/company/dashboard'); break;
          case UserRole.ADMIN: navigate('/admin/dashboard'); break;
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const roleConfig = {
    [UserRole.STUDENT]: { icon: GraduationCap, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-100', text: 'text-violet-600' },
    [UserRole.COMPANY]: { icon: Building, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-100', text: 'text-emerald-600' },
    [UserRole.ADMIN]: { icon: Shield, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-100', text: 'text-rose-600' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 border border-white/20">
        <div className={`bg-gradient-to-r ${roleConfig[role].gradient} p-8 text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-white/80">Sign in to UniPlace Portal</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.values(UserRole) as UserRole[]).map((r) => {
                  const config = roleConfig[r];
                  const Icon = config.icon;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-4 px-2 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                        role === r 
                          ? `${config.bg} border-current ${config.text} shadow-lg scale-105` 
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-semibold">{r}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-slate-50 hover:bg-white"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all bg-slate-50 hover:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 text-sm rounded-xl border border-red-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-gradient-to-r ${roleConfig[role].gradient} hover:opacity-90 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};