
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import UsersTable from '@/components/users/UsersTable';
import AddUserDialog from '@/components/users/AddUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import AccessDenied from '@/components/users/AccessDenied';
import LoadingSpinner from '@/components/users/LoadingSpinner';

const UsersList = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
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
  } = useUserManagement();

  // Vérifier si l'utilisateur est administrateur
  if (currentUser?.role !== "admin") {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
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
            <AddUserDialog onAddUser={handleAddUser} />
          </div>
        </div>

        <UsersTable 
          users={users} 
          onEditUser={startEdit} 
          onDeleteUser={handleDeleteUser} 
        />

        {editingUser && (
          <EditUserDialog 
            user={editingUser}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSave={handleEditUser}
            onUserChange={setEditingUser}
          />
        )}
      </div>
    </Layout>
  );
};

export default UsersList;
