import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Package, X, Plus, User, CalendarDays } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Client, Product } from '@/types';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { products } = useProducts();
  const { addOrder } = useOrders();
  const { cuttingDays } = useCuttingDays();

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [cuttingDayId, setCuttingDayId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('pending');
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    product: Product;
    quantity: number;
  }>>([]);

  const calculateTotalWeight = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.weightPerUnit * item.product.unitQuantity * item.quantity);
    }, 0);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingProductIndex = selectedProducts.findIndex(item => item.productId === productId);
    
    if (existingProductIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].quantity += 1;
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        {
          productId,
          product,
          quantity: 1
        }
      ]);
    }
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter(item => item.productId !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      ));
    }
  };

  const handleSubmit = () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (selectedProducts.length === 0) {
      toast.error("Veuillez ajouter au moins un produit");
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      toast.error("Client invalide");
      return;
    }

    const items = selectedProducts.map(item => {
      return {
        id: Math.random().toString(36).substring(2, 11),
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        totalWeight: item.product.weightPerUnit * item.product.unitQuantity * item.quantity
      };
    });

    const totalWeight = calculateTotalWeight();

    const newOrder = {
      clientId: selectedClient,
      client,
      items,
      totalWeight,
      status: status as "pending" | "confirmed" | "processing" | "completed" | "cancelled",
      orderDate,
      deliveryDate,
      notes: notes || undefined,
      cuttingDayId: cuttingDayId || undefined,
    };

    addOrder(newOrder);
    onOpenChange(false);
    toast.success("Commande créée avec succès");
    navigate('/orders');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Package className="mr-2 h-5 w-5" /> Créer une nouvelle commande
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto mt-4">
          <ScrollArea className="h-[calc(80vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger id="client">
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="orderDate">Date de commande</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="orderDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !orderDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {orderDate ? format(orderDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={orderDate}
                        onSelect={(date) => date && setOrderDate(date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="deliveryDate">Date de livraison (optionelle)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="deliveryDate"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="cuttingDay">Journée de découpe</Label>
                  <Select value={cuttingDayId} onValueChange={setCuttingDayId}>
                    <SelectTrigger id="cuttingDay">
                      <SelectValue placeholder="Sélectionner une journée (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune journée sélectionnée</SelectItem>
                      {cuttingDays.map(day => (
                        <SelectItem key={day.id} value={day.id}>
                          {format(new Date(day.date), 'PPP', { locale: fr })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
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
                
                <div>
                  <Label htmlFor="notes">Notes (optionnelles)</Label>
                  <Input
                    id="notes"
                    placeholder="Notes sur la commande..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Résumé</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Produits:</span>
                      <span className="font-medium">{selectedProducts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantité totale:</span>
                      <span className="font-medium">
                        {selectedProducts.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poids total:</span>
                      <span className="font-medium">
                        {calculateTotalWeight()} g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <Label>Produits sélectionnés</Label>
                  {selectedProducts.length === 0 ? (
                    <div className="mt-2 border rounded-lg p-4 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun produit sélectionné</p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {selectedProducts.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.product.weightPerUnit * item.product.unitQuantity * item.quantity} g
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                            >
                              <span>-</span>
                            </Button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                            >
                              <span>+</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => updateProductQuantity(item.productId, 0)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <Label>Ajouter des produits</Label>
                  <div className="mt-2 grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {products.map((product) => (
                      <div 
                        key={product.id} 
                        className="border rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleProductSelect(product.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.unitQuantity} unité(s) • {product.weightPerUnit * product.unitQuantity} g
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter className="border-t pt-4 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedClient || selectedProducts.length === 0}
          >
            Créer la commande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;
