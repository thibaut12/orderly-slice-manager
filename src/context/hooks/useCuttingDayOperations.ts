
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CuttingDay, Order } from '../../types';
import { toast } from "sonner";

export const useCuttingDayOperations = (
  cuttingDays: CuttingDay[],
  setCuttingDays: React.Dispatch<React.SetStateAction<CuttingDay[]>>,
  orders: Order[]
) => {
  const addCuttingDay = (cuttingDay: Omit<CuttingDay, 'id' | 'createdAt' | 'updatedAt' | 'totalWeight' | 'orderCount'>) => {
    const newCuttingDay: CuttingDay = {
      ...cuttingDay,
      id: uuidv4(),
      totalWeight: 0,
      orderCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCuttingDays([...cuttingDays, newCuttingDay]);
    toast.success("Journée de découpe ajoutée avec succès");
  };

  const updateCuttingDay = (cuttingDayId: string, cuttingDayData: Partial<CuttingDay>) => {
    setCuttingDays(
      cuttingDays.map((day) =>
        day.id === cuttingDayId
          ? { ...day, ...cuttingDayData, updatedAt: new Date() }
          : day
      )
    );
    toast.success("Journée de découpe mise à jour");
  };

  const deleteCuttingDay = (cuttingDayId: string) => {
    // Check if there are orders associated with this cutting day
    const hasAssociatedOrders = orders.some(order => order.cuttingDayId === cuttingDayId);
    
    if (hasAssociatedOrders) {
      toast.error("Impossible de supprimer cette journée car des commandes y sont associées");
      return;
    }
    
    setCuttingDays(cuttingDays.filter((day) => day.id !== cuttingDayId));
    toast.success("Journée de découpe supprimée");
  };

  return { addCuttingDay, updateCuttingDay, deleteCuttingDay };
};
