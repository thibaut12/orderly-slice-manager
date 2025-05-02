
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import UserTableRow from './UserTableRow';
import { UserType } from '@/types/user';

interface UsersTableProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onEditUser, onDeleteUser }) => {
  return (
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
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserTableRow 
                key={user.id} 
                user={user} 
                onEdit={onEditUser} 
                onDelete={onDeleteUser} 
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
