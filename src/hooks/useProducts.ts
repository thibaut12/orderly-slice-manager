
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Product } from '@/types';

export const useProducts = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useProducts must be used within an AppProvider');
  }
  
  const { products, addProduct, updateProduct, deleteProduct } = context;
  
  // Fonction utilitaire pour filtrer les produits par terme de recherche
  const filterProducts = (searchTerm: string = ''): Product[] => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.packageType.toLowerCase().includes(term)
    );
  };
  
  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    filterProducts
  };
};
