
export interface Product {
  id: string;
  name: string;
  unitQuantity: number;
  weightPerUnit: number;
  weightUnit: 'g' | 'kg';
  packageType: 'sous-vide' | 'en-vrac' | 'autoclave' | 'autre';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferences: {
    cuttingPreferences?: string;
    packagingPreferences?: string;
    specialRequests?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  totalWeight: number;
  notes?: string;
}

export interface Order {
  id: string;
  clientId: string;
  client: Client;
  items: OrderItem[];
  totalWeight: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CuttingSummaryItem {
  productName: string;
  totalQuantity: number;
  totalWeight: number;
}

export interface CuttingSummary {
  items: CuttingSummaryItem[];
  totalProducts: number;
  totalWeight: number;
  generatedAt: Date;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'date' | 'weight' | 'status';

export interface FilterOptions {
  searchTerm?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}
