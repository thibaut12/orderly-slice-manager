
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Eye, Trash2, ChevronDown, ChevronUp, Filter, 
  Calendar, ShoppingCart, Package, User, Scale, FileText
} from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { Order, FilterOptions } from '@/types';
import { formatDate, formatWeight, getStatusColor, translateStatus } from '@/utils/calculations';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

const Orders = () => {
  const navigate = useNavigate();
  const { orders, clients, products, deleteOrder, filterOrders } = useApp();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    sortField: 'date',
    sortDirection: 'desc',
    status: [],
    dateFrom: undefined,
    dateTo: undefined,
  });
  
  // Apply filters
  const filteredOrders = filterOrders(filterOptions);
  
  // Status filter options
  const statusOptions = [
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'processing', label: 'En traitement' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
  ];
  
  // Handle sort change
  const toggleSort = (field: 'name' | 'date' | 'weight' | 'status') => {
    setFilterOptions(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions(prev => ({
      ...prev,
      searchTerm: e.target.value
    }));
  };
  
  // Handle status checkbox change
  const handleStatusChange = (status: string, checked: boolean) => {
    setFilterOptions(prev => {
      if (checked) {
        return { ...prev, status: [...(prev.status || []), status] };
      } else {
        return { ...prev, status: (prev.status || []).filter(s => s !== status) };
      }
    });
  };
  
  // Handle date filter change
  const handleDateChange = (date: Date | undefined, type: 'from' | 'to') => {
    setFilterOptions(prev => ({
      ...prev,
      [type === 'from' ? 'dateFrom' : 'dateTo']: date
    }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      searchTerm: '',
      sortField: 'date',
      sortDirection: 'desc',
      status: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
    setIsFilterOpen(false);
  };
  
  // Handle delete order
  const handleDeleteOrder = () => {
    if (selectedOrder) {
      deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
            <p className="text-muted-foreground">
              Gérez vos commandes et suivez leur progression.
            </p>
          </div>
          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle commande
          </Button>
        </div>
        
        <Separator className="my-6" />
        
        {/* Order summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                Total des commandes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                Commandes en attente
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter(order => order.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                Clients servis
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(orders.map(order => order.clientId)).size}
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm font-medium">
                Poids total
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatWeight(orders.reduce((sum, order) => sum + order.totalWeight, 0))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une commande..."
              className="pl-8"
              value={filterOptions.searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="sm:w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {(filterOptions.status?.length || filterOptions.dateFrom || filterOptions.dateTo) && (
                  <span className="ml-2 rounded-full bg-primary h-2 w-2" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filtrer par statut</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map((status) => (
                      <div key={status.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status.value}`} 
                          checked={filterOptions.status?.includes(status.value)}
                          onCheckedChange={(checked) => 
                            handleStatusChange(status.value, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`status-${status.value}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {status.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Période</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="dateFrom" className="text-xs">Date début</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-xs h-8 px-2 py-1",
                              !filterOptions.dateFrom && "text-muted-foreground"
                            )}
                          >
                            {filterOptions.dateFrom ? (
                              formatDate(filterOptions.dateFrom)
                            ) : (
                              "Sélectionner"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={filterOptions.dateFrom}
                            onSelect={(date) => handleDateChange(date, 'from')}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid gap-1.5">
                      <Label htmlFor="dateTo" className="text-xs">Date fin</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "justify-start text-xs h-8 px-2 py-1",
                              !filterOptions.dateTo && "text-muted-foreground"
                            )}
                          >
                            {filterOptions.dateTo ? (
                              formatDate(filterOptions.dateTo)
                            ) : (
                              "Sélectionner"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={filterOptions.dateTo}
                            onSelect={(date) => handleDateChange(date, 'to')}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    Appliquer
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" onClick={() => navigate('/summary')}>
            <FileText className="mr-2 h-4 w-4" />
            Synthèse
          </Button>
        </div>
        
        {/* Orders table */}
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
                        Client
                        {filterOptions.sortField === 'name' && (
                          filterOptions.sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Produits</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('weight')}
                    >
                      <div className="flex items-center">
                        Poids
                        {filterOptions.sortField === 'weight' && (
                          filterOptions.sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('status')}
                    >
                      <div className="flex items-center">
                        Statut
                        {filterOptions.sortField === 'status' && (
                          filterOptions.sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {filterOptions.sortField === 'date' && (
                          filterOptions.sortDirection === 'asc' ? 
                            <ChevronDown className="ml-1 h-4 w-4" /> : 
                            <ChevronUp className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            {order.client.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            {order.items.length} produit{order.items.length > 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Scale className="mr-1 h-4 w-4 text-muted-foreground" />
                            {formatWeight(order.totalWeight)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`px-2 py-1 text-xs inline-flex items-center rounded-full font-medium ${getStatusColor(order.status)}`}>
                            {translateStatus(order.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(order.orderDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/orders/${order.id}`)}
                              className="hidden group-hover:flex"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="hidden group-hover:flex text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteOrder}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Orders;
