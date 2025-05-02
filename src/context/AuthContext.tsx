
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email?: string;
  user_metadata?: any;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserWithRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, metadata?: any) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
        return null;
      }
      
      return data?.role || 'user'; // Par défaut 'user' si aucun rôle n'est trouvé
    } catch (error) {
      console.error('Erreur:', error);
      return 'user';
    }
  };

  const updateUserWithRole = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const role = await fetchUserRole(authUser.id);
    setUser({
      ...authUser,
      role
    });
  };

  useEffect(() => {
    // Vérifie la session au chargement
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await updateUserWithRole(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();

    // Souscrit aux changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await updateUserWithRole(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await updateUserWithRole(data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      return false;
    }
  };

  const register = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error.message);
      toast.error(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error.message);
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
