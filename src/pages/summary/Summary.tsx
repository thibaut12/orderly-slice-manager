import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { ArrowLeft, FileText, BarChart2, Download, Filter } from 'lucide-react';
import { formatDate, formatWeight } from '@/utils/formatters';
import { CuttingSummary } from '@/types';

const Summary = () => {
  const navigate = useNavigate();
  const { cuttingDays, orders, products, generateCuttingSummary, getCuttingDaySummary } = useApp();
  const [selectedCuttingDay, setSelectedCuttingDay] = useState<string>('all');
  const [summary, setSummary] = useState<CuttingSummary | null>(null);
  
  useEffect(() => {
    if (selectedCuttingDay === 'all') {
      const generatedSummary = generateCuttingSummary();
      setSummary(generatedSummary);
    } else {
      const cuttingDaySummary = getCuttingDaySummary(selectedCuttingDay);
      setSummary(cuttingDaySummary);
    }
  }, [selectedCuttingDay, generateCuttingSummary, getCuttingDaySummary, cuttingDays]);

  const handleExport = () => {
    if (!summary) return;
    
    const cuttingDayName = selectedCuttingDay === 'all' 
      ? 'Toutes les commandes' 
      : `Journée ${formatDate(cuttingDays.find(day => day.id === selectedCuttingDay)?.date || new Date())}`;
      
    const csvContent = [
      ['Produit', 'Quantité', 'Poids total'],
      ...summary.items.map(item => [
        item.productName,
        item.totalQuantity.toString(),
        item.totalWeight.toString()
      ]),
      ['', '', ''],
      ['Total', summary.totalProducts.toString(), summary.totalWeight.toString()]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    
    link.href = url;
    link.setAttribute('download', `synthese-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Synthèse des commandes</h1>
            <p className="text-muted-foreground">
              Récapitulatif des quantités et poids par produit
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" /> Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Journée de découpe</label>
                <Select value={selectedCuttingDay} onValueChange={setSelectedCuttingDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les commandes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les commandes</SelectItem>
                    {cuttingDays.map((day) => (
                      <SelectItem key={day.id} value={day.id}>
                        {formatDate(day.date)} - {day.orderCount} commandes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commandes</CardTitle>
              <CardDescription>Total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedCuttingDay === 'all' 
                  ? orders.length 
                  : orders.filter(o => o.cuttingDayId === selectedCuttingDay).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Produits</CardTitle>
              <CardDescription>Total des produits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalProducts || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Poids</CardTitle>
              <CardDescription>Poids total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatWeight(summary?.totalWeight || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" /> Détail par produit
            </CardTitle>
            <CardDescription>
              {selectedCuttingDay === 'all' 
                ? 'Toutes commandes confondues' 
                : `Journée du ${formatDate(cuttingDays.find(day => day.id === selectedCuttingDay)?.date || new Date())}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!summary || summary.items.length === 0 ? (
              <div className="text-center py-6">
                <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">Aucune donnée disponible</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Quantité</TableHead>
                    <TableHead className="text-right">Poids</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.totalQuantity * item.unitQuantity}
                      </TableCell>
                      <TableCell className="text-right">{formatWeight(item.totalWeight)}</TableCell>
                    </TableRow>
                  ))}
                  
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-bold">{summary.totalProducts}</TableCell>
                    <TableCell className="text-right font-bold">{formatWeight(summary.totalWeight)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Summary;
