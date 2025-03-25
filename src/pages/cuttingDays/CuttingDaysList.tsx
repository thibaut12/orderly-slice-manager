
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Calendar, Search, Package, 
  ArrowUpDown, Eye, Trash2, Scissors,
  CheckSquare, Square
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCuttingDays } from '@/hooks/useCuttingDays';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { formatDate, formatWeight } from '@/utils/formatters';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Schéma de validation pour le formulaire de journée de découpe
const cuttingDayFormSchema = z.object({
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  description: z.string().optional(),
  status: z.enum(['en-cours', 'termine']),
});

type CuttingDayFormValues = z.infer<typeof cuttingDayFormSchema>;

const CuttingDaysList = () => {
  const navigate = useNavigate();
  const { cuttingDays, addCuttingDay, deleteCuttingDay, updateCuttingDay } = useCuttingDays();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  // Filtered cutting days
  const filteredDays = cuttingDays.filter(day => {
    return formatDate(day.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
           (day.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  });

  // Formulaire de création
  const form = useForm<CuttingDayFormValues>({
    resolver: zodResolver(cuttingDayFormSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      status: 'en-cours',
    },
  });

  const handleDeleteClick = (dayId: string) => {
    setDayToDelete(dayId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dayToDelete) {
      deleteCuttingDay(dayToDelete);
      setDeleteDialogOpen(false);
      setDayToDelete(null);
    }
  };

  const onSubmit = (data: CuttingDayFormValues) => {
    addCuttingDay({
      date: data.date,
      description: data.description,
      status: data.status,
    });
    setCreateDialogOpen(false);
    form.reset();
  };

  const handleCreateClick = () => {
    form.reset({
      date: new Date(),
      description: "",
      status: 'en-cours',
    });
    setCreateDialogOpen(true);
  };

  const handleToggleStatus = (dayId: string, currentStatus: 'en-cours' | 'termine') => {
    const newStatus = currentStatus === 'en-cours' ? 'termine' : 'en-cours';
    updateCuttingDay(dayId, { status: newStatus });
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
              Planifiez et gérez vos journées de découpe
            </p>
          </div>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle journée
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Recherche</CardTitle>
            <CardDescription>
              Recherchez des journées de découpe par date ou description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journées de découpe</CardTitle>
            <CardDescription>
              {filteredDays.length} journée{filteredDays.length !== 1 ? 's' : ''} trouvée{filteredDays.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDays.length === 0 ? (
              <div className="text-center py-12">
                <Scissors className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Aucune journée trouvée</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ajoutez une nouvelle journée de découpe pour commencer.
                </p>
                <Button 
                  onClick={handleCreateClick}
                  className="mt-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle journée
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex items-center">
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead className="text-right">Poids total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDays.map((day) => (
                    <TableRow key={day.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                          {formatDate(day.date)}
                        </div>
                      </TableCell>
                      <TableCell>{day.description}</TableCell>
                      <TableCell>{getStatusBadge(day.status)}</TableCell>
                      <TableCell>{day.orderCount} commande(s)</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatWeight(day.totalWeight)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(day.id, day.status)}
                            className="text-muted-foreground"
                          >
                            {day.status === 'en-cours' 
                              ? <CheckSquare className="h-4 w-4" /> 
                              : <Square className="h-4 w-4" />
                            }
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/cutting-days/${day.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(day.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette journée de découpe ? Les commandes associées ne seront pas supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Cutting Day Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une journée de découpe</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle journée pour organiser vos commandes
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
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button type="submit">Créer la journée</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default CuttingDaysList;
