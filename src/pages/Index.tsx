
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Package, ShoppingCart, FileText, TrendingUp, 
  Clock, CheckCircle, AlertCircle 
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import { formatWeight } from '@/utils/calculations';

const Index = () => {
  const navigate = useNavigate();
  const { clients, products, orders } = useApp();
  const [animate, setAnimate] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Calculate dashboard stats
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalOrderWeight = orders.reduce((sum, order) => sum + order.totalWeight, 0);
  const latestOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);
  
  return (
    <Layout>
      <div className={`transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre gestionnaire de commandes.
            </p>
          </div>
          
          <Separator />
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Clients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/clients')}>
                  Gérer les clients
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Produits
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/products')}>
                  Gérer les produits
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/orders')}>
                  Gérer les commandes
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Poids total
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatWeight(totalOrderWeight)}</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/summary')}>
                  Voir la synthèse
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="card-hover border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">commandes à traiter</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Confirmées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'confirmed').length}
                </div>
                <p className="text-xs text-muted-foreground">commandes confirmées</p>
              </CardContent>
            </Card>
            
            <Card className="card-hover border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Terminées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">commandes terminées</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-semibold">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-24 card-hover button-effect" 
                onClick={() => navigate('/orders/new')}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Nouvelle commande
              </Button>
              <Button 
                variant="outline" 
                className="h-24 card-hover button-effect"
                onClick={() => navigate('/clients/new')}
              >
                <Users className="mr-2 h-5 w-5" />
                Ajouter un client
              </Button>
              <Button 
                variant="outline" 
                className="h-24 card-hover button-effect"
                onClick={() => navigate('/products/new')}
              >
                <Package className="mr-2 h-5 w-5" />
                Ajouter un produit
              </Button>
            </div>
          </div>
          
          {/* Latest Orders */}
          {latestOrders.length > 0 && (
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold">Dernières commandes</h2>
              <div className="grid grid-cols-1 gap-4">
                {latestOrders.map((order) => (
                  <Card key={order.id} className="card-hover">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div>
                        <CardTitle>{order.client.name}</CardTitle>
                        <CardDescription>
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'processing' ? 'En traitement' :
                         order.status === 'completed' ? 'Terminée' :
                         'Annulée'}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        {order.items.length} produit{order.items.length > 1 ? 's' : ''} · 
                        {formatWeight(order.totalWeight)}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        Voir les détails
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/orders')}
                >
                  Voir toutes les commandes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
