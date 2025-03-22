
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Clipboard, ShoppingBag, Edit, Trash2 } from 'lucide-react';
import { formatDate, formatWeight } from '@/utils/formatters';
import { Product, Order, OrderItem } from '@/types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, updateProduct, deleteProduct } = useProducts();
  const { orders } = useOrders();
  const [product, setProduct] = useState<Product | null>(null);
  const [productOrders, setProductOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Trouver le produit par ID
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
      
      // Filtrer les commandes contenant ce produit
      const ordersWithProduct = orders.filter(order => 
        order.items.some(item => item.productId === id)
      );
      setProductOrders(ordersWithProduct);
      
      setLoading(false);
    }
  }, [id, products, orders]);

  const handleDelete = () => {
    if (product && window.confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
      deleteProduct(product.id);
      navigate('/products');
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

  if (!product) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>Produit non trouvé</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              Détails du produit et commandes associées
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button variant="outline" onClick={() => navigate(`/products/edit/${product.id}`)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" /> Informations produit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantité par unité</p>
                  <p>{product.unitQuantity} unité(s)</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids par unité</p>
                  <p>{product.weightPerUnit} {product.weightUnit}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids total par paquet</p>
                  <p>{formatWeight(product.weightPerUnit * product.unitQuantity)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type d'emballage</p>
                  <p>
                    {product.packageType === 'sous-vide' && 'Sous-vide'}
                    {product.packageType === 'en-vrac' && 'En vrac'}
                    {product.packageType === 'autoclave' && 'Autoclave'}
                    {product.packageType === 'autre' && 'Autre'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p>{formatDate(product.createdAt)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                  <p>{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clipboard className="mr-2 h-5 w-5" /> Résumé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes totales</p>
                  <p className="text-2xl font-bold">{productOrders.length}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantité totale vendue</p>
                  <p className="text-2xl font-bold">
                    {productOrders.reduce((total, order) => {
                      const item = order.items.find(i => i.productId === product.id);
                      return total + (item ? item.quantity : 0);
                    }, 0)} unités
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids total vendu</p>
                  <p className="text-2xl font-bold">
                    {formatWeight(productOrders.reduce((total, order) => {
                      const item = order.items.find(i => i.productId === product.id);
                      return total + (item ? (item.quantity * product.weightPerUnit * product.unitQuantity) : 0);
                    }, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" /> Commandes contenant ce produit ({productOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productOrders.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Aucune commande avec ce produit</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/orders/new')}
                >
                  Créer une commande
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {productOrders.map((order) => {
                  const item = order.items.find(i => i.productId === product.id);
                  if (!item) return null;
                  
                  return (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)}>
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            Client: {order.client.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.orderDate)} • Quantité: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatWeight(item.quantity * product.weightPerUnit * product.unitQuantity)}
                          </p>
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
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductDetail;
