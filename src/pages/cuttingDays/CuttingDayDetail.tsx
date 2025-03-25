
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Info, Package, 
  FileText, Printer, Download, Edit, Trash2, ChevronDown, ChevronUp 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { formatDate, formatWeight, translateStatus } from '@/utils/formatters';
import { useSummaryOperations } from '@/context/hooks/useSummaryOperations';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CuttingDayDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cuttingDays, deleteCuttingDay } = useCuttingDays();
  const { orders } = useOrders();
  const { getCuttingDaySummary } = useSummaryOperations(orders);
  const [cuttingDay, setCuttingDay] = useState<any | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (id && cuttingDays.length > 0) {
      const day = cuttingDays.find(d => d.id === id);
      if (day) {
        setCuttingDay(day);
        
        // Find orders associated with this cutting day
        const dayOrders = orders.filter(order => order.cuttingDayId === id);
        setRelatedOrders(dayOrders);
      }
    }
  }, [id, cuttingDays, orders]);

  const handleDeleteCuttingDay = () => {
    if (id) {
      deleteCuttingDay(id);
      navigate('/cutting-days');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Nouvelle fonction pour exporter un résumé compact en PDF
  const exportSummaryToPDF = () => {
    try {
      if (!id) return;
      
      // Obtenir le résumé des produits pour cette journée de découpe
      const summary = getCuttingDaySummary(id);
      
      // Créer un nouveau document PDF en format A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Définir les couleurs et styles
      const headerBgColor = [74, 144, 206, 255]; // RGBA blue
      const headerTextColor = [255, 255, 255, 255]; // RGBA white
      const altRowColor = [240, 245, 250, 255]; // RGBA light blue
      
      // Ajouter un titre
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(`RÉCAPITULATIF DE DÉCOUPE - ${formatDate(cuttingDay?.date || new Date())}`, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
      
      // Sous-titre avec informations générales
      doc.setFontSize(10);
      doc.text(`Document généré le: ${new Date().toLocaleDateString('fr-FR')}`, 10, 22);
      doc.text(`Nombre total de commandes: ${relatedOrders.length}`, 10, 27);
      doc.text(`Poids total: ${formatWeight(cuttingDay?.totalWeight || 0)}`, 10, 32);
      
      // Regrouper tous les produits par client
      const clientProducts = {};
      relatedOrders.forEach(order => {
        if (!clientProducts[order.client.name]) {
          clientProducts[order.client.name] = [];
        }
        
        order.items.forEach(item => {
          const existingProduct = clientProducts[order.client.name].find(
            p => p.productName === item.product.name
          );
          
          if (existingProduct) {
            existingProduct.quantity += item.quantity;
            existingProduct.totalWeight += item.totalWeight;
          } else {
            clientProducts[order.client.name].push({
              productName: item.product.name,
              packageType: item.product.packageType,
              quantity: item.quantity,
              weightPerUnit: item.product.weightPerUnit * item.product.unitQuantity,
              totalWeight: item.totalWeight
            });
          }
        });
      });
      
      // Obtenir les noms uniques de tous les produits pour créer les colonnes
      const allProductNames = new Set();
      Object.values(clientProducts).forEach((products: any[]) => {
        products.forEach(p => allProductNames.add(p.productName));
      });
      
      // Créer les en-têtes de colonnes
      const headers = [['Client']];
      allProductNames.forEach(name => {
        headers[0].push(String(name));
      });
      headers[0].push('Poids total');
      
      // Préparer les données pour le tableau
      const body = [];
      Object.entries(clientProducts).forEach(([clientName, products]: [string, any[]]) => {
        const row = [clientName];
        
        // Pour chaque produit possible, ajouter la quantité ou laisser vide
        allProductNames.forEach(productName => {
          const product = products.find(p => p.productName === productName);
          row.push(product ? product.quantity.toString() : '');
        });
        
        // Ajouter le poids total pour ce client
        const totalClientWeight = products.reduce((sum, p) => sum + p.totalWeight, 0);
        row.push(formatWeight(totalClientWeight));
        
        body.push(row);
      });
      
      // Ajouter une ligne de total
      const totalsRow = ['TOTAL'];
      let columnIndex = 1;
      allProductNames.forEach(productName => {
        let totalQuantity = 0;
        Object.values(clientProducts).forEach((products: any[]) => {
          const product = products.find(p => p.productName === productName);
          if (product) {
            totalQuantity += product.quantity;
          }
        });
        totalsRow.push(totalQuantity > 0 ? totalQuantity.toString() : '');
        columnIndex++;
      });
      
      // Ajouter le poids total global
      totalsRow.push(formatWeight(cuttingDay?.totalWeight || 0));
      body.push(totalsRow);
      
      // Ajouter le tableau au PDF
      autoTable(doc, {
        head: headers,
        body: body,
        startY: 40,
        theme: 'grid',
        headStyles: { 
          fillColor: headerBgColor, 
          textColor: headerTextColor,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: { fillColor: altRowColor },
        // Style spécial pour la dernière ligne (totaux)
        willDrawRow: (data) => {
          if (data.row.index === body.length - 1) {
            doc.setFillColor(220, 230, 240);
            doc.setTextColor(0, 0, 0);
            // Use 'bold' directly for font style
            doc.setFont(undefined, 'bold');
          }
        }
      });
      
      // Ajouter des notes en bas de page
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text('Notes:', 10, finalY);
      doc.setFontSize(9);
      doc.text('Ce document est un récapitulatif des commandes pour cette journée de découpe.', 10, finalY + 5);
      doc.text('Pour plus de détails, veuillez consulter les fiches de commandes individuelles.', 10, finalY + 10);
      
      // Sauvegarder le PDF
      const date = new Date().toISOString().slice(0, 10);
      doc.save(`recap-decoupes-${date}.pdf`);
      
      toast.success("Récapitulatif exporté en PDF avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  const exportAllOrdersToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Commandes pour la journée du ${formatDate(cuttingDay?.date || new Date())}`, 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Document généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      
      // Add summary info
      doc.text(`Nombre de commandes: ${relatedOrders.length}`, 14, 40);
      doc.text(`Poids total: ${formatWeight(cuttingDay?.totalWeight || 0)}`, 14, 45);
      
      let yPos = 60;
      
      // For each order, create a section in the PDF
      relatedOrders.forEach((order, index) => {
        // Add space between orders
        if (index > 0) {
          yPos += 10;
        }
        
        // Order header
        doc.setFontSize(14);
        doc.text(`Commande #${order.id.slice(0, 8)} - ${order.client.name}`, 14, yPos);
        yPos += 10;
        
        // Order info
        doc.setFontSize(10);
        doc.text(`Date: ${formatDate(order.orderDate)}`, 14, yPos);
        yPos += 5;
        doc.text(`Statut: ${translateStatus(order.status)}`, 14, yPos);
        yPos += 5;
        doc.text(`Poids total: ${formatWeight(order.totalWeight)}`, 14, yPos);
        yPos += 10;
        
        // Order items table
        const orderItems = order.items.map((item: any) => [
          item.product.name,
          item.product.packageType,
          item.quantity.toString(),
          formatWeight(item.product.weightPerUnit * item.product.unitQuantity),
          formatWeight(item.totalWeight)
        ]);
        
        autoTable(doc, {
          head: [['Produit', 'Conditionnement', 'Quantité', 'Poids unitaire', 'Poids total']],
          body: orderItems,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185, 255], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245, 255] }
        });
        
        // Update position for next order
        yPos = (doc as any).lastAutoTable.finalY + 15;
        
        // Check if we need a new page
        if (yPos > 270 && index < relatedOrders.length - 1) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Save the PDF
      const date = new Date().toISOString().slice(0, 10);
      doc.save(`commandes-${date}.pdf`);
      
      toast.success("Commandes exportées en PDF avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export PDF");
    }
  };

  if (!cuttingDay) {
    return (
      <Layout>
        <div className="animate-fade-in p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Journée de découpe non trouvée</h1>
          <p className="mb-6 text-muted-foreground">
            La journée de découpe que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/cutting-days')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux journées de découpe
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Journée de découpe</h1>
            <p className="text-muted-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> {formatDate(cuttingDay.date)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/cutting-days')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
            <Button onClick={() => navigate(`/cutting-days/edit/${cuttingDay.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Informations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(cuttingDay.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <span className="font-medium">{cuttingDay.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Count */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Commandes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cuttingDay.orderCount}</div>
              <p className="text-sm text-muted-foreground">
                commande{cuttingDay.orderCount !== 1 ? 's' : ''} pour cette journée
              </p>
            </CardContent>
          </Card>

          {/* Total Weight */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Poids total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatWeight(cuttingDay.totalWeight)}</div>
              <p className="text-sm text-muted-foreground">à découper pour cette journée</p>
            </CardContent>
          </Card>
        </div>

        {/* Print & Export Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
          <Button variant="outline" onClick={exportAllOrdersToPDF}>
            <Download className="mr-2 h-4 w-4" /> Exporter détails commandes
          </Button>
          <Button variant="outline" onClick={exportSummaryToPDF}>
            <Download className="mr-2 h-4 w-4" /> Exporter récapitulatif compact
          </Button>
        </div>

        {/* Related Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes associées</CardTitle>
            <CardDescription>
              Liste des commandes prévues pour cette journée de découpe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {relatedOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Aucune commande</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aucune commande n'est associée à cette journée de découpe.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {relatedOrders.map((order) => (
                  <Card key={order.id} className="border border-muted">
                    <CardHeader className="px-4 py-3 bg-muted/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium">{order.client.name}</h3>
                            <Badge variant="outline">{translateStatus(order.status)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Commande #{order.id.slice(0, 8)} • {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatWeight(order.totalWeight)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleOrderDetails(order.id)}
                            className="p-1 h-8 w-8"
                          >
                            {expandedOrders[order.id] ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedOrders[order.id] && (
                      <CardContent className="px-4 py-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead>Conditionnement</TableHead>
                              <TableHead className="text-right">Quantité</TableHead>
                              <TableHead className="text-right">Poids unitaire</TableHead>
                              <TableHead className="text-right">Poids total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell>{item.product.packageType}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">
                                  {formatWeight(item.product.weightPerUnit * item.product.unitQuantity)}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatWeight(item.totalWeight)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={4} className="text-right font-bold">
                                Total
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                {formatWeight(order.totalWeight)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        
                        {order.notes && (
                          <div className="mt-4 p-3 bg-muted/20 rounded-md">
                            <h4 className="font-medium mb-1">Notes:</h4>
                            <p className="text-sm">{order.notes}</p>
                          </div>
                        )}
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Voir détails complets
                          </Button>
                        </div>
                      </CardContent>
                    )}
                    
                    <CardFooter className="px-4 py-2 bg-muted/10 flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} produit(s)
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Voir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette journée de découpe ? Les commandes associées ne seront pas supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteCuttingDay}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CuttingDayDetail;
