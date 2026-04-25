import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  // For now, using a simple localStorage check since the backend isn't ready
  const isAdminAuth = localStorage.getItem('isAdminAuth') === 'true';

  if (!isAdminAuth) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;