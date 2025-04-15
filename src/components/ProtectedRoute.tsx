
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authState } = useAuth();
  
  // On affiche rien pendant le chargement
  if (authState.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si non authentifié, rediriger vers la page de connexion
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si authentifié, afficher les enfants (les composants protégés)
  return <>{children}</>;
};

export default ProtectedRoute;
