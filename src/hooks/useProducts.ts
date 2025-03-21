
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useProducts = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useProducts must be used within an AppProvider');
  }
  
  const { products, addProduct, updateProduct, deleteProduct } = context;
  
  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
