
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeft, FileText, Package, Calendar, User, Edit, Trash2 } from "lucide-react";
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatWeight, getStatusColor, translateStatus } from '@/utils/calculations';
import { Order } from '@/types';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, deleteOrder } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id);
      setOrder(foundOrder || null);
    }
  }, [id, orders]);

  const handleDeleteOrder = () => {
    if (order) {
      deleteOrder(order.id);
      navigate('/orders');
    }
  };

  if (!order) {
    return (
      <Layout>
        <div className="animate-fade-in p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Commande non trouvée</h1>
          <p className="mb-6 text-muted-foreground">
            La commande que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Détails de la commande</h1>
              <Badge className={getStatusColor(order.status)}>
                {translateStatus(order.status)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Commande #{order.id.slice(0, 8)} pour {order.client.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/orders')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button 
              variant="outline" 
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
            <Button onClick={() => navigate(`/orders/edit/${order.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Client */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Client</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{order.client.name}</div>
              {order.client.email && 
                <p className="text-sm text-muted-foreground">{order.client.email}</p>
              }
              {order.client.phone && 
                <p className="text-sm text-muted-foreground">{order.client.phone}</p>
              }
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Commande:</span>
                  <span className="font-medium">{formatDate(order.orderDate)}</span>
                </div>
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Livraison:</span>
                    <span className="font-medium">{formatDate(order.deliveryDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Création:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Résumé */}
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Résumé</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Produits:</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Poids total:</span>
                  <span className="font-medium">{formatWeight(order.totalWeight)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {order.notes && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Produits commandés */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <CardTitle>Produits commandés</CardTitle>
            </div>
            <CardDescription>
              Liste des produits dans cette commande
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {order.items.map((item) => (
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
          </CardContent>
          {order.items.some(item => item.notes) && (
            <CardFooter className="border-t px-6 py-4">
              <div className="space-y-2 w-full">
                <h4 className="font-medium">Notes sur les produits</h4>
                {order.items.filter(item => item.notes).map(item => (
                  <div key={`note-${item.id}`} className="flex flex-col text-sm">
                    <span className="font-medium">{item.product.name}:</span>
                    <span className="text-muted-foreground">{item.notes}</span>
                  </div>
                ))}
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Préférences client */}
        {(order.client.preferences.cuttingPreferences || 
          order.client.preferences.packagingPreferences || 
          order.client.preferences.specialRequests) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Préférences du client</CardTitle>
              <CardDescription>
                Préférences spécifiques du client pour le traitement de ses commandes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.client.preferences.cuttingPreferences && (
                <div>
                  <h4 className="font-medium mb-1">Préférences de découpe</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.client.preferences.cuttingPreferences}
                  </p>
                </div>
              )}
              
              {order.client.preferences.packagingPreferences && (
                <div>
                  <h4 className="font-medium mb-1">Préférences d'emballage</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.client.preferences.packagingPreferences}
                  </p>
                </div>
              )}
              
              {order.client.preferences.specialRequests && (
                <div>
                  <h4 className="font-medium mb-1">Demandes spéciales</h4>
                  <p className="text-sm text-muted-foreground">
                    {order.client.preferences.specialRequests}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteOrder}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default OrderDetail;
