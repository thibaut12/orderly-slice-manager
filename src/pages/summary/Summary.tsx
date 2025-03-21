
import React, { useMemo, useState } from 'react';
import { 
  Download, Printer, Filter, ChevronDown, 
  ChevronUp, FileText, Calendar, Package 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { Button } from '@/components/ui/button';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { formatWeight, formatDate } from '@/utils/formatters';

const Summary = () => {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { cuttingDays } = useCuttingDays();
  const [cuttingDayId, setCuttingDayId] = useState<string>('all');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Filter orders based on selected cutting day
  const filteredOrders = useMemo(() => {
    if (cuttingDayId === 'all') {
      return orders;
    } else {
      return orders.filter(order => order.cuttingDayId === cuttingDayId);
    }
  }, [orders, cuttingDayId]);

  // Group products for cutting summary
  const productSummary = useMemo(() => {
    const summary: Record<string, {
      totalWeight: number;
      totalUnits: number;
      products: Array<{
        id: string;
        name: string;
        packageType: string;
        totalWeight: number;
        totalUnits: number;
        unitQuantity: number;
      }>;
    }> = {};

    // Process each order's items
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        const category = product.category || 'Sans catégorie';
        
        // Initialize category if it doesn't exist
        if (!summary[category]) {
          summary[category] = {
            totalWeight: 0,
            totalUnits: 0,
            products: []
          };
        }
        
        // Find existing product in summary
        let productInSummary = summary[category].products.find(p => p.id === product.id);
        
        if (!productInSummary) {
          // Add new product to category
          productInSummary = {
            id: product.id,
            name: product.name,
            packageType: product.packageType,
            totalWeight: 0,
            totalUnits: 0,
            unitQuantity: product.unitQuantity
          };
          summary[category].products.push(productInSummary);
        }
        
        // Update counts
        const itemTotalWeight = item.totalWeight;
        const itemTotalUnits = item.quantity * product.unitQuantity;
        
        productInSummary.totalWeight += itemTotalWeight;
        productInSummary.totalUnits += itemTotalUnits;
        
        // Update category totals
        summary[category].totalWeight += itemTotalWeight;
        summary[category].totalUnits += itemTotalUnits;
      });
    });
    
    return summary;
  }, [filteredOrders]);

  // Calculate grand totals
  const grandTotal = useMemo(() => {
    let totalWeight = 0;
    let totalUnits = 0;
    
    Object.values(productSummary).forEach(category => {
      totalWeight += category.totalWeight;
      totalUnits += category.totalUnits;
    });
    
    return { totalWeight, totalUnits };
  }, [productSummary]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Synthèse</h1>
            <p className="text-muted-foreground">
              Récapitulatif des produits à découper
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filtres</CardTitle>
            <CardDescription>
              Filtrer la synthèse par journée de découpe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={cuttingDayId}
                onValueChange={setCuttingDayId}
              >
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Sélectionner une journée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les journées</SelectItem>
                  {cuttingDays.map(day => (
                    <SelectItem key={day.id} value={day.id}>
                      {formatDate(day.date)} - {day.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {Object.keys(productSummary).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium">Aucune donnée à afficher</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Il n'y a pas de commandes pour générer une synthèse{cuttingDayId !== 'all' ? ' pour cette journée de découpe' : ''}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center">
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Commandes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredOrders.length}</div>
                  <p className="text-sm text-muted-foreground">
                    commande{filteredOrders.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Unités</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{grandTotal.totalUnits}</div>
                  <p className="text-sm text-muted-foreground">
                    unité{grandTotal.totalUnits !== 1 ? 's' : ''} à préparer
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">Poids total</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatWeight(grandTotal.totalWeight)}</div>
                  <p className="text-sm text-muted-foreground">
                    à découper
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Products Summary */}
            <Card className="print:shadow-none">
              <CardHeader>
                <CardTitle>Détail de la synthèse</CardTitle>
                <CardDescription>
                  Regroupement des produits par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(productSummary).map(([category, data]) => (
                    <div key={category} className="border rounded-md overflow-hidden">
                      <div 
                        className="flex justify-between items-center p-4 bg-muted/40 cursor-pointer"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="font-medium">{category}</div>
                        <div className="flex items-center">
                          <span className="mr-4 text-sm text-muted-foreground">
                            {formatWeight(data.totalWeight)}
                          </span>
                          {expandedCategories[category] ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </div>
                      </div>
                      {expandedCategories[category] && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead>Conditionnement</TableHead>
                              <TableHead className="text-right">Unités</TableHead>
                              <TableHead className="text-right">Poids</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.products.map(product => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.packageType}</TableCell>
                                <TableCell className="text-right">{product.totalUnits}</TableCell>
                                <TableCell className="text-right">{formatWeight(product.totalWeight)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t-2">
                              <TableCell colSpan={2} className="font-bold">
                                Total {category}
                              </TableCell>
                              <TableCell className="text-right font-bold">{data.totalUnits}</TableCell>
                              <TableCell className="text-right font-bold">{formatWeight(data.totalWeight)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Summary;
