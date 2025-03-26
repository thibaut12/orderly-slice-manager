import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductions } from '@/hooks/useProductions';
import { useProducts } from '@/hooks/useProducts';
import { Production, Ingredient, Product } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { 
  FlaskConical, Package, Calendar, Thermometer, Plus, X, Check, ArrowLeft,
  Download, FileText
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportProductionToPDF } from '@/utils/pdfExport';

const ProductionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { productions, addProduction, updateProduction } = useProductions();
  const { products } = useProducts();
  
  // État local pour les ingrédients temporaires
  const [tempIngredient, setTempIngredient] = useState<Partial<Ingredient>>({
    name: '',
    lotNumber: '',
    quantity: 0,
    unit: 'g'
  });
  
  // Dialog state
  const [showIngredientDialog, setShowIngredientDialog] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState<Partial<Production>>({
    productId: '',
    product: undefined,
    batchNumber: '',
    productionDate: new Date(),
    ingredients: [],
    autoclaveNumber: '',
    temperature: undefined,
    duration: undefined,
    quantityProduced: 0,
    stoveTest: 'en-attente',
    notes: ''
  });
  
  // Charger les données si c'est une modification
  useEffect(() => {
    if (!isNew && id) {
      const production = productions.find(p => p.id === id);
      if (production) {
        setFormData(production);
      } else {
        toast.error("Production non trouvée");
        navigate('/productions');
      }
    }
  }, [isNew, id, productions, navigate]);
  
  // Mettre à jour le produit sélectionné
  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find(p => p.id === formData.productId);
      if (selectedProduct) {
        setFormData(prev => ({ ...prev, product: selectedProduct }));
      }
    }
  }, [formData.productId, products]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: new Date(value) }));
  };
  
  const handleTempIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempIngredient(prev => ({ ...prev, [name]: name === 'quantity' ? Number(value) : value }));
  };
  
  const addIngredient = () => {
    if (!tempIngredient.name || !tempIngredient.lotNumber || tempIngredient.quantity <= 0) {
      toast.error("Veuillez remplir tous les champs de l'ingrédient");
      return;
    }
    
    const newIngredient: Ingredient = {
      id: uuidv4(),
      name: tempIngredient.name || '',
      lotNumber: tempIngredient.lotNumber || '',
      quantity: tempIngredient.quantity || 0,
      unit: tempIngredient.unit as 'g' | 'kg' | 'l' | 'ml' | 'unité',
    };
    
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient]
    }));
    
    // Réinitialiser l'ingrédient temporaire
    setTempIngredient({
      name: '',
      lotNumber: '',
      quantity: 0,
      unit: 'g'
    });
    
    setShowIngredientDialog(false);
  };
  
  const removeIngredient = (ingredientId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter(ingredient => ingredient.id !== ingredientId)
    }));
  };
  
  const handleStoveTestChange = (value: 'validé' | 'non-validé' | 'en-attente') => {
    setFormData(prev => ({ ...prev, stoveTest: value }));
  };
  
  const handleSubmit = () => {
    // Validation
    if (!formData.productId || !formData.product || !formData.batchNumber || !formData.productionDate || formData.quantityProduced <= 0) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (isNew) {
      addProduction(formData as Omit<Production, 'id' | 'createdAt' | 'updatedAt'>);
    } else if (id) {
      updateProduction(id, formData);
    }
    
    navigate('/productions');
  };
  
  const handleExportPDF = () => {
    if (isNew) {
      toast.error("Vous devez d'abord enregistrer la production avant de pouvoir exporter une fiche");
      return;
    }
    
    if (formData.product) {
      const productionData = {
        ...(formData as Production)
      };
      
      exportProductionToPDF(productionData);
      toast.success("Fiche de production exportée en PDF");
    } else {
      toast.error("Impossible d'exporter la fiche: données incomplètes");
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/productions')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {isNew ? "Nouvelle production" : `Production du ${format(new Date(formData.productionDate || new Date()), 'dd MMMM yyyy', {locale: fr})}`}
              </h2>
              {!isNew && formData.product && (
                <p className="text-muted-foreground">
                  {formData.product.name} - Lot {formData.batchNumber}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exporter en PDF
              </Button>
            )}
            <Button onClick={handleSubmit}>
              <Check className="mr-2 h-4 w-4" />
              {isNew ? "Créer la production" : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informations de production
              </CardTitle>
              <CardDescription>
                Détails fondamentaux de cette production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Produit *</Label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Sélectionnez un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Numéro de lot *</Label>
                <Input
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productionDate">Date de fabrication *</Label>
                <Input
                  id="productionDate"
                  name="productionDate"
                  type="date"
                  value={formData.productionDate ? format(new Date(formData.productionDate), 'yyyy-MM-dd') : ''}
                  onChange={handleDateChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantityProduced">Quantité produite (unités) *</Label>
                <Input
                  id="quantityProduced"
                  name="quantityProduced"
                  type="number"
                  min="0"
                  value={formData.quantityProduced}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Paramètres de traitement
              </CardTitle>
              <CardDescription>
                Informations sur le traitement thermique et les tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="autoclaveNumber">Numéro d'autoclave</Label>
                <Input
                  id="autoclaveNumber"
                  name="autoclaveNumber"
                  value={formData.autoclaveNumber || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Température (°C)</Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    min="0"
                    value={formData.temperature !== undefined ? formData.temperature : ''}
                    onChange={handleNumberChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="0"
                    value={formData.duration !== undefined ? formData.duration : ''}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Test d'étuve</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="test-valid" 
                      checked={formData.stoveTest === 'validé'}
                      onCheckedChange={() => handleStoveTestChange('validé')}
                    />
                    <label
                      htmlFor="test-valid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Validé
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="test-invalid" 
                      checked={formData.stoveTest === 'non-validé'}
                      onCheckedChange={() => handleStoveTestChange('non-validé')}
                    />
                    <label
                      htmlFor="test-invalid"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Non validé
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="test-pending" 
                      checked={formData.stoveTest === 'en-attente'}
                      onCheckedChange={() => handleStoveTestChange('en-attente')}
                    />
                    <label
                      htmlFor="test-pending"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      En attente
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleChange}
                  placeholder="Notes additionnelles sur la production..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Ingrédients et traçabilité
              </CardTitle>
              <CardDescription>
                Liste des ingrédients utilisés avec leurs numéros de lot
              </CardDescription>
            </div>
            <Dialog open={showIngredientDialog} onOpenChange={setShowIngredientDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un ingrédient
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un ingrédient</DialogTitle>
                  <DialogDescription>
                    Saisissez les informations de l'ingrédient et son numéro de lot
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-name">Nom de l'ingrédient *</Label>
                    <Input
                      id="ingredient-name"
                      name="name"
                      value={tempIngredient.name}
                      onChange={handleTempIngredientChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredient-lot">Numéro de lot *</Label>
                    <Input
                      id="ingredient-lot"
                      name="lotNumber"
                      value={tempIngredient.lotNumber}
                      onChange={handleTempIngredientChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ingredient-quantity">Quantité *</Label>
                      <Input
                        id="ingredient-quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={tempIngredient.quantity}
                        onChange={handleTempIngredientChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ingredient-unit">Unité *</Label>
                      <select
                        id="ingredient-unit"
                        name="unit"
                        value={tempIngredient.unit}
                        onChange={handleTempIngredientChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="g">Grammes (g)</option>
                        <option value="kg">Kilogrammes (kg)</option>
                        <option value="ml">Millilitres (ml)</option>
                        <option value="l">Litres (l)</option>
                        <option value="unité">Unités</option>
                      </select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowIngredientDialog(false)}>Annuler</Button>
                  <Button onClick={addIngredient}>Ajouter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {(formData.ingredients || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground/60" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Aucun ingrédient ajouté</h3>
                  <p className="text-muted-foreground text-sm">
                    Ajoutez des ingrédients pour assurer la traçabilité de votre production
                  </p>
                </div>
                <Button onClick={() => setShowIngredientDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un ingrédient
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrédient</TableHead>
                    <TableHead>N° de lot</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(formData.ingredients || []).map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell className="font-medium">{ingredient.name}</TableCell>
                      <TableCell>{ingredient.lotNumber}</TableCell>
                      <TableCell>
                        {ingredient.quantity} {ingredient.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(ingredient.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductionDetail;
