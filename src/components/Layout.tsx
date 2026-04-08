import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Layout = () => {
  const isAuthenticated = !!localStorage.getItem("authToken");

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default Layout;
