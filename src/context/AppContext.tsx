
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client, Product, Order, FilterOptions, CuttingSummary } from '../types';
import { toast } from "sonner";

interface AppContextType {
  clients: Client[];
  products: Product[];
  orders: Order[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (clientId: string, clientData: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (productId: string, productData: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  filterOrders: (options: FilterOptions) => Order[];
  generateCuttingSummary: () => CuttingSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Sample data for development
const sampleProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Bifteck',
    unitQuantity: 2,
    weightPerUnit: 150,
    weightUnit: 'g',
    packageType: 'sous-vide',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Entrecôte',
    unitQuantity: 1,
    weightPerUnit: 250,
    weightUnit: 'g',
    packageType: 'sous-vide',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Bourguignon',
    unitQuantity: 1,
    weightPerUnit: 500,
    weightUnit: 'g',
    packageType: 'sous-vide',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleClients: Client[] = [
  {
    id: uuidv4(),
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '0123456789',
    preferences: {
      cuttingPreferences: 'Épaisseur moyenne',
      packagingPreferences: 'Sous-vide',
      specialRequests: 'Emballer les steaks individuellement',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    phone: '0123456780',
    preferences: {
      packagingPreferences: 'En vrac',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [clients, products, orders]);

  // Client operations
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...client,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setClients([...clients, newClient]);
    toast.success("Client ajouté avec succès");
  };

  const updateClient = (clientId: string, clientData: Partial<Client>) => {
    setClients(
      clients.map((client) =>
        client.id === clientId
          ? { ...client, ...clientData, updatedAt: new Date() }
          : client
      )
    );
    toast.success("Client mis à jour");
  };

  const deleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId));
    toast.success("Client supprimé");
  };

  // Product operations
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts([...products, newProduct]);
    toast.success("Produit ajouté avec succès");
  };

  const updateProduct = (productId: string, productData: Partial<Product>) => {
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, ...productData, updatedAt: new Date() }
          : product
      )
    );
    toast.success("Produit mis à jour");
  };

  const deleteProduct = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId));
    toast.success("Produit supprimé");
  };

  // Order operations
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

    // Apply status filter
    if (options.status && options.status.length > 0) {
      filteredOrders = filteredOrders.filter((order) =>
        options.status?.includes(order.status)
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
          case 'status':
            return direction * a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
    }

    return filteredOrders;
  };

  // Generate cutting summary
  const generateCuttingSummary = (): CuttingSummary => {
    const summaryMap = new Map<string, { quantity: number; weight: number }>();

    // Calculate total quantity and weight for each product
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productName = item.product.name;
        const existing = summaryMap.get(productName) || { quantity: 0, weight: 0 };
        
        summaryMap.set(productName, {
          quantity: existing.quantity + item.quantity,
          weight: existing.weight + item.totalWeight,
        });
      });
    });

    // Convert map to array of summary items
    const items = Array.from(summaryMap.entries()).map(([productName, data]) => ({
      productName,
      totalQuantity: data.quantity,
      totalWeight: data.weight,
    }));

    // Calculate overall totals
    const totalProducts = items.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalWeight = items.reduce((sum, item) => sum + item.totalWeight, 0);

    return {
      items,
      totalProducts,
      totalWeight,
      generatedAt: new Date(),
    };
  };

  const value = {
    clients,
    products,
    orders,
    addClient,
    updateClient,
    deleteClient,
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    filterOrders,
    generateCuttingSummary,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
