
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, PackagePlus, Check, Plus, Trash2 } from "lucide-react";
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatWeight } from '@/utils/calculations';

// Schéma de validation pour le formulaire de commande
const orderFormSchema = z.object({
  clientId: z.string({
    required_error: "Veuillez sélectionner un client",
  }),
  orderDate: z.date({
    required_error: "Veuillez sélectionner une date de commande",
  }),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "processing", "completed", "cancelled"], {
    required_error: "Veuillez sélectionner un statut",
  }),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const OrderCreate = () => {
  const navigate = useNavigate();
  const { clients, products, addOrder } = useApp();
  const [orderItems, setOrderItems] = useState<Array<{
    id: string;
    productId: string;
    quantity: number;
    notes?: string;
  }>>([]);
  const [totalWeight, setTotalWeight] = useState(0);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      orderDate: new Date(),
      status: "pending",
    },
  });

  // Calculer le poids total à chaque changement des éléments de commande
  useEffect(() => {
    let weight = 0;
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        weight += product.weightPerUnit * product.unitQuantity * item.quantity;
      }
    });
    setTotalWeight(weight);
  }, [orderItems, products]);

  // Générer un ID unique pour chaque élément de commande
  const generateItemId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Ajouter un nouvel élément de commande
  const handleAddItem = () => {
    if (products.length === 0) {
      toast.error("Aucun produit disponible. Veuillez d'abord ajouter des produits.");
      return;
    }
    
    setOrderItems([
      ...orderItems, 
      { 
        id: generateItemId(), 
        productId: products[0].id, 
        quantity: 1 
      }
    ]);
  };

  // Supprimer un élément de commande
  const handleRemoveItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Mettre à jour un élément de commande
  const handleItemChange = (itemId: string, field: string, value: string | number) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Soumettre le formulaire
  const onSubmit = (data: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la commande");
      return;
    }

    const selectedClient = clients.find(c => c.id === data.clientId);
    if (!selectedClient) {
      toast.error("Client invalide");
      return;
    }

    // Préparer les éléments de commande avec les données complètes du produit
    const items = orderItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        toast.error(`Produit introuvable pour l'élément de commande`);
        return null;
      }
      
      const totalItemWeight = product.weightPerUnit * product.unitQuantity * item.quantity;
      
      return {
        id: item.id,
        productId: item.productId,
        product: product,
        quantity: item.quantity,
        totalWeight: totalItemWeight,
        notes: item.notes
      };
    }).filter(Boolean);

    // Vérifier si tous les produits ont été trouvés
    if (items.includes(null)) {
      return;
    }

    // Créer la nouvelle commande
    const newOrder = {
      clientId: data.clientId,
      client: selectedClient,
      items: items as any,
      totalWeight: totalWeight,
      status: data.status,
      orderDate: data.orderDate,
      deliveryDate: data.deliveryDate,
      notes: data.notes,
    };

    // Ajouter la commande
    addOrder(newOrder);
    
    // Rediriger vers la liste des commandes
    navigate('/orders');
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouvelle commande</h1>
            <p className="text-muted-foreground">
              Créez une nouvelle commande en sélectionnant un client et des produits.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Retour aux commandes
          </Button>
        </div>

        <Separator className="my-6" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>
                    Entrez les informations de base de la commande
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client */}
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un client" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.length === 0 ? (
                              <SelectItem value="no-clients" disabled>
                                Aucun client disponible
                              </SelectItem>
                            ) : (
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date de commande */}
                  <FormField
                    control={form.control}
                    name="orderDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de commande</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date de livraison (optionnelle) */}
                  <FormField
                    control={form.control}
                    name="deliveryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de livraison (optionnelle)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Statut */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="processing">En traitement</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (optionnelles)</FormLabel>
                        <FormControl>
                          <Input placeholder="Notes supplémentaires..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Résumé de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                  <CardDescription>
                    Aperçu des produits sélectionnés et du total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-medium">Poids total</p>
                    <p className="text-2xl font-bold">{formatWeight(totalWeight)}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Nombre de produits</p>
                    <p className="text-2xl font-bold">{orderItems.length}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Button type="submit" className="w-full">
                      <Check className="mr-2 h-4 w-4" /> Enregistrer la commande
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Produits commandés */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div className="space-y-1">
                  <CardTitle>Produits commandés</CardTitle>
                  <CardDescription>
                    Ajoutez les produits que le client souhaite commander
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  onClick={handleAddItem}
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                </Button>
              </CardHeader>
              <CardContent>
                {orderItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <PackagePlus className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-lg font-medium">Aucun produit ajouté</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cliquez sur "Ajouter un produit" pour commencer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-center py-4 border-b last:border-0">
                        <div className="col-span-5">
                          <Label htmlFor={`product-${item.id}`}>Produit</Label>
                          <Select 
                            value={item.productId}
                            onValueChange={(value) => handleItemChange(item.id, 'productId', value)}
                          >
                            <SelectTrigger id={`product-${item.id}`}>
                              <SelectValue placeholder="Sélectionner un produit" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - {formatWeight(product.weightPerUnit * product.unitQuantity)} ({product.unitQuantity} {product.unitQuantity > 1 ? 'unités' : 'unité'})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="col-span-3">
                          <Label htmlFor={`quantity-${item.id}`}>Quantité</Label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        
                        <div className="col-span-3">
                          <Label htmlFor={`notes-${item.id}`}>Notes (optionnel)</Label>
                          <Input
                            id={`notes-${item.id}`}
                            type="text"
                            placeholder="Notes spécifiques..."
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                          />
                        </div>
                        
                        <div className="col-span-1 flex items-end justify-end h-full">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default OrderCreate;
