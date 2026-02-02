import React, { useState } from 'react';
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
  X,
  Plus,
  FileText,
  Rocket,
  Trophy,
  BookOpen,
  Bell,
  ChevronRight
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { SupportChat } from './SupportChat';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <>{children}</>;

  // Check if we're on a student route for mobile bottom nav
  const isStudentRoute = location.pathname.startsWith('/student');

  const getNavItems = () => {
    switch (user.role) {
      case UserRole.STUDENT:
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
          { icon: Rocket, label: 'Internships', path: '/student/internships' },
          { icon: Trophy, label: 'Hackathons', path: '/student/hackathons' },
          { icon: BookOpen, label: 'Courses', path: '/student/courses' },
          { icon: UserCircle, label: 'Profile', path: '/student/profile' },
        ];
      case UserRole.ADMIN:
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Plus, label: 'Post Internship', path: '/admin/post-internship' },
          { icon: Trophy, label: 'Post Hackathon', path: '/admin/post-hackathon' },
          { icon: FileText, label: 'Applicants', path: '/admin/applicants' },
          { icon: Users, label: 'Users', path: '/admin/users' },
          { icon: BarChart3, label: 'Stats', path: '/admin/stats' },
          { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
          { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
        ];
      default:
        return [];
    }
  };

  // Mobile bottom navigation items for students
  const mobileNavItems = [
    { icon: Home, label: 'Home', path: '/student/dashboard' },
    { icon: Rocket, label: 'Internships', path: '/student/internships' },
    { icon: BookOpen, label: 'Courses', path: '/student/courses' },
    { icon: Trophy, label: 'Hackathons', path: '/student/hackathons' },
  ];

  const getRoleLabel = () => {
    switch (user.role) {
      case UserRole.STUDENT: return 'Student';
      case UserRole.ADMIN: return 'Admin';
      default: return 'User';
    }
  };

  // Mobile Layout for Students - Light Theme
  if (isStudentRoute && user.role === UserRole.STUDENT) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Mobile Header - Clean White */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/student/dashboard" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900">InternHub</span>
                <p className="text-[10px] text-slate-500 -mt-0.5">Find Your Dream Internship</p>
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification */}
              <NotificationDropdown />
              
              {/* Profile Picture */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="relative"
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-violet-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="p-4 bg-gradient-to-r from-violet-500 to-purple-600">
                        <div className="flex items-center gap-3">
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-14 h-14 rounded-xl object-cover border-2 border-white/20" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="text-white">
                            <p className="font-semibold text-base">{user.name}</p>
                            <p className="text-xs text-white/80 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          to="/student/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
                            <UserCircle size={18} className="text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <span className="font-medium text-slate-800 text-sm">My Profile</span>
                            <p className="text-xs text-slate-500">View and edit profile</p>
                          </div>
                          <ChevronRight size={16} className="text-slate-400" />
                        </Link>

                        <button
                          onClick={toggleTheme}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                            {isDark ? <Sun size={18} className="text-amber-600" /> : <Moon size={18} className="text-slate-600" />}
                          </div>
                          <div className="flex-1 text-left">
                            <span className="font-medium text-slate-800 text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                            <p className="text-xs text-slate-500">Change appearance</p>
                          </div>
                        </button>

                        <div className="my-2 mx-4 border-t border-slate-100"></div>

                        <button
                          onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                            <LogOut size={18} className="text-red-600" />
                          </div>
                          <span className="font-medium text-red-600 text-sm">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Light Background */}
        <main className="flex-1 overflow-auto pb-24 bg-slate-50">
          <div className="page-transition">
            {children}
          </div>
        </main>

        {/* Support Chat FAB */}
        <div className="fixed bottom-28 right-4 z-30 md:hidden">
          <SupportChat />
        </div>

        {/* Mobile Bottom Navigation - Modern App Style */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-area-bottom z-50">
          <div className="flex items-center justify-around px-2 py-2">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all"
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-violet-100' 
                      : 'bg-transparent'
                  }`}>
                    <item.icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 1.8} 
                      className={isActive ? 'text-violet-600' : 'text-slate-400'}
                    />
                  </div>
                  <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-violet-600' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop Layout (for all users) and Admin mobile
  return (
    <div className={`flex h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Sidebar - Desktop only */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-r hidden md:flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'} flex items-center justify-center`}>
          <Link to="/" className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="text-white" size={22} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>InternHub</span>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getRoleLabel()} Portal</p>
              </div>
            )}
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
          <Link
            to="/"
            title="Home"
            className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-lg transition-all ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home size={18} />
            {!sidebarCollapsed && <span className="font-medium text-sm">Home</span>}
          </Link>
          
          <div className={`my-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}></div>
          
          {getNavItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium' 
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <item.icon size={18} />
                {!sidebarCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-lg transition-all mb-2 ${
              isDark 
                ? 'text-slate-400 hover:text-white hover:bg-slate-700/50' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!sidebarCollapsed && <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {/* User Info */}
          {!sidebarCollapsed ? (
            <div className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-lg object-cover" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-2">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-lg object-cover" title={user.name} />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold" title={user.name}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center gap-3 ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-lg transition-all ${
              isDark 
                ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' 
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center`}>
          {/* Hamburger Menu Button */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2.5 rounded-xl transition-all ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>

            {/* Desktop Sidebar Toggle Button */}
            <button 
              className={`hidden md:flex p-2.5 rounded-xl transition-all ${
                isDark 
                  ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={20} />
            </button>

            {/* Page Title - Desktop */}
            <div className="hidden md:block">
              <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {getNavItems().find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Logo for mobile */}
          <Link to="/" className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>InternHub</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {user.role === UserRole.STUDENT && (
              <>
                <NotificationDropdown />
                <SupportChat />
              </>
            )}
            
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

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`md:hidden fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
          {/* Mobile Menu Header */}
          <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'} flex items-center justify-between`}>
            <Link to="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>InternHub</span>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{getRoleLabel()} Portal</p>
              </div>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="p-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home size={20} />
              <span className="font-medium">Home</span>
            </Link>
            
            <div className={`my-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}></div>
            
            {getNavItems().map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium' 
                      : isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Footer */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            {/* User Info */}
            <div className={`flex items-center gap-3 px-3 py-3 mb-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{user.name}</p>
                <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
              </div>
            </div>

            {/* Theme & Logout */}
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isDark 
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-medium">{isDark ? 'Light' : 'Dark'}</span>
              </button>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto p-4 md:p-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
