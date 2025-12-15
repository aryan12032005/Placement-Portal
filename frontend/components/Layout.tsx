import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCircle, 
  LogOut, 
  Users, 
  BarChart3,
  Home,
  GraduationCap,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  const getRoleLabel = () => {
    switch (user.role) {
      case UserRole.STUDENT: return 'Student';
      case UserRole.COMPANY: return 'Company';
      case UserRole.ADMIN: return 'Admin';
      default: return 'User';
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Sidebar - Clean Professional Design */}
      <aside className={`w-64 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r hidden md:flex flex-col`}>
        {/* Logo */}
        <div className={`p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={22} />
            </div>
            <div>
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>UniPlace</span>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getRoleLabel()} Portal</p>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home size={18} />
            <span className="font-medium text-sm">Home</span>
          </Link>
          
          <div className={`my-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}></div>
          
          {getNavItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white font-medium' 
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all mb-2 ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User Info */}
          <div className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
              <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
              isDark 
                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile & Desktop */}
        <header className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b px-6 py-4 flex justify-between items-center`}>
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={20} className={isDark ? 'text-white' : 'text-slate-800'} />
            ) : (
              <Menu size={20} className={isDark ? 'text-white' : 'text-slate-800'} />
            )}
          </button>

          {/* Logo for mobile */}
          <Link to="/" className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>UniPlace</span>
          </Link>

          {/* Page Title - Desktop */}
          <div className="hidden md:block">
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {getNavItems().find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b p-4`}>
            <nav className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                  isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home size={18} />
                <span className="font-medium text-sm">Home</span>
              </Link>
              {getNavItems().map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                      isActive 
                        ? 'bg-indigo-600 text-white' 
                        : isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto p-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
