
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, metadata?: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie la session au chargement
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la récupération de la session:", error.message);
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("Exception lors de la vérification de la session:", err);
        setLoading(false);
      }
    };

    checkSession();

    // Souscrit aux changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("État d'authentification changé:", event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erreur de connexion:', error.message);
        toast.error("Échec de connexion", {
          description: error.message
        });
        setLoading(false);
        return false;
      }

      if (data.user) {
        console.log("Connexion réussie pour:", data.user.email);
        toast.success("Connexion réussie");
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('Exception lors de la connexion:', error.message);
      toast.error("Erreur inattendue", {
        description: "Une erreur est survenue lors de la connexion"
      });
      setLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        console.error('Erreur d\'inscription:', error.message);
        toast.error("Échec de l'inscription", {
          description: error.message
        });
        setLoading(false);
        return false;
      }

      if (data.user) {
        console.log("Inscription réussie pour:", data.user.email);
        toast.success("Inscription réussie", {
          description: "Votre compte a été créé avec succès"
        });
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error: any) {
      console.error('Exception lors de l\'inscription:', error.message);
      toast.error("Erreur inattendue", {
        description: "Une erreur est survenue lors de l'inscription"
      });
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur de déconnexion:', error.message);
        toast.error("Échec de la déconnexion", {
          description: error.message
        });
      } else {
        console.log("Déconnexion réussie");
        toast.success("Déconnexion réussie");
      }
    } catch (error: any) {
      console.error('Exception lors de la déconnexion:', error.message);
      toast.error("Erreur inattendue", {
        description: "Une erreur est survenue lors de la déconnexion"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
