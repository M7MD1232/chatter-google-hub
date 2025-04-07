
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
