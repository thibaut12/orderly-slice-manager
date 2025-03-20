
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../types';
import { toast } from "sonner";

export const useProductOperations = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
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

  return { addProduct, updateProduct, deleteProduct };
};
