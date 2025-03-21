
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const OrderCreate = () => {
  const navigate = useNavigate();
  const { clients } = useClients();
  const { products } = useProducts();
  const { addOrder } = useOrders();

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
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire en cours de développement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cette page est en cours de construction. Revenez bientôt pour créer des commandes.
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

export default OrderCreate;
