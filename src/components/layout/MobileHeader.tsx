
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/context/AuthContext';
import { NavItem } from './types';
import { MobileSidebarContent } from './MobileSidebarContent';

interface MobileHeaderProps {
  currentPath: string;
  currentRoute: NavItem | undefined;
  filteredNavItems: NavItem[];
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ currentPath, currentRoute, filteredNavItems }) => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background md:hidden">
      <div className="container flex h-14 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <MobileSidebarContent 
              filteredNavItems={filteredNavItems} 
              currentPath={currentPath} 
              onClose={() => setOpen(false)} 
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center justify-between flex-1">
          <Link to="/" className="flex items-center space-x-3 ml-2">
            <img src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" alt="AgriDécoupe" className="h-7 w-7" />
            <span className="font-bold text-[#1B4332]">AgriDécoupe</span>
          </Link>
          <nav className="flex items-center space-x-2">
            {currentRoute && <div className="flex items-center px-2 py-1.5 text-sm font-medium">
                <currentRoute.icon className="mr-2 h-4 w-4" />
                {currentRoute.title}
              </div>}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.username || 'Utilisateur'}
                  <p className="text-xs text-muted-foreground">
                    {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
