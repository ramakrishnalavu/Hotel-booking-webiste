import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '80vh' }} className="flex-center">
        <Loader />
      </div>
    );
  }

  // 1. Unauthenticated users -> Redirect to Login (Unauthorized)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role-based Authorization check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Insufficient permissions -> Redirect to Forbidden page
    return <Navigate to="/403" replace />;
  }

  // 3. Authorized -> Render children
  return children;
};

export default ProtectedRoute;
