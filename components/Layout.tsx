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
  Bell
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="text-blue-400" />
            UniPlace
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{user.role} Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {getNavItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 p-4 md:hidden flex justify-between items-center">
             <h1 className="font-bold text-slate-800">UniPlace</h1>
             <button onClick={handleLogout} className="text-slate-600"><LogOut size={20}/></button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};