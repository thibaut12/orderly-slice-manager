
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { CuttingDay } from '@/types';

export const useCuttingDays = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useCuttingDays must be used within an AppProvider');
  }
  
  const { cuttingDays, addCuttingDay, updateCuttingDay, deleteCuttingDay } = context;
  
  // Fonction pour obtenir uniquement les journées de découpe en cours
  const getActiveCuttingDays = (): CuttingDay[] => {
    return cuttingDays.filter(day => day.status === 'en-cours');
  };
  
  // Fonction pour obtenir uniquement les journées de découpe terminées
  const getCompletedCuttingDays = (): CuttingDay[] => {
    return cuttingDays.filter(day => day.status === 'termine');
  };
  
  return {
    cuttingDays,
    addCuttingDay,
    updateCuttingDay,
    deleteCuttingDay,
    getActiveCuttingDays,
    getCompletedCuttingDays
  };
};
