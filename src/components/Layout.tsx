
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Home, Users, Package, ShoppingCart, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const navLinks = [
    { name: 'Tableau de bord', path: '/', icon: Home },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Produits', path: '/products', icon: Package },
    { name: 'Commandes', path: '/orders', icon: ShoppingCart },
    { name: 'Synthèse', path: '/summary', icon: FileText },
  ];

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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-secondary/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-lg transition-all duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0 w-64" : "translate-x-[-100%] md:translate-x-0 md:w-20",
          "md:static"
        )}
      >
        {/* Logo and app name */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <span className={cn("font-semibold text-xl transition-opacity", sidebarOpen ? "opacity-100" : "opacity-0 hidden md:block")}>
              OrderManager
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <Button
              key={link.path}
              variant={location.pathname === link.path ? "default" : "ghost"}
              className={cn(
                "w-full justify-start mb-1",
                location.pathname === link.path 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary"
              )}
              onClick={() => navigate(link.path)}
            >
              <link.icon className="h-5 w-5 mr-2" />
              <span className={cn(sidebarOpen ? "opacity-100" : "opacity-0 hidden md:block")}>
                {link.name}
              </span>
            </Button>
          ))}
        </nav>

        {/* Footer with toggle button for desktop */}
        <div className="hidden md:flex items-center justify-center p-4 border-t">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold">OrderManager</span>
      </div>

      {/* Main content */}
      <main className={cn(
        "flex-1 min-h-[calc(100vh-4rem)] md:min-h-screen transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        <div className="container px-4 py-6 mx-auto max-w-6xl animate-slide-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
