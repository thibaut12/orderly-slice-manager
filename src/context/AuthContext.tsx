
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Définir l'interface pour notre contexte d'authentification
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Liste d'utilisateurs prédéfinie (dans une vraie app, ce serait dans une base de données)
const predefinedUsers: User[] = [
  {
    id: uuidv4(),
    username: 'admin',
    password: 'admin123', // Dans une vraie app, ce serait un hash
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    username: 'user',
    password: 'user123', // Dans une vraie app, ce serait un hash
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // Vérifier s'il y a un utilisateur déjà connecté (localStorage)
  useEffect(() => {
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
            error: null
          });
        } catch (error) {
          localStorage.removeItem('currentUser');
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };
    
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mettre l'état en chargement
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Pour simuler un délai réseau (optionnel)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier les identifiants
      const user = predefinedUsers.find(
        u => u.username === username && u.password === password
      );
      
      if (user) {
        // Clone l'utilisateur sans le mot de passe pour le stockage
        const { password: _, ...safeUser } = user;
        
        // Stocker l'utilisateur dans localStorage
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        // Mettre à jour l'état
        setAuthState({
          isAuthenticated: true,
          user: safeUser as User,
          loading: false,
          error: null
        });
        
        // Afficher un toast de succès
        toast.success("Connexion réussie", {
          description: `Bienvenue ${username} !`,
        });
        
        console.log("Connexion réussie pour:", username);
        return true;
      } else {
        // Identifiants incorrects
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: "Nom d'utilisateur ou mot de passe incorrect"
        });
        
        // Afficher un toast d'erreur
        toast.error("Échec de la connexion", {
          description: "Identifiants incorrects. Veuillez réessayer.",
        });
        
        console.log("Échec de connexion pour:", username);
        return false;
      }
    } catch (error) {
      // En cas d'erreur
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Une erreur s'est produite lors de la connexion"
      });
      
      // Afficher un toast d'erreur
      toast.error("Erreur de connexion", {
        description: "Une erreur s'est produite. Veuillez réessayer.",
      });
      
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  const logout = () => {
    // Supprimer l'utilisateur du localStorage
    localStorage.removeItem('currentUser');
    
    // Mettre à jour l'état
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    
    // Afficher un toast de confirmation
    toast.success("Déconnexion", {
      description: "Vous avez été déconnecté avec succès.",
    });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
