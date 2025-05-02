
import React from 'react';
import { Shield } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[60vh] flex-col">
      <Shield className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
      <p className="text-muted-foreground">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
    </div>
  );
};

export default AccessDenied;
