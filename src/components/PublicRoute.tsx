import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  const getDefaultRoute = (roleValue?: string) => {
    return "/dashboard";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={getDefaultRoute(user?.role || user?.userType)} replace />;
  }

  // If not authenticated, show the public route (login page)
  return <>{children}</>;
};

export default PublicRoute;



