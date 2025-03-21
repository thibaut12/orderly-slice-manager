
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // We'll implement this properly later
    // This is just a placeholder
  }, [id, orders]);

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de la commande</h1>
            <p className="text-muted-foreground">
              Détails de la commande #{id?.slice(0, 8)}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Page en cours de développement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cette page est en cours de construction. Revenez bientôt pour voir les détails des commandes.
            </p>
            <Button onClick={() => navigate('/orders')}>
              Retour à la liste des commandes
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderDetail;
