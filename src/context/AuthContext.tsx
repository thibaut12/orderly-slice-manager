
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types';
import { useToast } from '@/components/ui/use-toast';
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
  const { toast } = useToast();

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
      // Simuler une latence réseau
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Dans une vraie app, ce serait un appel API à un backend sécurisé
      const user = predefinedUsers.find(
        u => u.username === username && u.password === password
      );
      
      if (user) {
        const { password, ...safeUser } = user; // Ne pas stocker le mot de passe
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
        
        setAuthState({
          isAuthenticated: true,
          user: safeUser as User,
          loading: false,
          error: null
        });
        
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${username} !`,
        });
        
        return true;
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: "Nom d'utilisateur ou mot de passe incorrect"
        });
        
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: "Identifiants incorrects. Veuillez réessayer.",
        });
        
        return false;
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: "Une erreur s'est produite lors de la connexion"
      });
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur s'est produite. Veuillez réessayer.",
      });
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    
    toast({
      title: "Déconnexion",
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
