
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, 
  ChevronDown, ChevronUp, Phone, Mail, 
  MoreHorizontal, Settings, Users 
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { formatDate } from '@/utils/formatters';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types';

const ClientsList = () => {
  const navigate = useNavigate();
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cuttingPreferences: '',
    packagingPreferences: '',
    specialRequests: '',
  });
  
  // Filter and sort clients
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (sortField === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      return sortDirection === 'asc' 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  
  // Toggle sort direction
  const toggleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      cuttingPreferences: '',
      packagingPreferences: '',
      specialRequests: '',
    });
  };
  
  const initEditForm = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      cuttingPreferences: client.preferences.cuttingPreferences || '',
      packagingPreferences: client.preferences.packagingPreferences || '',
      specialRequests: client.preferences.specialRequests || '',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleAddClient = () => {
    if (!formData.name.trim()) {
      toast.error("Le nom du client est obligatoire");
      return;
    }
    
    const newClient = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      preferences: {
        cuttingPreferences: formData.cuttingPreferences || undefined,
        packagingPreferences: formData.packagingPreferences || undefined,
        specialRequests: formData.specialRequests || undefined,
      },
    };
    
    addClient(newClient);
    resetForm();
    setIsAddDialogOpen(false);
    toast.success("Client ajouté avec succès");
  };
  
  const handleUpdateClient = () => {
    if (!selectedClient || !formData.name.trim()) {
      toast.error("Le nom du client est obligatoire");
      return;
    }
    
    const updatedClient = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      preferences: {
        cuttingPreferences: formData.cuttingPreferences || undefined,
        packagingPreferences: formData.packagingPreferences || undefined,
        specialRequests: formData.specialRequests || undefined,
      },
    };
    
    updateClient(selectedClient.id, updatedClient);
    resetForm();
    setIsEditDialogOpen(false);
    toast.success("Client mis à jour avec succès");
  };
  
  const handleDeleteClient = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      toast.success("Client supprimé avec succès");
    }
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
            <p className="text-muted-foreground">
              Gérez vos clients et leurs préférences.
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un client
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un client..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Clients table */}
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
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Préférences</TableHead>
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
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="group">
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="mr-1 h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.preferences.cuttingPreferences || 
                       client.preferences.packagingPreferences || 
                       client.preferences.specialRequests ? (
                        <div className="flex items-center text-sm">
                          <Settings className="mr-1 h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Préférences définies</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucune préférence</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(client.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="cursor-pointer"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => initEditForm(client)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => { setSelectedClient(client); setIsDeleteDialogOpen(true); }}
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
        
        {/* Add Client Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
              <DialogDescription>
                Ajoutez les informations du nouveau client.
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
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                <h3 className="text-sm font-medium">Préférences</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="cuttingPreferences">Préférences de découpe</Label>
                  <Textarea
                    id="cuttingPreferences"
                    name="cuttingPreferences"
                    value={formData.cuttingPreferences}
                    onChange={handleInputChange}
                    placeholder="Ex: Épaisseur moyenne, sans gras"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="packagingPreferences">Préférences d'emballage</Label>
                  <Textarea
                    id="packagingPreferences"
                    name="packagingPreferences"
                    value={formData.packagingPreferences}
                    onChange={handleInputChange}
                    placeholder="Ex: Sous-vide, emballages individuels"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="specialRequests">Demandes spéciales</Label>
                  <Textarea
                    id="specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Ex: Demandes particulières du client"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddClient}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier un client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client.
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
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="edit-phone">Téléphone</Label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                <h3 className="text-sm font-medium">Préférences</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-cuttingPreferences">Préférences de découpe</Label>
                  <Textarea
                    id="edit-cuttingPreferences"
                    name="cuttingPreferences"
                    value={formData.cuttingPreferences}
                    onChange={handleInputChange}
                    placeholder="Ex: Épaisseur moyenne, sans gras"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-packagingPreferences">Préférences d'emballage</Label>
                  <Textarea
                    id="edit-packagingPreferences"
                    name="packagingPreferences"
                    value={formData.packagingPreferences}
                    onChange={handleInputChange}
                    placeholder="Ex: Sous-vide, emballages individuels"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-specialRequests">Demandes spéciales</Label>
                  <Textarea
                    id="edit-specialRequests"
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Ex: Demandes particulières du client"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleUpdateClient}>Mettre à jour</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteClient}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ClientsList;
