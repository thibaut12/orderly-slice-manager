
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Scissors, 
  Calendar, 
  Plus, 
  CalendarDays, 
  ListFilter, 
  FilePlus, 
  FileDown, 
  Pen, 
  Trash2,
  ChevronDown,
  ChevronRight,
  CalendarPlus,
  CheckSquare,
  Square
} from "lucide-react";
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatWeight } from '@/utils/calculations';
import { CuttingDay, Order } from '@/types';
import { Badge } from '@/components/ui/badge';

// Schéma de validation pour le formulaire de journée de découpe
const cuttingDayFormSchema = z.object({
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  description: z.string().optional(),
  status: z.enum(['en-cours', 'termine']),
});

type CuttingDayFormValues = z.infer<typeof cuttingDayFormSchema>;

const CuttingDays = () => {
  const navigate = useNavigate();
  const { cuttingDays, orders, addCuttingDay, updateCuttingDay, deleteCuttingDay, updateOrder, getCuttingDaySummary } = useApp();
  const [selectedCuttingDay, setSelectedCuttingDay] = useState<CuttingDay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form for creating or editing a cutting day
  const form = useForm<CuttingDayFormValues>({
    resolver: zodResolver(cuttingDayFormSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      status: 'en-cours',
    },
  });

  // Reset form when opening the dialog
  const handleOpenDialog = (editMode = false, cuttingDay?: CuttingDay) => {
    setIsEditMode(editMode);
    if (editMode && cuttingDay) {
      form.reset({
        date: new Date(cuttingDay.date),
        description: cuttingDay.description || "",
        status: cuttingDay.status,
      });
    } else {
      form.reset({
        date: new Date(),
        description: "",
        status: 'en-cours',
      });
    }
    setIsDialogOpen(true);
  };

  // Submit form to create or edit a cutting day
  const onSubmit = (data: CuttingDayFormValues) => {
    if (isEditMode && selectedCuttingDay) {
      updateCuttingDay(selectedCuttingDay.id, {
        date: data.date,
        description: data.description,
        status: data.status,
      });
    } else {
      addCuttingDay({
        date: data.date,
        description: data.description,
        status: data.status,
      });
    }
    setIsDialogOpen(false);
  };

  // Delete a cutting day
  const handleDeleteCuttingDay = (cuttingDayId: string) => {
    deleteCuttingDay(cuttingDayId);
    if (selectedCuttingDay?.id === cuttingDayId) {
      setSelectedCuttingDay(null);
    }
  };

  // Select a cutting day to view details
  const handleSelectCuttingDay = (cuttingDay: CuttingDay) => {
    setSelectedCuttingDay(cuttingDay);
  };

  // Toggle cutting day status
  const handleToggleStatus = (cuttingDayId: string, currentStatus: 'en-cours' | 'termine') => {
    const newStatus = currentStatus === 'en-cours' ? 'termine' : 'en-cours';
    updateCuttingDay(cuttingDayId, { status: newStatus });
  };

  // Get orders for the selected cutting day
  const getOrdersForCuttingDay = (cuttingDayId: string): Order[] => {
    return orders.filter(order => order.cuttingDayId === cuttingDayId);
  };

  // Sort cutting days by date (most recent first)
  const sortedCuttingDays = [...cuttingDays].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Handle exporting cutting day summary
  const handleExportSummary = (cuttingDayId: string) => {
    // This would be implemented with a PDF or Excel export library
    toast.success("Fonctionnalité d'export bientôt disponible");
  };

  // Function to get status badge
  const getStatusBadge = (status: 'en-cours' | 'termine') => {
    return status === 'en-cours' 
      ? <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">En cours</Badge>
      : <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Terminé</Badge>;
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Journées de découpe</h1>
            <p className="text-muted-foreground">
              Gérez les journées de découpe et associez-y vos commandes.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <CalendarPlus className="mr-2 h-5 w-5" /> Nouvelle journée
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des journées de découpe */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5" /> 
                  Journées planifiées
                </CardTitle>
                <CardDescription>
                  Sélectionnez une journée pour voir les détails
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {sortedCuttingDays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-lg font-medium">Aucune journée planifiée</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Créez votre première journée de découpe
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {sortedCuttingDays.map((day) => (
                      <button
                        key={day.id}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent transition-colors",
                          selectedCuttingDay?.id === day.id && "bg-accent"
                        )}
                        onClick={() => handleSelectCuttingDay(day)}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {format(new Date(day.date), "EEEE d MMMM yyyy", { locale: fr })}
                            </span>
                            {getStatusBadge(day.status)}
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {day.orderCount} commande{day.orderCount !== 1 ? 's' : ''} • {formatWeight(day.totalWeight)}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Détails de la journée sélectionnée */}
          <div className="lg:col-span-2">
            {selectedCuttingDay ? (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle>
                        {format(new Date(selectedCuttingDay.date), "EEEE d MMMM yyyy", { locale: fr })}
                      </CardTitle>
                      {getStatusBadge(selectedCuttingDay.status)}
                    </div>
                    {selectedCuttingDay.description && (
                      <CardDescription>{selectedCuttingDay.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleToggleStatus(selectedCuttingDay.id, selectedCuttingDay.status)}
                    >
                      {selectedCuttingDay.status === 'en-cours' 
                        ? <><CheckSquare className="mr-2 h-4 w-4" />Marquer comme terminé</>
                        : <><Square className="mr-2 h-4 w-4" />Reprendre cette journée</>
                      }
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(true, selectedCuttingDay)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteCuttingDay(selectedCuttingDay.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="summary">
                    <TabsList className="mb-4">
                      <TabsTrigger value="summary">Synthèse</TabsTrigger>
                      <TabsTrigger value="orders">Commandes ({selectedCuttingDay.orderCount})</TabsTrigger>
                    </TabsList>
                    
                    {/* Onglet Synthèse */}
                    <TabsContent value="summary" className="space-y-4">
                      {selectedCuttingDay.orderCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <ListFilter className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                          <p className="text-lg font-medium">Aucune commande associée</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ajoutez des commandes à cette journée pour voir la synthèse
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="py-2">
                                <CardTitle className="text-base">Commandes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{selectedCuttingDay.orderCount}</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="py-2">
                                <CardTitle className="text-base">Poids total</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">{formatWeight(selectedCuttingDay.totalWeight)}</div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="py-2">
                                <CardTitle className="text-base">Produits uniques</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold">
                                  {getCuttingDaySummary(selectedCuttingDay.id).items.length}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Détail des produits</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left font-medium py-2">Produit</th>
                                    <th className="text-right font-medium py-2">Quantité</th>
                                    <th className="text-right font-medium py-2">Poids</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {getCuttingDaySummary(selectedCuttingDay.id).items.map((item, index) => (
                                    <tr key={index} className="border-b last:border-0">
                                      <td className="py-2">{item.productName}</td>
                                      <td className="text-right py-2">{item.totalQuantity}</td>
                                      <td className="text-right py-2">{formatWeight(item.totalWeight)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </CardContent>
                            <CardFooter className="justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => handleExportSummary(selectedCuttingDay.id)}
                              >
                                <FileDown className="mr-2 h-4 w-4" />
                                Exporter la synthèse
                              </Button>
                            </CardFooter>
                          </Card>
                        </>
                      )}
                    </TabsContent>
                    
                    {/* Onglet Commandes */}
                    <TabsContent value="orders">
                      {selectedCuttingDay.orderCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <FilePlus className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                          <p className="text-lg font-medium">Aucune commande associée</p>
                          <p className="text-sm text-muted-foreground mt-1 mb-4">
                            Ajoutez des commandes à cette journée
                          </p>
                          <Button onClick={() => navigate('/orders/new')}>
                            <Plus className="mr-2 h-4 w-4" /> Créer une commande
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {getOrdersForCuttingDay(selectedCuttingDay.id).map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b bg-muted/40">
                                <div className="mb-2 sm:mb-0">
                                  <div className="font-medium">{order.client.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(order.orderDate), "PP", { locale: fr })}
                                  </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                                    {formatWeight(order.totalWeight)}
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                  >
                                    Voir détails
                                  </Button>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <div className="text-sm">
                                  {order.items.length} produit{order.items.length !== 1 ? 's' : ''}
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground line-clamp-1">
                                  {order.items.map(item => item.product.name).join(', ')}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex flex-col items-center justify-center p-8 text-center">
                <Scissors className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune journée sélectionnée</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Sélectionnez une journée de découpe dans la liste ou créez-en une nouvelle pour gérer vos commandes.
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <CalendarPlus className="mr-2 h-5 w-5" /> Créer une journée
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog pour créer ou éditer une journée de découpe */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Modifier la journée de découpe" : "Créer une journée de découpe"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifiez les informations de la journée de découpe" 
                : "Ajoutez une nouvelle journée pour organiser vos commandes"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Date de la journée */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <Calendar className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnelle)</FormLabel>
                    <FormControl>
                      <Input placeholder="Notes ou description..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Ajoutez des informations supplémentaires si nécessaire
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statut */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <div className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === 'en-cours'}
                            onChange={() => field.onChange('en-cours')}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">En cours</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="radio"
                            checked={field.value === 'termine'}
                            onChange={() => field.onChange('termine')}
                            className="h-4 w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Terminé</FormLabel>
                      </FormItem>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  {isEditMode ? "Mettre à jour" : "Créer la journée"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CuttingDays;
