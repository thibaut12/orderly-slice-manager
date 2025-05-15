
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Log pour le débogage
  useEffect(() => {
    console.log("ProtectedRoute - État d'authentification:", { loading, isAuthenticated });
  }, [loading, isAuthenticated]);
  
  // Affiche un chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Si non authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    console.log("Non authentifié, redirection vers /login");
    return <Navigate to="/login" replace />;
  }
  
  // Si authentifié, afficher les enfants (les composants protégés)
  console.log("Authentifié, affichage du contenu protégé");
  return <>{children}</>;
};

export default ProtectedRoute;
