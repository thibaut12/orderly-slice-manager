
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import UserAvatar from './UserAvatar';
import UserRoleBadge from './UserRoleBadge';
import { UserType } from '@/types/user';

interface UserTableRowProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (userId: string) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onEdit, onDelete }) => {
  return (
    <TableRow key={user.id}>
      <TableCell>
        <UserAvatar username={user.username} />
      </TableCell>
      <TableCell className="font-medium">
        {user.username}
      </TableCell>
      <TableCell>
        {user.email}
      </TableCell>
      <TableCell>
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        {user.createdAt.toLocaleDateString('fr-FR')}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default UserTableRow;
