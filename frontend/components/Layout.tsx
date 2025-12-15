import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  LogOut, 
  Users, 
  Building2, 
  BarChart3,
  Bell,
  Sparkles
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  const getNavItems = () => {
    switch (user.role) {
      case UserRole.STUDENT:
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Briefcase, label: 'Jobs', path: '/student/jobs' },
          { icon: UserCircle, label: 'Profile', path: '/student/profile' },
        ];
      case UserRole.COMPANY:
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/company/dashboard' },
          { icon: Briefcase, label: 'Post Job', path: '/company/post-job' },
          { icon: Users, label: 'Applicants', path: '/company/applicants' },
        ];
      case UserRole.ADMIN:
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: BarChart3, label: 'Stats', path: '/admin/stats' },
        ];
      default:
        return [];
    }
  };

  const getRoleGradient = () => {
    switch (user.role) {
      case UserRole.STUDENT: return 'from-violet-600 via-purple-600 to-indigo-600';
      case UserRole.COMPANY: return 'from-emerald-600 via-teal-600 to-cyan-600';
      case UserRole.ADMIN: return 'from-rose-600 via-pink-600 to-fuchsia-600';
      default: return 'from-blue-600 to-indigo-600';
    }
  };

  const getRoleAccent = () => {
    switch (user.role) {
      case UserRole.STUDENT: return 'bg-violet-500';
      case UserRole.COMPANY: return 'bg-emerald-500';
      case UserRole.ADMIN: return 'bg-rose-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar with gradient */}
      <aside className={`w-72 bg-gradient-to-b ${getRoleGradient()} text-white hidden md:flex flex-col shadow-2xl`}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur p-2 rounded-xl">
              <Sparkles className="text-yellow-300" size={24} />
            </div>
            UniPlace
          </h1>
          <p className="text-xs text-white/60 mt-2 uppercase tracking-widest font-medium">{user.role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {getNavItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-slate-800 shadow-lg shadow-black/20 font-semibold' 
                    : 'text-white/80 hover:bg-white/20 hover:text-white hover:translate-x-1'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-white/10 rounded-xl backdrop-blur">
            <div className={`w-10 h-10 rounded-xl ${getRoleAccent()} flex items-center justify-center text-sm font-bold shadow-lg`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-red-500/30 rounded-xl transition-all duration-300 hover:text-white group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`bg-gradient-to-r ${getRoleGradient()} shadow-lg z-10 p-4 md:hidden flex justify-between items-center`}>
             <h1 className="font-bold text-white flex items-center gap-2">
               <Sparkles size={20} className="text-yellow-300" /> UniPlace
             </h1>
             <button onClick={handleLogout} className="text-white/80 hover:text-white"><LogOut size={20}/></button>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-slate-100 via-slate-50 to-white">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};