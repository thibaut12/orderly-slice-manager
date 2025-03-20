
import { CuttingSummary, Order } from '../../types';

export const useSummaryOperations = (orders: Order[]) => {
  // Generate cutting summary for all orders or filtered by cutting day
  const generateCuttingSummary = (cuttingDayId?: string): CuttingSummary => {
    const summaryMap = new Map<string, { quantity: number; weight: number }>();
    
    // Filter orders by cutting day if specified
    const ordersToSummarize = cuttingDayId 
      ? orders.filter(order => order.cuttingDayId === cuttingDayId)
      : orders;

    // Calculate total quantity and weight for each product
    ordersToSummarize.forEach((order) => {
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

  // Get cutting summary for a specific cutting day
  const getCuttingDaySummary = (cuttingDayId: string): CuttingSummary => {
    return generateCuttingSummary(cuttingDayId);
  };

  return { generateCuttingSummary, getCuttingDaySummary };
};
