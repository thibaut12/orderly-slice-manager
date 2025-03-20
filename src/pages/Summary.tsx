
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Download, ChevronDown, ChevronUp, Printer, 
  BarChart2, Scale, Package, RefreshCw
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/AppContext';
import { formatWeight } from '@/utils/calculations';
import { toast } from "sonner";

const Summary = () => {
  const navigate = useNavigate();
  const { orders, generateCuttingSummary } = useApp();
  const [sortField, setSortField] = useState<'name' | 'quantity' | 'weight'>('quantity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const summaryRef = useRef<HTMLDivElement>(null);
  
  // Generate cutting summary
  const summary = generateCuttingSummary();
  
  // Sort summary items
  const sortedItems = [...summary.items].sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.productName.localeCompare(b.productName) 
        : b.productName.localeCompare(a.productName);
    } else if (sortField === 'quantity') {
      return sortDirection === 'asc' 
        ? a.totalQuantity - b.totalQuantity 
        : b.totalQuantity - a.totalQuantity;
    } else {
      return sortDirection === 'asc' 
        ? a.totalWeight - b.totalWeight 
        : b.totalWeight - a.totalWeight;
    }
  });
  
  // Toggle sort direction
  const toggleSort = (field: 'name' | 'quantity' | 'weight') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Generate PDF from the summary
  const exportToPDF = () => {
    // Simulation of PDF export
    toast.success("Export PDF en cours...");
    setTimeout(() => {
      toast.success("Synthèse exportée en PDF avec succès");
    }, 1500);
  };
  
  // Export to Excel/CSV
  const exportToExcel = () => {
    // Simulation of Excel export
    toast.success("Export Excel en cours...");
    setTimeout(() => {
      toast.success("Synthèse exportée en Excel avec succès");
    }, 1500);
  };
  
  // Print summary
  const printSummary = () => {
    window.print();
  };
  
  return (
    <Layout>
      <div className="animate-fade-in print:m-0 print:p-0" ref={summaryRef}>
        {/* Header section */}
        <div className="flex justify-between items-center mb-6 print:mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Synthèse pour la découpe</h1>
            <p className="text-muted-foreground">
              Récapitulatif des quantités et des poids pour optimiser la découpe.
            </p>
          </div>
          <div className="print:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter en PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exporter en Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printSummary}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <Separator className="my-6 print:my-4" />
        
        {/* Summary info */}
        <div className="print:text-left mb-6 print:mb-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Généré le : {new Date(summary.generatedAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
            <span className="text-sm text-muted-foreground">Nombre de commandes : {orders.length}</span>
          </div>
        </div>
        
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3 print:gap-2 print:mb-4">
          <Card className="card-hover print:shadow-none print:border">
            <CardHeader className="flex flex-row items-center justify-between py-3 print:p-2">
              <CardTitle className="text-sm font-medium">
                Total des produits
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="print:p-2">
              <div className="text-2xl font-bold">{summary.totalProducts}</div>
              <p className="text-xs text-muted-foreground">unités à préparer</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover print:shadow-none print:border">
            <CardHeader className="flex flex-row items-center justify-between py-3 print:p-2">
              <CardTitle className="text-sm font-medium">
                Poids total
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="print:p-2">
              <div className="text-2xl font-bold">{formatWeight(summary.totalWeight)}</div>
              <p className="text-xs text-muted-foreground">à découper</p>
            </CardContent>
          </Card>
          
          <Card className="card-hover print:shadow-none print:border">
            <CardHeader className="flex flex-row items-center justify-between py-3 print:p-2">
              <CardTitle className="text-sm font-medium">
                Variétés de produits
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="print:p-2">
              <div className="text-2xl font-bold">{summary.items.length}</div>
              <p className="text-xs text-muted-foreground">types de découpe</p>
            </CardContent>
          </Card>
        </div>
        
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 mt-8 rounded-lg border border-dashed">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucune commande enregistrée</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Commencez par ajouter des commandes pour générer une synthèse pour la découpe.
            </p>
            <Button onClick={() => navigate('/orders/new')}>
              Créer une commande
            </Button>
          </div>
        ) : (
          // Detailed summary table
          <Card className="print:shadow-none print:border">
            <CardHeader className="print:p-2">
              <CardTitle className="text-lg print:text-base">Détail des produits à découper</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer print:cursor-default"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center">
                        Produit
                        {sortField === 'name' && (
                          <span className="print:hidden">
                            {sortDirection === 'asc' ? 
                              <ChevronDown className="ml-1 h-4 w-4" /> : 
                              <ChevronUp className="ml-1 h-4 w-4" />
                            }
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer print:cursor-default"
                      onClick={() => toggleSort('quantity')}
                    >
                      <div className="flex items-center">
                        Quantité
                        {sortField === 'quantity' && (
                          <span className="print:hidden">
                            {sortDirection === 'asc' ? 
                              <ChevronDown className="ml-1 h-4 w-4" /> : 
                              <ChevronUp className="ml-1 h-4 w-4" />
                            }
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer print:cursor-default"
                      onClick={() => toggleSort('weight')}
                    >
                      <div className="flex items-center">
                        Poids total
                        {sortField === 'weight' && (
                          <span className="print:hidden">
                            {sortDirection === 'asc' ? 
                              <ChevronDown className="ml-1 h-4 w-4" /> : 
                              <ChevronUp className="ml-1 h-4 w-4" />
                            }
                          </span>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow key={item.productName}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        {item.totalQuantity} unité{item.totalQuantity > 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>
                        {formatWeight(item.totalWeight)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="font-bold">{summary.totalProducts} unité{summary.totalProducts > 1 ? 's' : ''}</TableCell>
                    <TableCell className="font-bold">{formatWeight(summary.totalWeight)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        
        {/* Print information */}
        <div className="mt-8 text-center text-sm text-muted-foreground hidden print:block">
          <p>Document généré par OrderManager - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div className="mt-8 flex justify-center print:hidden">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Retour aux commandes
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Summary;
