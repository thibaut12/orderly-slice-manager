
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Order, FilterOptions } from '../../types';
import { toast } from "sonner";

export const useOrderOperations = (
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>
) => {
  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOrders([...orders, newOrder]);
    toast.success("Commande ajoutée avec succès");
  };

  const updateOrder = (orderId: string, orderData: Partial<Order>) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, ...orderData, updatedAt: new Date() }
          : order
      )
    );
    toast.success("Commande mise à jour");
  };

  const deleteOrder = (orderId: string) => {
    setOrders(orders.filter((order) => order.id !== orderId));
    toast.success("Commande supprimée");
  };

  // Filter orders based on options
  const filterOrders = (options: FilterOptions): Order[] => {
    let filteredOrders = [...orders];

    // Apply search term filter
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.client.name.toLowerCase().includes(searchLower) ||
          order.id.toLowerCase().includes(searchLower) ||
          order.items.some(item => 
            item.product.name.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply date range filter
    if (options.dateFrom) {
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.orderDate) >= new Date(options.dateFrom!)
      );
    }
    if (options.dateTo) {
      filteredOrders = filteredOrders.filter(
        (order) => new Date(order.orderDate) <= new Date(options.dateTo!)
      );
    }

    // Apply cutting day filter
    if (options.cuttingDayId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.cuttingDayId === options.cuttingDayId
      );
    }

    // Apply sorting
    if (options.sortField) {
      filteredOrders.sort((a, b) => {
        const direction = options.sortDirection === 'desc' ? -1 : 1;
        
        switch (options.sortField) {
          case 'name':
            return direction * a.client.name.localeCompare(b.client.name);
          case 'date':
            return direction * (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
          case 'weight':
            return direction * (a.totalWeight - b.totalWeight);
          default:
            return 0;
        }
      });
    }

    return filteredOrders;
  };

  return { addOrder, updateOrder, deleteOrder, filterOrders };
};
