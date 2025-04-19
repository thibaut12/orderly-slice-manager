
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { useClients } from '@/hooks/useClients';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const OrderCreate = () => {
  const navigate = useNavigate();
  const { addOrder } = useApp();
  const { clients } = useClients();
  const { products } = useProducts();

  // Fonction pour vérifier que l'ajout de commande fonctionne
  const testOrderCreation = () => {
    if (clients.length === 0 || products.length === 0) {
      toast.error("Impossible de créer une commande test : pas de clients ou de produits disponibles");
      return;
    }
    
    const testClient = clients[0];
    const testProduct = products[0];
    
    const testOrder = {
      clientId: testClient.id,
      client: testClient,
      items: [{
        id: Math.random().toString(36).substring(2, 11),
        productId: testProduct.id,
        product: testProduct,
        quantity: 1,
        totalWeight: testProduct.weightPerUnit * testProduct.unitQuantity
      }],
      totalWeight: testProduct.weightPerUnit * testProduct.unitQuantity,
      status: "pending" as const,
      orderDate: new Date(),
    };
    
    addOrder(testOrder);
    toast.success("Commande test créée avec succès");
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux commandes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire de commande</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Vous pouvez créer une nouvelle commande via la page principale des commandes,
              en cliquant sur le bouton "+" en haut à droite, ou utiliser l'interface de prise
              de commande rapide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => navigate('/order-taking')}>
                Aller à la prise de commande rapide
              </Button>
              <Button variant="outline" onClick={() => navigate('/orders')}>
                Retour à la liste des commandes
              </Button>
              <Button variant="secondary" onClick={testOrderCreation}>
                Tester la création de commande
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderCreate;
