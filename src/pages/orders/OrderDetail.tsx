
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { ArrowLeft, FileText, Package, Calendar, User, Edit, Trash2, Save, X, Plus, Search } from "lucide-react";
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useOrders } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose, DialogTrigger
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate, formatWeight, getStatusColor, translateStatus } from '@/utils/calculations';
import { Order, OrderItem, Product } from '@/types';
import { toast } from "sonner";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, clients, products, updateOrder, deleteOrder } = useApp();
  const { createOrderItem, calculateOrderTotalWeight } = useOrders();
  const { filterProducts } = useProducts();
  const [order, setOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Edit form state
  const [editedStatus, setEditedStatus] = useState<"pending" | "confirmed" | "processing" | "completed" | "cancelled">('pending');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedDeliveryDate, setEditedDeliveryDate] = useState('');
  const [editedItems, setEditedItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id);
      setOrder(foundOrder || null);
      
      if (foundOrder) {
        setEditedStatus(foundOrder.status);
        setEditedNotes(foundOrder.notes || '');
        setEditedDeliveryDate(foundOrder.deliveryDate ? format(new Date(foundOrder.deliveryDate), 'yyyy-MM-dd') : '');
        setEditedItems([...foundOrder.items]);
      }
    }
  }, [id, orders]);

  // Filtrer les produits lorsque le terme de recherche change
  useEffect(() => {
    setFilteredProducts(filterProducts(productSearchTerm));
  }, [productSearchTerm, filterProducts]);

  const handleDeleteOrder = () => {
    if (order) {
      deleteOrder(order.id);
      navigate('/orders');
      toast.success("Commande supprimée avec succès");
    }
  };

  const handleSaveChanges = () => {
    if (!order) return;

    // Calculer le nouveau poids total
    const totalWeight = calculateOrderTotalWeight(editedItems);

    const updatedOrder: Partial<Order> = {
      status: editedStatus,
      notes: editedNotes,
      items: editedItems,
      totalWeight, // Ajouter le poids total mis à jour
    };

    if (editedDeliveryDate) {
      updatedOrder.deliveryDate = new Date(editedDeliveryDate);
    }

    updateOrder(order.id, updatedOrder);
    setIsEditing(false);
    toast.success("Commande mise à jour avec succès");
  };

  const handleCancelEdit = () => {
    if (order) {
      // Reset form to original values
      setEditedStatus(order.status);
      setEditedNotes(order.notes || '');
      setEditedDeliveryDate(order.deliveryDate ? format(new Date(order.deliveryDate), 'yyyy-MM-dd') : '');
      setEditedItems([...order.items]);
    }
    setIsEditing(false);
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return; // Empêcher les quantités négatives ou nulles
    
    const updatedItems = editedItems.map(item => {
      if (item.id === itemId) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const unitWeight = product.weightPerUnit * product.unitQuantity;
          return {
            ...item,
            quantity: newQuantity,
            totalWeight: unitWeight * newQuantity
          };
        }
      }
      return item;
    });
    setEditedItems(updatedItems);
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setEditedItems(editedItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setEditedItems(editedItems.filter(item => item.id !== itemId));
    toast.success("Produit retiré de la commande");
  };

  const addProductToOrder = (product: Product) => {
    // Vérifier si le produit est déjà dans la commande
    const existingItem = editedItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Si le produit existe déjà, augmenter la quantité
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
      toast.success(`Quantité de ${product.name} augmentée`);
    } else {
      // Sinon, ajouter un nouvel élément
      const newItem = createOrderItem(product, 1);
      setEditedItems([...editedItems, newItem]);
      toast.success(`${product.name} ajouté à la commande`);
    }
    
    setShowAddProductDialog(false);
    setProductSearchTerm('');
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
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" /> Annuler
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" /> Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {isEditing ? (
          <div className="space-y-6">
            {/* Edit Status and Delivery Date */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select 
                      value={editedStatus} 
                      onValueChange={(value: "pending" | "confirmed" | "processing" | "completed" | "cancelled") => setEditedStatus(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="processing">En traitement</SelectItem>
                        <SelectItem value="completed">Terminée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Date de livraison</Label>
                    <Input 
                      id="deliveryDate"
                      type="date"
                      value={editedDeliveryDate}
                      onChange={(e) => setEditedDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Notes additionnelles sur la commande..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Edit Items */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Produits commandés</CardTitle>
                    <CardDescription>Modifier les produits, quantités et notes</CardDescription>
                  </div>
                  <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Ajouter un produit</DialogTitle>
                        <DialogDescription>
                          Recherchez et sélectionnez un produit à ajouter à la commande.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="relative my-2">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher un produit..."
                          className="pl-8"
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <ScrollArea className="mt-2 h-[350px] rounded border p-2">
                        {filteredProducts.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            Aucun produit trouvé.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-2 rounded hover:bg-secondary cursor-pointer"
                                onClick={() => addProductToOrder(product)}
                              >
                                <div>
                                  <h4 className="font-medium">{product.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {product.packageType} - {formatWeight(product.weightPerUnit * product.unitQuantity)}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                          Annuler
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Conditionnement</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Poids total</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Aucun produit dans cette commande. Cliquez sur "Ajouter un produit" pour commencer.
                        </TableCell>
                      </TableRow>
                    ) : (
                      editedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product.name}</TableCell>
                          <TableCell>{item.product.packageType}</TableCell>
                          <TableCell className="text-right">
                            <Input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                              min="1"
                              className="w-20 ml-auto"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={item.notes || ''}
                              onChange={(e) => updateItemNotes(item.id, e.target.value)}
                              placeholder="Notes sur ce produit..."
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatWeight(item.totalWeight)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {editedItems.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatWeight(calculateOrderTotalWeight(editedItems))}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Display Mode - Regular detail view */}
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
          </>
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
