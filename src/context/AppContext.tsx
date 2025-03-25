
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Product, Order, FilterOptions, CuttingSummary, CuttingDay, Production } from '../types';
import { useClientOperations } from './hooks/useClientOperations';
import { useProductOperations } from './hooks/useProductOperations';
import { useOrderOperations } from './hooks/useOrderOperations';
import { useCuttingDayOperations } from './hooks/useCuttingDayOperations';
import { useSummaryOperations } from './hooks/useSummaryOperations';
import { useProductionOperations } from './hooks/useProductionOperations';
import { sampleClients, sampleProducts } from './sampleData';

// Define the context type
interface AppContextType {
  clients: Client[];
  products: Product[];
  orders: Order[];
  cuttingDays: CuttingDay[];
  productions: Production[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (clientId: string, clientData: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (productId: string, productData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  addCuttingDay: (cuttingDay: Omit<CuttingDay, 'id' | 'createdAt' | 'updatedAt' | 'totalWeight' | 'orderCount'>) => void;
  updateCuttingDay: (cuttingDayId: string, cuttingDayData: Partial<CuttingDay>) => void;
  deleteCuttingDay: (cuttingDayId: string) => void;
  addProduction: (production: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduction: (productionId: string, productionData: Partial<Production>) => void;
  deleteProduction: (productionId: string) => void;
  filterOrders: (options: FilterOptions) => Order[];
  generateCuttingSummary: (cuttingDayId?: string) => CuttingSummary;
  getCuttingDaySummary: (cuttingDayId: string) => CuttingSummary;
}

// Create context with initial empty values
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization from localStorage or sample data
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : sampleClients;
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : sampleProducts;
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  const [cuttingDays, setCuttingDays] = useState<CuttingDay[]>(() => {
    const savedCuttingDays = localStorage.getItem('cuttingDays');
    return savedCuttingDays ? JSON.parse(savedCuttingDays) : [];
  });

  const [productions, setProductions] = useState<Production[]>(() => {
    const savedProductions = localStorage.getItem('productions');
    return savedProductions ? JSON.parse(savedProductions) : [];
  });

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('cuttingDays', JSON.stringify(cuttingDays));
    localStorage.setItem('productions', JSON.stringify(productions));
  }, [clients, products, orders, cuttingDays, productions]);

  // Update cutting days metrics when orders change
  useEffect(() => {
    // Skip if no cutting days
    if (cuttingDays.length === 0) return;
    
    // Calculate totals for each cutting day
    const updatedCuttingDays = cuttingDays.map(day => {
      const dayOrders = orders.filter(order => order.cuttingDayId === day.id);
      const totalWeight = dayOrders.reduce((sum, order) => sum + order.totalWeight, 0);
      
      return {
        ...day,
        totalWeight,
        orderCount: dayOrders.length
      };
    });
    
    setCuttingDays(updatedCuttingDays);
  }, [orders]);

  // Get hooks with operations
  const { addClient, updateClient, deleteClient } = useClientOperations(clients, setClients);
  const { addProduct, updateProduct, deleteProduct } = useProductOperations(products, setProducts);
  const { addOrder, updateOrder, deleteOrder, filterOrders } = useOrderOperations(orders, setOrders);
  const { addCuttingDay, updateCuttingDay, deleteCuttingDay } = useCuttingDayOperations(cuttingDays, setCuttingDays, orders);
  const { generateCuttingSummary, getCuttingDaySummary } = useSummaryOperations(orders);
  const { addProduction, updateProduction, deleteProduction } = useProductionOperations(productions, setProductions);

  const value = {
    clients,
    products,
    orders,
    cuttingDays,
    productions,
    addClient,
    updateClient,
    deleteClient,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    addCuttingDay,
    updateCuttingDay,
    deleteCuttingDay,
    addProduction,
    updateProduction,
    deleteProduction,
    filterOrders,
    generateCuttingSummary,
    getCuttingDaySummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Helper hook to use the context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
