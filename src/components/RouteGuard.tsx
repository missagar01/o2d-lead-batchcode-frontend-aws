import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { isPathAllowed, getDefaultAllowedPath } from "../utils/accessControl";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredSystem?: string;
  requiredPage?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Check if user has access to this route
  const currentPath = location.pathname + location.search;
  const hasAccess = isPathAllowed(currentPath, user);

  // If no access, redirect to login or a safe place instead of showing error
  if (!hasAccess) {
    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If already logged in but no access to THIS specific path
    // Redirect them to their designated default allowed path
    const safePath = getDefaultAllowedPath(user);

    // Safety check: if safePath is the same as current path, we are in a loop
    if (safePath === currentPath || safePath === location.pathname) {
      // If we are already on the supposedly safe path and still no access,
      // fallback to login but this shouldn't happen with correct logic
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={safePath} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;

