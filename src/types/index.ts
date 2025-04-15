export interface Product {
  id: string;
  name: string;
  unitQuantity: number; // Nombre d'unités (ex: nombre de poches)
  weightPerUnit: number; // Poids par unité (ex: 150g, 500g)
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
    cuttingPreferences?: string; // Préférences de découpe
    packagingPreferences?: string; // Préférences d'emballage
    specialRequests?: string; // Demandes spéciales
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  totalWeight: number; // Calculé automatiquement: quantity * product.weightPerUnit * product.unitQuantity
  notes?: string; // Notes spécifiques à cet élément
}

export interface Order {
  id: string;
  clientId: string;
  client: Client;
  items: OrderItem[];
  totalWeight: number; // Calculé automatiquement: somme des poids des éléments
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  cuttingDayId?: string; // Référence à la journée de découpe associée
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CuttingDay {
  id: string;
  date: Date;
  description?: string;
  totalWeight: number; // Calculé: somme des poids des commandes associées
  orderCount: number; // Calculé: nombre de commandes associées
  status: 'en-cours' | 'termine';
  createdAt: Date;
  updatedAt: Date;
}

export interface CuttingSummaryItem {
  productName: string;
  totalQuantity: number;
  totalWeight: number;
  unitQuantity: number; // Adding the unit quantity information
}

export interface CuttingSummary {
  items: CuttingSummaryItem[];
  totalProducts: number;
  totalWeight: number;
  generatedAt: Date;
}

// Interfaces pour le module de traçabilité

export interface Ingredient {
  id: string;
  name: string;
  lotNumber: string;
  quantity: number;
  unit: 'g' | 'kg' | 'l' | 'ml' | 'unité';
}

export interface Production {
  id: string;
  productId: string;
  product: Product;
  batchNumber: string;
  productionDate: Date;
  ingredients: Ingredient[];
  autoclaveNumber?: string;
  temperature?: number;
  startTemperature?: number; // Température de départ
  midCycleTemperature?: number; // Température au milieu du cycle
  duration?: number; // en minutes
  quantityProduced: number;
  stoveTest?: 'validé' | 'non-validé' | 'en-attente';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'date' | 'weight' | 'status';

export interface FilterOptions {
  searchTerm?: string;
  sortField?: SortField;
  sortDirection?: SortDirection;
  dateFrom?: Date;
  dateTo?: Date;
  cuttingDayId?: string;
  status?: string;
}

// Interface pour l'authentification
export interface User {
  id: string;
  username: string;
  password: string; // Dans une vraie application, il faudrait stocker un hash
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Mise à jour de l'interface AuthState pour corriger les types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}
