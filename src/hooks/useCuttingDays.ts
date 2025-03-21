
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export const useCuttingDays = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useCuttingDays must be used within an AppProvider');
  }
  
  const { cuttingDays, addCuttingDay, updateCuttingDay, deleteCuttingDay } = context;
  
  return {
    cuttingDays,
    addCuttingDay,
    updateCuttingDay,
    deleteCuttingDay
  };
};
