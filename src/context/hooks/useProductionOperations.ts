
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Production, Ingredient } from '../../types';
import { toast } from "sonner";

export const useProductionOperations = (
  productions: Production[],
  setProductions: React.Dispatch<React.SetStateAction<Production[]>>
) => {
  const addProduction = (production: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduction: Production = {
      ...production,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProductions([...productions, newProduction]);
    toast.success("Production ajoutée avec succès");
  };

  const updateProduction = (productionId: string, productionData: Partial<Production>) => {
    setProductions(
      productions.map((production) =>
        production.id === productionId
          ? { ...production, ...productionData, updatedAt: new Date() }
          : production
      )
    );
    toast.success("Production mise à jour");
  };

  const deleteProduction = (productionId: string) => {
    setProductions(productions.filter((production) => production.id !== productionId));
    toast.success("Production supprimée");
  };

  const addIngredientToProduction = (productionId: string, ingredient: Omit<Ingredient, 'id'>) => {
    setProductions(
      productions.map((production) =>
        production.id === productionId
          ? {
              ...production,
              ingredients: [
                ...production.ingredients,
                { ...ingredient, id: uuidv4() },
              ],
              updatedAt: new Date(),
            }
          : production
      )
    );
  };

  const removeIngredientFromProduction = (productionId: string, ingredientId: string) => {
    setProductions(
      productions.map((production) =>
        production.id === productionId
          ? {
              ...production,
              ingredients: production.ingredients.filter(
                (ingredient) => ingredient.id !== ingredientId
              ),
              updatedAt: new Date(),
            }
          : production
      )
    );
  };

  // Fonction pour filtrer les productions par date
  const filterProductionsByDate = (startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return productions;

    return productions.filter((production) => {
      const productionDate = new Date(production.productionDate);
      
      if (startDate && !endDate) {
        return productionDate >= startDate;
      }
      
      if (!startDate && endDate) {
        return productionDate <= endDate;
      }
      
      if (startDate && endDate) {
        return productionDate >= startDate && productionDate <= endDate;
      }
      
      return true;
    });
  };

  // Fonction pour rechercher des productions
  const searchProductions = (searchTerm: string) => {
    if (!searchTerm.trim()) return productions;
    
    const term = searchTerm.toLowerCase();
    return productions.filter((production) => 
      production.product.name.toLowerCase().includes(term) ||
      production.batchNumber.toLowerCase().includes(term) ||
      production.autoclaveNumber?.toLowerCase().includes(term) ||
      production.ingredients.some(i => i.name.toLowerCase().includes(term) || i.lotNumber.toLowerCase().includes(term))
    );
  };

  return {
    addProduction,
    updateProduction,
    deleteProduction,
    addIngredientToProduction,
    removeIngredientFromProduction,
    filterProductionsByDate,
    searchProductions
  };
};
