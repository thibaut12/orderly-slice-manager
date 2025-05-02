
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavItem } from './types';

interface MobileSidebarContentProps {
  filteredNavItems: NavItem[];
  currentPath: string;
  onClose: () => void;
  onLogout: () => void;
}

export const MobileSidebarContent: React.FC<MobileSidebarContentProps> = ({
  filteredNavItems,
  currentPath,
  onClose,
  onLogout
}) => {
  return (
    <>
      <Link to="/" className="flex items-center space-x-4" onClick={onClose}>
        <img src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" alt="AgriDécoupe" className="h-8 w-8" />
        <span className="font-bold text-lg text-[#1B4332]">AgriDécoupe</span>
      </Link>
      <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
        <div className="pl-1 pr-7">
          {filteredNavItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.href} 
              onClick={onClose} 
              className={cn(
                "flex items-center gap-x-2 py-2 px-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground", 
                currentPath === item.href && "bg-accent text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
      
      <div className="absolute bottom-4 left-4 right-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center" 
          onClick={() => {
            onLogout();
            onClose();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </div>
    </>
  );
};
