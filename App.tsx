import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentJobs } from './pages/student/Jobs';
import { StudentProfile } from './pages/student/Profile';
import { CompanyDashboard } from './pages/company/Dashboard';
import { PostJob } from './pages/company/PostJob';
import { Applicants } from './pages/company/Applicants';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="jobs" element={<StudentJobs />} />
                  <Route path="profile" element={<StudentProfile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Company Routes */}
          <Route path="/company/*" element={
            <ProtectedRoute allowedRoles={[UserRole.COMPANY]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<CompanyDashboard />} />
                  <Route path="post-job" element={<PostJob />} />
                  <Route path="applicants" element={<Applicants />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<div className="p-4">User Management Module (Placeholder)</div>} />
                  <Route path="stats" element={<div className="p-4">Advanced Stats Module (Placeholder)</div>} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />

        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;