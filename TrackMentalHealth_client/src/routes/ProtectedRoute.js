import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/auth/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
