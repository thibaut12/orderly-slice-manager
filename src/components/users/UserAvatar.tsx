
import React from 'react';

interface UserAvatarProps {
  username: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username }) => {
  return (
    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
      {username.charAt(0).toUpperCase()}
    </div>
  );
};

export default UserAvatar;
