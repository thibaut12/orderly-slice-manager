
import React, { useState } from 'react';
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
import { User, UserPlus, Key, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { User as UserType } from '@/types';

const UsersList = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([
    { 
      id: '1', 
      username: 'admin', 
      password: '••••••••', 
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    { 
      id: '2', 
      username: 'utilisateur', 
      password: '••••••••', 
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserType>>({ username: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur et le mot de passe sont requis",
        variant: "destructive"
      });
      return;
    }

    const userToAdd: UserType = {
      id: `${Date.now()}`,
      username: newUser.username,
      password: newUser.password,
      role: newUser.role as 'admin' | 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setUsers(prev => [...prev, userToAdd]);
    setNewUser({ username: '', password: '', role: 'user' });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${userToAdd.username} a été créé avec succès`,
    });
  };

  const handleEditUser = () => {
    if (!editingUser || !editingUser.username || !editingUser.password) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur et le mot de passe sont requis",
        variant: "destructive"
      });
      return;
    }

    setUsers(prev => 
      prev.map(user => user.id === editingUser.id ? { ...editingUser, updatedAt: new Date() } : user)
    );
    
    setIsEditDialogOpen(false);
    setEditingUser(null);
    
    toast({
      title: "Utilisateur modifié",
      description: `L'utilisateur ${editingUser.username} a été modifié avec succès`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) {
      toast({
        title: "Action impossible",
        description: "Vous devez conserver au moins un utilisateur",
        variant: "destructive"
      });
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    
    setUsers(prev => prev.filter(user => user.id !== userId));
    
    toast({
      title: "Utilisateur supprimé",
      description: `L'utilisateur ${userToDelete?.username} a été supprimé`,
    });
  };

  const startEdit = (user: UserType) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
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
                <TableHead>Rôle</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${user.role === 'admin' ? 'bg-green-500' : 'bg-blue-500'}`} />
                        {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
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
                  <Label htmlFor="edit-password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showPassword ? "text" : "password"}
                      value={editingUser.password}
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
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
