
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Production } from '@/types';

export const useProductions = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useProductions must be used within an AppProvider');
  }
  
  const { productions, addProduction, updateProduction, deleteProduction } = context;
  
  // Fonction pour filtrer les productions par terme de recherche
  const searchProductions = (searchTerm: string = ''): Production[] => {
    if (!searchTerm.trim()) return productions;
    
    const term = searchTerm.toLowerCase();
    return productions.filter(production => 
      production.product.name.toLowerCase().includes(term) ||
      production.batchNumber.toLowerCase().includes(term) ||
      production.autoclaveNumber?.toLowerCase().includes(term)
    );
  };
  
  // Fonction pour obtenir les productions récentes (dernières 30 jours)
  const getRecentProductions = (): Production[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return productions.filter(production => 
      new Date(production.productionDate) >= thirtyDaysAgo
    ).sort((a, b) => 
      new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()
    );
  };
  
  return {
    productions,
    addProduction,
    updateProduction,
    deleteProduction,
    searchProductions,
    getRecentProductions
  };
};
