
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email?: string;
  user_metadata?: any;
  role?: 'admin' | 'user';
  username?: string;
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
        return 'user';
      }

      if (userData?.user?.email === 'dassier.thibault@gmail.com') {
        return 'admin';
      }
      
      return 'user';
    } catch (error) {
      console.error('Erreur:', error);
      return 'user';
    }
  };

  const updateUserWithRole = async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      return null;
    }

    try {
      const role = await fetchUserRole(authUser.id);
      
      const username = authUser.user_metadata?.farm_name || 
                      authUser.email?.split('@')[0] || 
                      'Utilisateur';
      
      const updatedUser = {
        ...authUser,
        role,
        username
      };
      
      setUser(updatedUser);
      console.log("Utilisateur mis à jour:", { id: authUser.id, role, username });
      
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Vérification de la session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de la session:", error);
          setUser(null);
        } else if (data.session?.user) {
          console.log("Session trouvée pour l'utilisateur:", data.session.user.id);
          await updateUserWithRole(data.session.user);
        } else {
          console.log("Aucune session active trouvée");
          setUser(null);
        }
      } catch (err) {
        console.error("Erreur inattendue lors de la vérification de la session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth listener first, then check session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Changement d'état d'authentification:", event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Utilisateur connecté:", session.user.id);
        await updateUserWithRole(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("Utilisateur déconnecté");
        setUser(null);
        setLoading(false);
      }
    });

    // Now check session
    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Tentative de connexion avec:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur de connexion:", error.message);
        throw error;
      }

      if (data.user) {
        console.log("Connexion réussie pour:", data.user.id);
        const updatedUser = await updateUserWithRole(data.user);
        return !!updatedUser;
      }
      return false;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.message);
      throw error;
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
      console.log("Déconnexion réussie");
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
