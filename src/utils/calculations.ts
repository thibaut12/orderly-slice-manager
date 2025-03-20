
import { OrderItem, Product } from '../types';

// Calculate total weight for an order item
export const calculateItemTotalWeight = (product: Product, quantity: number): number => {
  const unitWeight = product.weightPerUnit;
  const unitMultiplier = product.weightUnit === 'kg' ? 1000 : 1; // Convert to grams if needed
  return (unitWeight * unitMultiplier * quantity);
};

// Format weight to display with appropriate unit
export const formatWeight = (weightInGrams: number): string => {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
  }
  return `${weightInGrams} g`;
};

// Calculate total weight for all items
export const calculateTotalWeight = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.totalWeight, 0);
};

// Format date to display in a readable format
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generate status badge color based on order status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Translate status to French
export const translateStatus = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'confirmed':
      return 'Confirmée';
    case 'processing':
      return 'En traitement';
    case 'completed':
      return 'Terminée';
    case 'cancelled':
      return 'Annulée';
    default:
      return status;
  }
};
