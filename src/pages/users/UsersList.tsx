
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, UserPlus, Key, Trash2, Edit, Eye, EyeOff, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserType {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// List of admin emails - in a production app, this would come from your database
const ADMIN_EMAILS = ['dassier.thibault@gmail.com'];

const UsersList = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserType>>({ username: '', role: 'user' });
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    // Charger les utilisateurs depuis Supabase
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

    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUser.username) {
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
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
        user_metadata: {
          farm_name: newUser.username
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Échec de la création de l'utilisateur");
      }

      // Pour la gestion admin, nous utilisons simplement la liste des emails admin
      // Dans une vraie application, vous utiliseriez une table user_roles ou similaire

      const userRole: 'admin' | 'user' = ADMIN_EMAILS.includes(newUserEmail) ? 'admin' : 'user';

      // Ajouter le nouvel utilisateur à la liste
      setUsers(prev => [...prev, {
        id: authData.user.id,
        email: newUserEmail,
        username: newUser.username || '',
        role: userRole,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      // Réinitialiser le formulaire
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUser({ username: '', role: 'user' });
      setIsAddDialogOpen(false);
      
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

  // Vérifier si l'utilisateur est administrateur
  if (currentUser?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh] flex-col">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Identifiants</h1>
            <p className="text-muted-foreground mt-1">
              Gérer les utilisateurs et leurs permissions d'accès à l'application
            </p>
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Input
              placeholder="Rechercher un utilisateur..."
              className="w-full md:w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nom de la ferme</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'user'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="user">Utilisateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsAddDialogOpen(false)} variant="outline">
                    Annuler
                  </Button>
                  <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Table d'utilisateurs */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.createdAt.toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => startEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dialog for editing users */}
        {editingUser && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l'utilisateur</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Nom d'utilisateur</Label>
                  <Input
                    id="edit-username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(value) => setEditingUser({...editingUser, role: value as 'admin' | 'user'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                  Annuler
                </Button>
                <Button onClick={handleEditUser}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default UsersList;
