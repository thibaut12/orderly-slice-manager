
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  ShoppingBag, 
  Scissors, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: Home,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Produits",
    href: "/products",
    icon: Package,
  },
  {
    title: "Commandes",
    href: "/orders",
    icon: ShoppingBag,
  },
  {
    title: "Journées de découpe",
    href: "/cutting-days",
    icon: Scissors,
  },
  {
    title: "Traçabilité",
    href: "/productions",
    icon: FlaskConical,
  },
  {
    title: "Synthèse",
    href: "/summary",
    icon: FileText,
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Automatically close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when navigating on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentPath = location.pathname;
  const currentRoute = navItems.find(
    (item) => item.href === currentPath || currentPath.startsWith(item.href + '/')
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile navigation */}
      <header className="sticky top-0 z-30 border-b bg-background md:hidden">
        <div className="container flex h-14 items-center">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 sm:max-w-xs">
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                onClick={() => setSidebarOpen(false)}
              >
                <Scissors className="h-5 w-5" />
                <span className="font-bold">Gestionnaire de Découpe</span>
              </Link>
              <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
                <div className="pl-1 pr-7">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
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
            </SheetContent>
          </Sheet>
          <div className="flex items-center justify-between flex-1">
            <Link to="/" className="flex items-center space-x-2 ml-2">
              <Scissors className="h-5 w-5" />
              <span className="font-bold">Gestionnaire de Découpe</span>
            </Link>
            <nav className="flex items-center space-x-2">
              {currentRoute && (
                <div className="flex items-center px-2 py-1.5 text-sm font-medium">
                  <currentRoute.icon className="mr-2 h-4 w-4" />
                  {currentRoute.title}
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Desktop navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-grow border-r bg-background pt-5">
          <div className="flex items-center justify-center px-4">
            <Link to="/" className="flex items-center space-x-2">
              <Scissors className="h-6 w-6" />
              <span className="text-lg font-bold">Gestionnaire de Découpe</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-4">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-x-2 py-2 px-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground",
                    currentPath === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-4">
            <div className="text-xs text-muted-foreground">
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
    </div>
  );
};

export default Layout;
