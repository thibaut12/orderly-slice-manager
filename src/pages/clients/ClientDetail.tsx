
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClients } from '@/hooks/useClients';
import { useOrders } from '@/hooks/useOrders';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserCircle, Mail, Phone, Edit, Trash2, Package } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { Client, Order } from '@/types';

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clients, updateClient, deleteClient } = useClients();
  const { orders } = useOrders();
  const [client, setClient] = useState<Client | null>(null);
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Trouver le client par ID
      const foundClient = clients.find(c => c.id === id);
      setClient(foundClient || null);
      
      // Filtrer les commandes pour ce client
      const filteredOrders = orders.filter(order => order.clientId === id);
      setClientOrders(filteredOrders);
      
      setLoading(false);
    }
  }, [id, clients, orders]);

  const handleDelete = () => {
    if (client && window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      deleteClient(client.id);
      navigate('/clients');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>Client non trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">
              Détails du client et commandes associées
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/clients')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button variant="outline" onClick={() => navigate(`/clients/edit/${client.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5" /> Informations client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {client.email}
                    </p>
                  </div>
                )}
                
                {client.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="flex items-center">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      {client.phone}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p>{formatDate(client.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                  <p>{formatDate(client.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Préférences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {client.preferences.cuttingPreferences && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Préférences de découpe</p>
                    <p>{client.preferences.cuttingPreferences}</p>
                  </div>
                )}
                
                {client.preferences.packagingPreferences && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Préférences d'emballage</p>
                    <p>{client.preferences.packagingPreferences}</p>
                  </div>
                )}
                
                {client.preferences.specialRequests && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Demandes spéciales</p>
                    <p>{client.preferences.specialRequests}</p>
                  </div>
                )}
                
                {!client.preferences.cuttingPreferences && 
                 !client.preferences.packagingPreferences && 
                 !client.preferences.specialRequests && (
                  <p className="text-muted-foreground">Aucune préférence enregistrée</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" /> Commandes ({clientOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientOrders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Aucune commande pour ce client</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/orders/new', { state: { clientId: client.id } })}
                >
                  Créer une commande
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Commande #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.orderDate)} • {order.items.length} produit(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.totalWeight}g</p>
                        <p className={`text-sm ${
                          order.status === 'completed' ? 'text-green-500' : 
                          order.status === 'cancelled' ? 'text-red-500' :
                          order.status === 'pending' ? 'text-orange-500' : 
                          'text-blue-500'
                        }`}>
                          {order.status === 'pending' && 'En attente'}
                          {order.status === 'confirmed' && 'Confirmée'}
                          {order.status === 'processing' && 'En traitement'}
                          {order.status === 'completed' && 'Terminée'}
                          {order.status === 'cancelled' && 'Annulée'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClientDetail;
