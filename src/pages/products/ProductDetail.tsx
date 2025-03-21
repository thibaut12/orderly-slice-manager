
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Edit, Trash2, ArrowLeft, Package, 
  ShoppingBag, Scale, Layers, Info
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { formatDate, formatWeight } from '@/utils/formatters';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { products, getProductById, updateProduct, deleteProduct } = useProducts();
  const { orders, getOrdersWithProduct } = useOrders();
  const [productOrders, setProductOrders] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    unitQuantity: 1,
    weightPerUnit: 100,
    weightUnit: 'g',
    packageType: 'sous-vide',
  });

  useEffect(() => {
    if (id) {
      const productData = getProductById(id);
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          unitQuantity: productData.unitQuantity,
          weightPerUnit: productData.weightPerUnit,
          weightUnit: productData.weightUnit,
          packageType: productData.packageType,
        });
        
        // Récupérer les commandes qui contiennent ce produit
        const ordersWithProduct = getOrdersWithProduct(id);
        setProductOrders(ordersWithProduct);
      } else {
        // Produit non trouvé, rediriger vers la liste
        navigate('/products');
        toast.error("Produit non trouvé");
      }
    }
  }, [id, products, orders]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) || 0 });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProduct = () => {
    if (!id || !formData.name.trim()) {
      toast.error("Le nom du produit est obligatoire");
      return;
    }

    if (formData.unitQuantity <= 0) {
      toast.error("La quantité doit être supérieure à 0");
      return;
    }

    if (formData.weightPerUnit <= 0) {
      toast.error("Le poids doit être supérieur à 0");
      return;
    }

    const updatedProduct = {
      name: formData.name,
      unitQuantity: formData.unitQuantity,
      weightPerUnit: formData.weightPerUnit,
      weightUnit: formData.weightUnit as 'g' | 'kg',
      packageType: formData.packageType as 'sous-vide' | 'en-vrac' | 'autoclave' | 'autre',
    };

    updateProduct(id, updatedProduct);
    setIsEditDialogOpen(false);
    toast.success("Produit mis à jour avec succès");
    
    // Mettre à jour l'état local
    setProduct({ ...product, ...updatedProduct });
  };

  const handleDeleteProduct = () => {
    if (id) {
      // Vérifier si le produit est utilisé dans des commandes
      if (productOrders.length > 0) {
        toast.error("Ce produit est utilisé dans des commandes existantes et ne peut pas être supprimé");
        return;
      }
      
      deleteProduct(id);
      navigate('/products');
      toast.success("Produit supprimé avec succès");
    }
  };
  
  // Fonction pour traduire le type d'emballage
  const translatePackageType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'sous-vide': 'Sous vide',
      'en-vrac': 'En vrac',
      'autoclave': 'Autoclave',
      'autre': 'Autre'
    };
    return typeMap[type] || type;
  };

  // Si aucun produit n'a été trouvé
  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-8">
          <Info className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Produit non trouvé</h1>
          <p className="text-muted-foreground mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/products')}>
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
              onClick={() => navigate('/products')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <p className="text-muted-foreground">
                Ajouté le {formatDate(product.createdAt)}
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
              disabled={productOrders.length > 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations du produit */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Informations du produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Quantité par unité</h3>
                    <div className="flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{product.unitQuantity} unité{product.unitQuantity > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Poids par unité</h3>
                    <div className="flex items-center">
                      <Scale className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{product.weightPerUnit} {product.weightUnit}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Type d'emballage</h3>
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{translatePackageType(product.packageType)}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Poids total par paquet</h3>
                  <div className="font-medium text-lg">
                    {formatWeight(product.unitQuantity * product.weightPerUnit * (product.weightUnit === 'kg' ? 1000 : 1))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Utilisé dans les commandes</h3>
                  <div className="flex items-center">
                    <ShoppingBag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {productOrders.length} commande{productOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commandes utilisant ce produit */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Commandes utilisant ce produit
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Aucune commande</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ce produit n'est pas encore utilisé dans des commandes
                    </p>
                    <Button onClick={() => navigate('/orders/new')}>
                      Créer une commande
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productOrders.map(order => (
                      <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center p-4 border-b bg-muted/40">
                          <div>
                            <div className="font-medium">{order.client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Commande du {formatDate(order.orderDate)}
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
                          {order.items.filter(item => item.productId === product.id).map(item => (
                            <div key={item.id} className="border-l-2 border-primary pl-4 py-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.quantity} × {formatWeight(product.weightPerUnit * product.unitQuantity * (product.weightUnit === 'kg' ? 1000 : 1))}
                                  </div>
                                </div>
                                <div className="font-medium">
                                  {formatWeight(item.totalWeight)}
                                </div>
                              </div>
                              {item.notes && (
                                <div className="mt-2 text-sm bg-muted p-2 rounded">
                                  <span className="font-medium">Notes:</span> {item.notes}
                                </div>
                              )}
                            </div>
                          ))}
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

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier un produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit.
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
                  placeholder="Ex: Steak haché"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-unitQuantity">Quantité par unité <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-unitQuantity"
                  name="unitQuantity"
                  value={formData.unitQuantity}
                  onChange={handleNumberInputChange}
                  type="number"
                  min="1"
                  placeholder="Ex: 4 (pour 4 steaks par paquet)"
                />
                <p className="text-xs text-muted-foreground">
                  Nombre d'unités/pièces dans l'emballage (ex: 4 steaks par paquet)
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-weightPerUnit">Poids par unité <span className="text-destructive">*</span></Label>
                  <Input
                    id="edit-weightPerUnit"
                    name="weightPerUnit"
                    value={formData.weightPerUnit}
                    onChange={handleNumberInputChange}
                    type="number"
                    min="1"
                    placeholder="Ex: 150"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-weightUnit">Unité de poids</Label>
                  <Select
                    value={formData.weightUnit}
                    onValueChange={(value) => handleSelectChange('weightUnit', value)}
                  >
                    <SelectTrigger id="edit-weightUnit">
                      <SelectValue placeholder="Unité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Grammes (g)</SelectItem>
                      <SelectItem value="kg">Kilogrammes (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-packageType">Type d'emballage</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value) => handleSelectChange('packageType', value)}
                >
                  <SelectTrigger id="edit-packageType">
                    <SelectValue placeholder="Type d'emballage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sous-vide">Sous vide</SelectItem>
                    <SelectItem value="en-vrac">En vrac</SelectItem>
                    <SelectItem value="autoclave">Autoclave</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdateProduct}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {productOrders.length > 0 ? (
                "Ce produit ne peut pas être supprimé car il est utilisé dans des commandes existantes."
              ) : (
                "Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
              )}
            </DialogDescription>
          </DialogHeader>
          {productOrders.length === 0 && (
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Supprimer
              </Button>
            </DialogFooter>
          )}
          {productOrders.length > 0 && (
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button>Fermer</Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
