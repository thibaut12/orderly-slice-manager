
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MobileHeader from './MobileHeader';
import DesktopSidebar from './DesktopSidebar';
import { navItems } from './navItems';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const currentPath = location.pathname;
  
  // Find the current route based on the pathname
  const currentRoute = navItems.find(item => 
    item.href === currentPath || currentPath.startsWith(item.href + '/')
  );
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile navigation */}
      <MobileHeader 
        currentPath={currentPath} 
        currentRoute={currentRoute} 
        filteredNavItems={filteredNavItems} 
      />

      {/* Desktop navigation */}
      <DesktopSidebar 
        currentPath={currentPath} 
        filteredNavItems={filteredNavItems} 
      />

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
