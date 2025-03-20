
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, PackagePlus, Trash2, ShoppingBag, Search, Check } from "lucide-react";
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatWeight } from '@/utils/calculations';
import { Client, Product } from '@/types';
import CuttingDaySelect from '@/components/CuttingDaySelect';

const OrderTaking = () => {
  const navigate = useNavigate();
  const { clients, products, addOrder, cuttingDays } = useApp();
  
  // État local pour la prise de commande
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [cuttingDayId, setCuttingDayId] = useState<string>("");
  const [status, setStatus] = useState<string>("pending");
  const [notes, setNotes] = useState<string>("");
  const [orderItems, setOrderItems] = useState<Array<{
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    notes?: string;
  }>>([]);
  
  // État pour la recherche de produits
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  
  // Calculer le poids total
  const totalWeight = orderItems.reduce((sum, item) => {
    return sum + (item.product.weightPerUnit * item.product.unitQuantity * item.quantity);
  }, 0);

  // Filtrer les produits basé sur le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(lowercaseSearch)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Générer un ID unique pour chaque élément de commande
  const generateItemId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Ajouter un produit à la commande
  const addProductToOrder = (product: Product) => {
    // Vérifier si le produit existe déjà dans la commande
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Mettre à jour la quantité si le produit existe déjà
      setOrderItems(orderItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Ajouter le produit s'il n'existe pas encore
      setOrderItems([
        ...orderItems,
        {
          id: generateItemId(),
          productId: product.id,
          product: product,
          quantity: 1
        }
      ]);
    }
    
    toast.success(`${product.name} ajouté à la commande`);
  };

  // Mettre à jour la quantité d'un produit
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      ));
    }
  };

  // Supprimer un produit de la commande
  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  // Mettre à jour les notes d'un produit
  const updateItemNotes = (itemId: string, notes: string) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId 
        ? { ...item, notes } 
        : item
    ));
  };

  // Soumettre la commande
  const handleSubmitOrder = () => {
    if (!selectedClient) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à la commande");
      return;
    }

    const newOrder = {
      clientId: selectedClient.id,
      client: selectedClient,
      items: orderItems,
      totalWeight,
      status: status as "pending" | "confirmed" | "processing" | "completed" | "cancelled",
      orderDate,
      deliveryDate,
      notes: notes || undefined,
      cuttingDayId: cuttingDayId || undefined,
    };

    addOrder(newOrder);
    navigate('/orders');
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Prise de commande</h1>
            <p className="text-muted-foreground">
              Ajoutez rapidement des produits à la commande d'un client
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Retour aux commandes
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne 1: Informations de commande */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Informations de commande</CardTitle>
              <CardDescription>Sélectionnez un client et complétez les détails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sélection du client */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Client</label>
                <Select 
                  value={selectedClient?.id || ""}
                  onValueChange={(value) => {
                    const client = clients.find(c => c.id === value);
                    setSelectedClient(client || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
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
              </div>

              {/* Date de commande */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de commande</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !orderDate && "text-muted-foreground"
                      )}
                    >
                      {orderDate ? (
                        format(orderDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={orderDate}
                      onSelect={(date) => date && setOrderDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Journée de découpe */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Journée de découpe</label>
                <CuttingDaySelect
                  value={cuttingDayId}
                  onChange={setCuttingDayId}
                />
              </div>

              {/* Date de livraison */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date de livraison (optionnelle)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deliveryDate && "text-muted-foreground"
                      )}
                    >
                      {deliveryDate ? (
                        format(deliveryDate, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => setDeliveryDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select 
                  value={status}
                  onValueChange={setStatus}
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

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optionnelles)</label>
                <Input 
                  placeholder="Notes supplémentaires..." 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Résumé et validation */}
              <div className="pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Poids total:</span>
                  <span className="text-xl font-bold">{formatWeight(totalWeight)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Produits:</span>
                  <span className="text-xl font-bold">{orderItems.length}</span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSubmitOrder}
                  disabled={!selectedClient || orderItems.length === 0}
                >
                  <Check className="mr-2 h-4 w-4" /> Valider la commande
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Colonne 2: Catalogue de produits */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Catalogue de produits</CardTitle>
              <CardDescription>
                Recherchez et ajoutez des produits à la commande
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[360px] overflow-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <PackagePlus className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-lg font-medium">Aucun produit trouvé</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Essayez un autre terme de recherche
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => addProductToOrder(product)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-base">{product.name}</h3>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ShoppingBag className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product.unitQuantity} {product.unitQuantity > 1 ? 'unités' : 'unité'} 
                          &nbsp;&bull;&nbsp; 
                          {formatWeight(product.weightPerUnit * product.unitQuantity)}
                        </div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {product.packageType === 'sous-vide' ? 'Sous-vide' : 
                           product.packageType === 'en-vrac' ? 'En vrac' : 
                           product.packageType === 'autoclave' ? 'Autoclave' : 'Autre'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Colonne 3: Détails de la commande */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
              <CardDescription>Produits ajoutés à la commande actuelle</CardDescription>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <p className="text-lg font-medium">Aucun produit ajouté</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ajoutez des produits depuis le catalogue
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead>Poids total</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              <span className="sr-only">Diminuer</span>
                              <span>-</span>
                            </Button>
                            <span className="font-medium w-6 text-center">{item.quantity}</span>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <span className="sr-only">Augmenter</span>
                              <span>+</span>
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatWeight(item.product.weightPerUnit * item.product.unitQuantity * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Notes spécifiques..."
                            value={item.notes || ""}
                            onChange={(e) => updateItemNotes(item.id, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </Layout>
  );
};

export default OrderTaking;
