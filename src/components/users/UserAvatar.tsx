
import React from 'react';

interface UserAvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base'
  };
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium`}>
      {username && username.charAt(0).toUpperCase()}
    </div>
  );
};

export default UserAvatar;
