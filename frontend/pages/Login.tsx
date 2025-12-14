import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Api } from '../services/api';
import { UserRole } from '../types';
import { Building2, ArrowRight } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8">Sign in to UniPlace Portal</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.values(UserRole) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 text-xs sm:text-sm rounded-lg border transition-all ${
                      role === r 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Register here
            </Link>
          </div>
        </div>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400">
          Demo Credentials:<br/>
          admin@uni.edu | hr@techcorp.com | john@student.uni.edu
        </div>
      </div>
    </div>
  );
};