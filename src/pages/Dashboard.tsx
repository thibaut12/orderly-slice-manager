
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Package, ShoppingBag, Scissors, 
  FileText, TrendingUp, Calendar, CheckCircle,
  PlusCircle, Search
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { formatWeight, formatDate, translateStatus } from '@/utils/formatters';

const Dashboard = () => {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { products } = useProducts();
  const { orders } = useOrders();
  const { cuttingDays } = useCuttingDays();
  const [animate, setAnimate] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    setAnimate(true);
  }, []);

  // Calculate dashboard stats
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmOrder = orders.filter(o => o.status === 'confirmed').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalOrderWeight = orders.reduce((sum, order) => sum + order.totalWeight, 0);
  
  // Get recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3);
  
  // Get upcoming cutting days
  const upcomingCuttingDays = [...cuttingDays]
    .filter(day => new Date(day.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);
  
  return (
    <Layout>
      <div className={`transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue dans votre gestionnaire de commandes et de découpe.
            </p>
          </div>
          
          <Separator />
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
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
            
            <Card className="hover:shadow-md transition-shadow">
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
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
            
            <Card className="hover:shadow-md transition-shadow">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-yellow-500" />
                  En attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">commandes à traiter</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                  Confirmées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmOrder}</div>
                <p className="text-xs text-muted-foreground">commandes confirmées</p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Terminées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
                <p className="text-xs text-muted-foreground">commandes terminées</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold">Actions rapides</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  className="h-20 justify-start px-4"
                  onClick={() => navigate('/orders/new')}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Nouvelle commande
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 justify-start px-4"
                  onClick={() => navigate('/summary')}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Voir la synthèse
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 justify-start px-4"
                  onClick={() => navigate('/clients')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Gérer les clients
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 justify-start px-4"
                  onClick={() => navigate('/cutting-days')}
                >
                  <Scissors className="mr-2 h-5 w-5" />
                  Journées de découpe
                </Button>
              </div>

              {/* Upcoming Cutting Days */}
              {upcomingCuttingDays.length > 0 && (
                <>
                  <h2 className="text-xl font-semibold pt-2">Prochaines journées de découpe</h2>
                  <div className="space-y-3">
                    {upcomingCuttingDays.map((day) => (
                      <Card key={day.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{formatDate(day.date)}</CardTitle>
                          <CardDescription>
                            {day.orderCount} commande{day.orderCount !== 1 ? 's' : ''} • {formatWeight(day.totalWeight)}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="pt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => navigate(`/cutting-days/${day.id}`)}
                          >
                            Voir les détails
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                    
                    {upcomingCuttingDays.length === 0 && (
                      <Card className="bg-muted/40">
                        <CardContent className="pt-6 text-center">
                          <p className="text-muted-foreground">Aucune journée de découpe à venir</p>
                          <Button 
                            variant="link" 
                            className="mt-2"
                            onClick={() => navigate('/cutting-days')}
                          >
                            Planifier une journée
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Recent Orders */}
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Commandes récentes</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1"
                  onClick={() => navigate('/orders')}
                >
                  <Search className="h-4 w-4" />
                  Toutes les commandes
                </Button>
              </div>
              
              {recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{order.client.name}</CardTitle>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {translateStatus(order.status)}
                          </div>
                        </div>
                        <CardDescription>{formatDate(order.orderDate)}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm">
                          {order.items.length} produit{order.items.length !== 1 ? 's' : ''} • {formatWeight(order.totalWeight)}
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
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">Aucune commande récente</p>
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => navigate('/orders/new')}
                    >
                      Créer une commande
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
