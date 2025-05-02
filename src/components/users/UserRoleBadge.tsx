
import React from 'react';

interface UserRoleBadgeProps {
  role: 'admin' | 'user';
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  return (
    <div className="flex items-center">
      <div className={`h-2 w-2 rounded-full mr-2 ${role === 'admin' ? 'bg-green-500' : 'bg-blue-500'}`} />
      {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
    </div>
  );
};

export default UserRoleBadge;
