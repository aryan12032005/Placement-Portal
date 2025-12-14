import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they try to access unauthorized pages
    switch(user.role) {
        case UserRole.STUDENT: return <Navigate to="/student/dashboard" replace />;
        case UserRole.COMPANY: return <Navigate to="/company/dashboard" replace />;
        case UserRole.ADMIN: return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};