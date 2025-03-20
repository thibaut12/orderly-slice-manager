
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, 
  Package, Scale, Box, Layers 
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger, DialogClose 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { Product } from '@/types';
import { toast } from "sonner";
import { formatDate, formatWeight } from '@/utils/calculations';

const Products = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'date' | 'weight'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unitQuantity: 1,
    weightPerUnit: 100,
    weightUnit: 'g',
    packageType: 'sous-vide',
  });
  
  // Filter and sort products
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortField === 'weight') {
      const aWeight = a.weightPerUnit * (a.weightUnit === 'kg' ? 1000 : 1);
      const bWeight = b.weightPerUnit * (b.weightUnit === 'kg' ? 1000 : 1);
      return sortDirection === 'asc' 
        ? aWeight - bWeight
        : bWeight - aWeight;
    } else {
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Toggle sort direction
  const toggleSort = (field: 'name' | 'date' | 'weight') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Form handlers
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
  
  const resetForm = () => {
    setFormData({
      name: '',
      unitQuantity: 1,
      weightPerUnit: 100,
      weightUnit: 'g',
      packageType: 'sous-vide',
    });
  };
  
  const initEditForm = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      unitQuantity: product.unitQuantity,
      weightPerUnit: product.weightPerUnit,
      weightUnit: product.weightUnit,
      packageType: product.packageType,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleAddProduct = () => {
    if (!formData.name.trim()) {
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
    
    const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      unitQuantity: formData.unitQuantity,
      weightPerUnit: formData.weightPerUnit,
      weightUnit: formData.weightUnit as 'g' | 'kg',
      packageType: formData.packageType as 'sous-vide' | 'en-vrac' | 'autoclave' | 'autre',
    };
    
    addProduct(newProduct);
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  const handleUpdateProduct = () => {
    if (!currentProduct || !formData.name.trim()) {
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
    
    const updatedProduct: Partial<Product> = {
      name: formData.name,
      unitQuantity: formData.unitQuantity,
      weightPerUnit: formData.weightPerUnit,
      weightUnit: formData.weightUnit as 'g' | 'kg',
      packageType: formData.packageType as 'sous-vide' | 'en-vrac' | 'autoclave' | 'autre',
    };
    
    updateProduct(currentProduct.id, updatedProduct);
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteProduct = () => {
    if (currentProduct) {
      deleteProduct(currentProduct.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un produit..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Products table */}
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center">
                        Nom
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('weight')}
                    >
                      <div className="flex items-center">
                        Quantité & Poids
                        {sortField === 'weight' && (
                          sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Emballage</TableHead>
                    <TableHead 
                      className="cursor-pointer hidden md:table-cell"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        Date d'ajout
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Aucun produit trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            {product.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-sm">
                              <Layers className="mr-1 h-3 w-3 text-muted-foreground" />
                              {product.unitQuantity} unité{product.unitQuantity > 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Scale className="mr-1 h-3 w-3" />
                              {product.weightPerUnit} {product.weightUnit}/unité
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Box className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">
                              {product.packageType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => initEditForm(product)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => { setCurrentProduct(product); setIsDeleteDialogOpen(true); }}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Add Product Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un produit</DialogTitle>
              <DialogDescription>
                Ajoutez les informations du nouveau produit.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="name">Nom <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Bifteck, Entrecôte, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="unitQuantity">Quantité par unité</Label>
                    <Input
                      id="unitQuantity"
                      name="unitQuantity"
                      value={formData.unitQuantity}
                      onChange={handleNumberInputChange}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="packageType">Type d'emballage</Label>
                    <Select
                      value={formData.packageType}
                      onValueChange={(value) => handleSelectChange('packageType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="weightPerUnit">Poids par unité</Label>
                    <Input
                      id="weightPerUnit"
                      name="weightPerUnit"
                      value={formData.weightPerUnit}
                      onChange={handleNumberInputChange}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="weightUnit">Unité de poids</Label>
                    <Select
                      value={formData.weightUnit}
                      onValueChange={(value) => handleSelectChange('weightUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grammes (g)</SelectItem>
                        <SelectItem value="kg">kilogrammes (kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddProduct}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
                    placeholder="Ex: Bifteck, Entrecôte, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-unitQuantity">Quantité par unité</Label>
                    <Input
                      id="edit-unitQuantity"
                      name="unitQuantity"
                      value={formData.unitQuantity}
                      onChange={handleNumberInputChange}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-packageType">Type d'emballage</Label>
                    <Select
                      value={formData.packageType}
                      onValueChange={(value) => handleSelectChange('packageType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-weightPerUnit">Poids par unité</Label>
                    <Input
                      id="edit-weightPerUnit"
                      name="weightPerUnit"
                      value={formData.weightPerUnit}
                      onChange={handleNumberInputChange}
                      type="number"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-weightUnit">Unité de poids</Label>
                    <Select
                      value={formData.weightUnit}
                      onValueChange={(value) => handleSelectChange('weightUnit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">grammes (g)</SelectItem>
                        <SelectItem value="kg">kilogrammes (kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Products;
