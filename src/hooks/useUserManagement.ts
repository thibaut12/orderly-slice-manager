
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserType } from '@/types/user';

// List of admin emails - in a production app, this would come from your database
const ADMIN_EMAILS = ['dassier.thibault@gmail.com'];

export const useUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      // Récupérer les utilisateurs de auth.users (admin only)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Combiner les informations
      const formattedUsers = authUsers.users.map(authUser => {
        // Check if this user is an admin based on email
        const isAdmin = ADMIN_EMAILS.includes(authUser.email || '');
        
        return {
          id: authUser.id,
          email: authUser.email || '',
          username: authUser.user_metadata?.farm_name || authUser.email?.split('@')[0] || 'Utilisateur',
          role: isAdmin ? 'admin' as const : 'user' as const, // Type assertion to ensure correct typing
          createdAt: new Date(authUser.created_at),
          updatedAt: new Date(authUser.updated_at)
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (email: string, password: string, userData: Partial<UserType>) => {
    if (!email || !password || !userData.username) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur, l'email et le mot de passe sont requis",
        variant: "destructive"
      });
      return;
    }

    try {
      // Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          farm_name: userData.username
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Échec de la création de l'utilisateur");
      }

      // Pour la gestion admin, nous utilisons simplement la liste des emails admin
      const userRole: 'admin' | 'user' = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

      // Ajouter le nouvel utilisateur à la liste
      setUsers(prev => [...prev, {
        id: authData.user.id,
        email: email,
        username: userData.username || '',
        role: userRole,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      
      toast({
        title: "Utilisateur créé",
        description: `L'utilisateur a été créé avec succès`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser || !editingUser.username) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mettre à jour les métadonnées de l'utilisateur
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        { 
          user_metadata: { farm_name: editingUser.username }
        }
      );

      if (updateError) throw updateError;

      // Mettre à jour la liste des utilisateurs
      setUsers(prev => 
        prev.map(user => user.id === editingUser.id ? { ...editingUser, updatedAt: new Date() } : user)
      );
      
      setIsEditDialogOpen(false);
      setEditingUser(null);
      
      toast({
        title: "Utilisateur modifié",
        description: `L'utilisateur ${editingUser.username} a été modifié avec succès`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (users.length <= 1) {
      toast({
        title: "Action impossible",
        description: "Vous devez conserver au moins un utilisateur",
        variant: "destructive"
      });
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    
    try {
      // Supprimer l'utilisateur de auth
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // Mettre à jour la liste des utilisateurs
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${userToDelete.username} a été supprimé`,
      });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const startEdit = (user: UserType) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    editingUser,
    setEditingUser,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    startEdit
  };
};
