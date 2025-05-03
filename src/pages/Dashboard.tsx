
import React from 'react';
import Layout from '@/components/layout/Layout';
import { 
  Users, Package, ShoppingCart, FileText, TrendingUp, 
  Clock, CheckCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/users/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="transition-all duration-700 opacity-100">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue {user?.username || 'Utilisateur'} dans votre gestionnaire de commandes.
            </p>
          </div>
          
          <Separator />
          
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Clients
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/clients')}>
                  Gérer les clients
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Produits
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/products')}>
                  Gérer les produits
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/orders')}>
                  Gérer les commandes
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Poids total
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 kg</div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/summary')}>
                  Voir la synthèse
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-col space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Actions rapides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-24 hover:shadow-md transition-all"
                onClick={() => navigate('/orders/new')}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Nouvelle commande
              </Button>
              <Button 
                variant="outline" 
                className="h-24 hover:shadow-md transition-all"
                onClick={() => navigate('/clients')}
              >
                <Users className="mr-2 h-5 w-5" />
                Gérer les clients
              </Button>
              <Button 
                variant="outline" 
                className="h-24 hover:shadow-md transition-all"
                onClick={() => navigate('/products')}
              >
                <Package className="mr-2 h-5 w-5" />
                Gérer les produits
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
