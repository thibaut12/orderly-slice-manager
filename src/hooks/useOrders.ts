
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, Product } from '@/types';

export const useOrders = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useOrders must be used within an AppProvider');
  }
  
  const { orders, addOrder, updateOrder, deleteOrder, cuttingDays } = context;
  
  // Fonction utilitaire pour créer un nouvel élément de commande
  const createOrderItem = (product: Product, quantity: number = 1): OrderItem => {
    const totalWeight = product.weightPerUnit * product.unitQuantity * quantity;
    
    return {
      id: uuidv4(),
      productId: product.id,
      product,
      quantity,
      totalWeight,
    };
  };
  
  // Fonction utilitaire pour calculer le poids total d'une commande
  const calculateOrderTotalWeight = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => sum + item.totalWeight, 0);
  };
  
  // Fonction pour récupérer les commandes liées aux journées de découpe en cours
  const getActiveOrders = (): Order[] => {
    // Récupérer les IDs des journées en cours
    const activeCuttingDayIds = cuttingDays
      .filter(day => day.status === 'en-cours')
      .map(day => day.id);
      
    // Filtrer les commandes associées à ces journées
    return orders.filter(order => 
      order.cuttingDayId && activeCuttingDayIds.includes(order.cuttingDayId)
    );
  };
  
  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    createOrderItem,
    calculateOrderTotalWeight,
    getActiveOrders
  };
};
