
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { NavItem } from './types';

interface DesktopSidebarProps {
  filteredNavItems: NavItem[];
  currentPath: string;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ filteredNavItems, currentPath }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
      <div className="flex flex-col flex-grow border-r bg-background pt-5">
        <div className="flex items-center justify-center px-4 pb-3">
          <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" alt="AgriDécoupe" className="h-36 w-36" />
          </div>
        </div>
        <div className="mt-8 flex flex-1 flex-col">
          <nav className="flex-1 space-y-1 px-4">
            {filteredNavItems.map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-x-2 py-2 px-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer", 
                  (currentPath === item.href || currentPath.startsWith(item.href + '/')) && "bg-accent text-accent-foreground"
                )} 
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </div>
            ))}
          </nav>
        </div>
        <UserProfileSection user={user} onLogout={handleLogout} />
      </div>
    </div>
  );
};

interface UserProfileSectionProps {
  user: any;
  onLogout: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ user, onLogout }) => {
  return (
    <div className="p-4 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-accent">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="mt-3 text-xs text-muted-foreground">
        Gestionnaire de Découpe v1.0
      </div>
    </div>
  );
};

export default DesktopSidebar;
