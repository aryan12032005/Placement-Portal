import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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