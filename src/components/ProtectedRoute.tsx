
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
  }, [isAuthenticated, loading, adminOnly, user, location]);
  
  // Affiche un chargement pendant la vérification de l'authentification
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log("Utilisateur non authentifié, redirection vers /login");
    return <Navigate to="/login" replace />;
  }
  
  // Si page admin et utilisateur non admin, rediriger vers la page d'accueil
  if (adminOnly && user?.role !== 'admin') {
    console.log("Utilisateur non admin, redirection vers /");
    return <Navigate to="/" replace />;
  }
  
  // Si authentifié et avec les droits requis, afficher les enfants (les composants protégés)
  console.log("Accès autorisé à la route:", location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;
