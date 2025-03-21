
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export const useOrders = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useOrders must be used within an AppProvider');
  }
  
  const { orders, addOrder, updateOrder, deleteOrder } = context;
  
  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder
  };
};
