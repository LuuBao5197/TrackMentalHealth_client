import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  // if (allowedRoles && !allowedRoles.includes(user?.roleId?.id)) {
  //   return <Navigate to="/auth/unauthorized" replace />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;
