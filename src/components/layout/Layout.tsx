import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Package, ShoppingBag, Scissors, FileText, ChevronRight, Menu, X, FlaskConical, LogOut, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [{
  title: "Tableau de bord",
  href: "/",
  icon: Home
}, {
  title: "Clients",
  href: "/clients",
  icon: Users
}, {
  title: "Produits",
  href: "/products",
  icon: Package
}, {
  title: "Commandes",
  href: "/orders",
  icon: ShoppingBag
}, {
  title: "Journées de découpe",
  href: "/cutting-days",
  icon: Scissors
}, {
  title: "Traçabilité",
  href: "/productions",
  icon: FlaskConical
}, {
  title: "Synthèse",
  href: "/summary",
  icon: FileText
}, {
  title: "Utilisateurs",
  href: "/users",
  icon: UserCog,
  adminOnly: true
}];

const Layout = ({
  children
}: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const {
    authState,
    logout
  } = useAuth();
  const currentPath = location.pathname;
  const currentRoute = navItems.find(item => item.href === currentPath || currentPath.startsWith(item.href + '/'));
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const filteredNavItems = navItems.filter(item => !item.adminOnly || authState.user?.role === 'admin');
  return <div className="flex min-h-screen flex-col">
      {/* Mobile navigation */}
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
              <Link to="/" className="flex items-center space-x-4" onClick={() => setOpen(false)}>
                <img src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" alt="AgriDécoupe" className="h-8 w-8" />
                <span className="font-bold text-lg text-[#1B4332]">AgriDécoupe</span>
              </Link>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
                <div className="pl-1 pr-7">
                  {filteredNavItems.map((item, index) => <Link key={index} to={item.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-x-2 py-2 px-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground", currentPath === item.href && "bg-accent text-accent-foreground")}>
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>)}
                </div>
              </ScrollArea>
              
              <div className="absolute bottom-4 left-4 right-4">
                <Button variant="outline" className="w-full flex items-center justify-center" onClick={() => {
                handleLogout();
                setOpen(false);
              }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
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
                      {authState.user?.username.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {authState.user?.username || 'Utilisateur'}
                    <p className="text-xs text-muted-foreground">
                      {authState.user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
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

      {/* Desktop navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-grow border-r bg-background pt-5">
          <div className="flex items-center justify-center px-4 pb-3">
            <div className="flex flex-col items-center space-y-2 cursor-pointer" onClick={() => navigate('/')}>
              <img src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" alt="AgriDécoupe" className="h-36 w-36" />
              
            </div>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-4">
              {filteredNavItems.map((item, index) => <div key={index} className={cn("flex items-center gap-x-2 py-2 px-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer", (currentPath === item.href || currentPath.startsWith(item.href + '/')) && "bg-accent text-accent-foreground")} onClick={() => navigate(item.href)}>
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </div>)}
            </nav>
          </div>
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-accent">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {authState.user?.username.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium">{authState.user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {authState.user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="mt-3 text-xs text-muted-foreground">
              Gestionnaire de Découpe v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </div>;
};

export default Layout;
