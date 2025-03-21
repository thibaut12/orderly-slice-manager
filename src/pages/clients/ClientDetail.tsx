
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Edit, Trash2, ArrowLeft, ShoppingBag, 
  MailIcon, PhoneIcon, Settings, Info
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from "sonner";
import { useClients } from '@/hooks/useClients';
import { useOrders } from '@/hooks/useOrders';
import { formatDate, formatWeight } from '@/utils/formatters';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { clients, getClientById, updateClient, deleteClient } = useClients();
  const { orders, getOrdersByClientId } = useOrders();
  const [clientOrders, setClientOrders] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cuttingPreferences: '',
    packagingPreferences: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (id) {
      const clientData = getClientById(id);
      if (clientData) {
        setClient(clientData);
        setFormData({
          name: clientData.name,
          email: clientData.email || '',
          phone: clientData.phone || '',
          cuttingPreferences: clientData.preferences.cuttingPreferences || '',
          packagingPreferences: clientData.preferences.packagingPreferences || '',
          specialRequests: clientData.preferences.specialRequests || '',
        });
        
        // Récupérer les commandes du client
        const clientOrders = getOrdersByClientId(id);
        setClientOrders(clientOrders);
      } else {
        // Client non trouvé, rediriger vers la liste
        navigate('/clients');
        toast.error("Client non trouvé");
      }
    }
  }, [id, clients, orders]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateClient = () => {
    if (!id || !formData.name.trim()) {
      toast.error("Le nom du client est obligatoire");
      return;
    }

    const updatedClient = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      preferences: {
        cuttingPreferences: formData.cuttingPreferences || undefined,
        packagingPreferences: formData.packagingPreferences || undefined,
        specialRequests: formData.specialRequests || undefined,
      },
    };

    updateClient(id, updatedClient);
    setIsEditDialogOpen(false);
    toast.success("Client mis à jour avec succès");
    
    // Mettre à jour l'état local
    setClient({ ...client, ...updatedClient });
  };

  const handleDeleteClient = () => {
    if (id) {
      deleteClient(id);
      navigate('/clients');
      toast.success("Client supprimé avec succès");
    }
  };

  // Si aucun client n'a été trouvé
  if (!client) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-8">
          <Info className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Client non trouvé</h1>
          <p className="text-muted-foreground mb-4">
            Le client que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/clients')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              <p className="text-muted-foreground">
                Ajouté le {formatDate(client.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations et préférences */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Avatar className="h-10 w-10 mr-4">
                    <AvatarFallback className="bg-primary/10">
                      {client.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.email && (
                  <div className="flex items-center">
                    <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {!client.email && !client.phone && (
                  <p className="text-muted-foreground">Aucune information de contact</p>
                )}

                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center mb-2">
                    <Settings className="h-4 w-4 mr-2" />
                    Préférences
                  </h3>
                  
                  {client.preferences.cuttingPreferences && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Préférences de découpe</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.preferences.cuttingPreferences}
                      </p>
                    </div>
                  )}
                  
                  {client.preferences.packagingPreferences && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Préférences d'emballage</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.preferences.packagingPreferences}
                      </p>
                    </div>
                  )}
                  
                  {client.preferences.specialRequests && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Demandes spéciales</h4>
                      <p className="text-sm text-muted-foreground">
                        {client.preferences.specialRequests}
                      </p>
                    </div>
                  )}
                  
                  {!client.preferences.cuttingPreferences && 
                   !client.preferences.packagingPreferences && 
                   !client.preferences.specialRequests && (
                    <p className="text-muted-foreground">Aucune préférence définie</p>
                  )}
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/orders/new?clientId=${client.id}`)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Nouvelle commande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historique des commandes */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Historique des commandes
                </CardTitle>
                <CardDescription>
                  {clientOrders.length} commande{clientOrders.length !== 1 ? 's' : ''} pour ce client
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Aucune commande</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ce client n'a pas encore passé de commande
                    </p>
                    <Button onClick={() => navigate(`/orders/new?clientId=${client.id}`)}>
                      Créer une commande
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientOrders.map(order => (
                      <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center p-4 border-b bg-muted/40">
                          <div>
                            <div className="font-medium">Commande du {formatDate(order.orderDate)}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.items.length} produit{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'cancelled' ? 'destructive' : 'outline'
                              }
                            >
                              {order.status === 'pending' ? 'En attente' :
                              order.status === 'confirmed' ? 'Confirmée' :
                              order.status === 'processing' ? 'En traitement' :
                              order.status === 'completed' ? 'Terminée' : 'Annulée'}
                            </Badge>
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/orders/${order.id}`)}
                            >
                              <ArrowLeft className="h-4 w-4 rotate-180" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-1">Poids total</h4>
                              <p>{formatWeight(order.totalWeight)}</p>
                            </div>
                            {order.deliveryDate && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Livraison prévue</h4>
                                <p>{formatDate(order.deliveryDate)}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Produits commandés</h4>
                            <ul className="space-y-1">
                              {order.items.map(item => (
                                <li key={item.id} className="text-sm flex justify-between">
                                  <span>{item.product.name}</span>
                                  <span className="text-muted-foreground">
                                    {item.quantity} × {formatWeight(item.product.weightPerUnit * item.product.unitQuantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-name">Nom <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <Separator className="my-2" />
              <h3 className="text-sm font-medium">Préférences</h3>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-cuttingPreferences">Préférences de découpe</Label>
                <Textarea
                  id="edit-cuttingPreferences"
                  name="cuttingPreferences"
                  value={formData.cuttingPreferences}
                  onChange={handleInputChange}
                  placeholder="Ex: Épaisseur moyenne, sans gras"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-packagingPreferences">Préférences d'emballage</Label>
                <Textarea
                  id="edit-packagingPreferences"
                  name="packagingPreferences"
                  value={formData.packagingPreferences}
                  onChange={handleInputChange}
                  placeholder="Ex: Sous-vide, emballages individuels"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-specialRequests">Demandes spéciales</Label>
                <Textarea
                  id="edit-specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Ex: Demandes particulières du client"
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdateClient}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et supprimera toutes ses informations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ClientDetail;
