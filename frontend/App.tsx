import React, { useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentJobs } from './pages/student/Jobs';
import { StudentProfile } from './pages/student/Profile';
import { Hackathons } from './pages/student/Hackathons';
import { Courses } from './pages/student/Courses';
import { PostJob } from './pages/company/PostJob';
import { Applicants } from './pages/company/Applicants';
import { EditJob } from './pages/company/EditJob';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UsersManagement } from './pages/admin/Users';
import { Stats } from './pages/admin/Stats';
import { PostHackathon } from './pages/admin/PostHackathon';
import { ManageCourses } from './pages/admin/ManageCourses';
import { ManageNotifications } from './pages/admin/ManageNotifications';
import { UserRole } from './types';

// PWA Context to detect standalone mode app-wide
const PWAContext = createContext<boolean>(false);
export const usePWA = () => useContext(PWAContext);

// Check if running as PWA - only true when actually installed as standalone app
const isPWAMode = (): boolean => {
  // Check for standalone display mode (installed PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  // Check for iOS standalone mode
  const isIOSStandalone = (window.navigator as any).standalone === true;
  // Check for Android TWA
  const isTWA = document.referrer.includes('android-app://');
  // Check URL parameter (fallback for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const isPWAParam = urlParams.get('pwa') === 'true';
  
  // Only return true if actually running as installed app, not regular browser
  return isStandalone || isIOSStandalone || isTWA || isPWAParam;
};

// Store PWA mode globally so it's consistent
const IS_PWA = isPWAMode();

// Component to handle app entry - PWA goes to login, website shows Home
const AppEntry: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;
    
    // ONLY redirect if running as installed PWA app
    // Regular browser should NEVER redirect - just show Home page
    if (IS_PWA) {
      if (user) {
        // User is logged in - go to dashboard
        if (user.role === UserRole.ADMIN) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      } else {
        // Not logged in - go to login
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading splash for PWA
  if (isPWA && isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
            </svg>
          </div>
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // For regular website - show Home/Landing page
  return <Home />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#10B981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
        }}
      />
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<AppEntry />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="internships" element={<StudentJobs />} />
                  <Route path="hackathons" element={<Hackathons />} />
                  <Route path="courses" element={<Courses />} />
                  <Route path="jobs" element={<Navigate to="/student/internships" replace />} />
                  <Route path="profile" element={<StudentProfile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes - Combined Admin & Company Portal */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="post-internship" element={<PostJob />} />
                  <Route path="post-hackathon" element={<PostHackathon />} />
                  <Route path="applicants" element={<Applicants />} />
                  <Route path="edit-internship/:id" element={<EditJob />} />
                  <Route path="users" element={<UsersManagement />} />
                  <Route path="stats" element={<Stats />} />
                  <Route path="courses" element={<ManageCourses />} />
                  <Route path="notifications" element={<ManageNotifications />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Redirect old company routes to admin */}
          <Route path="/company/*" element={<Navigate to="/admin/dashboard" replace />} />

        </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;