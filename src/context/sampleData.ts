
import { v4 as uuidv4 } from 'uuid';
import { Client, Product } from '../types';

// Sample data for development
export const sampleProducts: Product[] = [
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

export const sampleClients: Client[] = [
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
