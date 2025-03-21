
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Info, Package, 
  FileText, Printer, Download, Edit, Trash2 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { formatDate, formatWeight, translateStatus } from '@/utils/formatters';

const CuttingDayDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cuttingDays, deleteCuttingDay } = useCuttingDays();
  const { orders } = useOrders();
  const [cuttingDay, setCuttingDay] = useState<any | null>(null);
  const [relatedOrders, setRelatedOrders] = useState<any[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
        <div className="flex gap-2 mb-6">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exporter en PDF
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date de commande</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Poids</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.client.name}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{order.items.length} produit(s)</TableCell>
                      <TableCell>
                        <Badge variant="outline">{translateStatus(order.status)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatWeight(order.totalWeight)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
