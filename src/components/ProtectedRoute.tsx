
import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './users/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute: ", { 
      isAuthenticated, 
      loading, 
      adminOnly, 
      userRole: user?.role,
      path: location.pathname 
    });
    
    // For debugging: log all session info
    if (!isAuthenticated && !loading) {
      console.log("Non authentifié sur route protégée:", location.pathname);
    }
  }, [isAuthenticated, loading, adminOnly, user, location]);
  
  // Showing loading spinner while checking authentication
  if (loading) {
    console.log("Affichage du spinner de chargement...");
    return <LoadingSpinner />;
  }
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  
  // If admin-only page and user is not admin, redirect to home
  if (adminOnly && user?.role !== 'admin') {
    console.log("Utilisateur non admin, redirection vers /");
    return <Navigate to="/" replace />;
  }
  
  // If authenticated and with required permissions, show protected content
  console.log("Accès autorisé à la route:", location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
