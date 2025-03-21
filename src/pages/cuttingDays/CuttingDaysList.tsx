
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Calendar, Search, Package, 
  ArrowUpDown, Eye, Trash2, Scissors 
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

const CuttingDaysList = () => {
  const navigate = useNavigate();
  const { cuttingDays, deleteCuttingDay } = useCuttingDays();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dayToDelete, setDayToDelete] = useState<string | null>(null);

  // Filtered cutting days
  const filteredDays = cuttingDays.filter(day => {
    return formatDate(day.date).toLowerCase().includes(searchTerm.toLowerCase()) ||
           day.description.toLowerCase().includes(searchTerm.toLowerCase());
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
          <Button onClick={() => navigate('/cutting-days/new')}>
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
                  onClick={() => navigate('/cutting-days/new')}
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
                      <TableCell>{day.orderCount} commande(s)</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatWeight(day.totalWeight)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
    </Layout>
  );
};

export default CuttingDaysList;
