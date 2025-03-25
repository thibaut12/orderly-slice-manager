import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Edit, FileText, List, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDate, formatWeight } from '@/utils/calculations';
import Layout from '@/components/Layout';
import { CuttingDay, Order } from '@/types';
import { toast } from "sonner";

const CuttingDayDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cuttingDays, updateCuttingDay, deleteCuttingDay, orders, generateCuttingSummary } = useApp();
  const [cuttingDay, setCuttingDay] = useState<CuttingDay | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDate, setEditedDate] = useState<Date | undefined>(undefined);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const foundCuttingDay = cuttingDays.find(day => day.id === id);
      setCuttingDay(foundCuttingDay || null);
      if (foundCuttingDay) {
        setEditedDescription(foundCuttingDay.description || '');
        setEditedDate(new Date(foundCuttingDay.date));
      }
    }
  }, [id, cuttingDays]);

  const handleDeleteCuttingDay = () => {
    if (cuttingDay) {
      deleteCuttingDay(cuttingDay.id);
      navigate('/cutting-days');
      toast.success("Journée de découpe supprimée avec succès");
    }
  };

  const handleSaveChanges = async () => {
    if (!cuttingDay) return;

    const updatedCuttingDayData = {
      description: editedDescription,
      date: editedDate ? editedDate.toISOString() : cuttingDay.date,
    };

    updateCuttingDay(cuttingDay.id, updatedCuttingDayData);
    setIsEditing(false);
    toast.success("Journée de découpe mise à jour avec succès");
  };

  const handleCancelEdit = () => {
    if (cuttingDay) {
      setEditedDescription(cuttingDay.description || '');
      setEditedDate(new Date(cuttingDay.date));
    }
    setIsEditing(false);
  };

  const handleGenerateSummary = async () => {
    if (!cuttingDay) return;
    setIsGeneratingSummary(true);
    try {
      const generatedSummary = generateCuttingSummary(cuttingDay.id);
      setSummary(generatedSummary);
      toast.success("Synthèse générée avec succès");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Erreur lors de la génération de la synthèse");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!summary) {
      toast.error("Aucune synthèse à télécharger. Veuillez générer une synthèse d'abord.");
      return;
    }

    const doc = new jsPDF();
    
    // Titre du document
    doc.setFontSize(18);
    doc.text(`Synthèse de la journée de découpe du ${formatDate(new Date(summary.generatedAt))}`, 14, 22);
    
    // Informations générales
    doc.setFontSize(12);
    doc.text(`Généré le: ${formatDate(new Date(summary.generatedAt))}`, 14, 30);
    doc.text(`Nombre total de produits: ${summary.totalProducts}`, 14, 36);
    doc.text(`Poids total: ${formatWeight(summary.totalWeight)}`, 14, 42);

    // Préparation des données pour le tableau
    const tableData = summary.items.map(item => [
      item.productName,
      item.totalQuantity,
      formatWeight(item.totalWeight),
      item.unitQuantity,
    ]);

    // Configuration du tableau
    autoTable(doc, {
      head: [['Produit', 'Quantité Totale', 'Poids Total', 'Quantité par Unité']],
      body: tableData,
      startY: 50,
    });

    // Téléchargement du PDF
    doc.save(`synthese_decoupe_${format(new Date(summary.generatedAt), 'yyyyMMdd_HHmmss')}.pdf`);
    toast.success("Synthèse téléchargée avec succès");
  };

  if (!cuttingDay) {
    return (
      <Layout>
        <div className="animate-fade-in p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Journée de découpe non trouvée</h1>
          <p className="mb-6 text-muted-foreground">
            La journée de découpe que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate('/cutting-days')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux journées de découpe
          </Button>
        </div>
      </Layout>
    );
  }

  const cuttingDayOrders = orders.filter(order => order.cuttingDayId === cuttingDay.id);

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Journée de découpe du {formatDate(new Date(cuttingDay.date))}
            </h1>
            <p className="text-muted-foreground">
              Gérez les détails de cette journée de découpe.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/cutting-days')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" /> Annuler
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Edit className="mr-2 h-4 w-4" /> Enregistrer
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" /> Modifier
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {isEditing ? (
          <Card className="space-y-4">
            <CardHeader>
              <CardTitle>Modifier la journée de découpe</CardTitle>
              <CardDescription>
                Mettez à jour les informations de cette journée de découpe.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Description de la journée de découpe..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !editedDate && "text-muted-foreground"
                      )}
                    >
                      {editedDate ? (
                        format(editedDate, "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editedDate}
                      onSelect={setEditedDate}
                      disabled={(date) =>
                        date > new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Date</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDate(new Date(cuttingDay.date))}</div>
                <p className="text-sm text-muted-foreground">
                  Date de la journée de découpe
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cuttingDayOrders.length}</div>
                <p className="text-sm text-muted-foreground">
                  Nombre de commandes pour cette journée
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Poids total</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatWeight(cuttingDay.totalWeight)}</div>
                <p className="text-sm text-muted-foreground">
                  Poids total des commandes de cette journée
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {cuttingDay.description && !isEditing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{cuttingDay.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Commandes de cette journée</CardTitle>
              <div>
                <Button 
                  variant="outline"
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Générer la synthèse
                    </>
                  )}
                </Button>
                {summary && (
                  <Button 
                    variant="default"
                    onClick={handleDownloadSummary}
                    className="ml-2"
                  >
                    Télécharger la synthèse
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              Liste des commandes associées à cette journée de découpe
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead className="text-right">Poids</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuttingDayOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Aucune commande pour cette journée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cuttingDayOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{order.client.name}</TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell className="text-right">{formatWeight(order.totalWeight)}</TableCell>
                        <TableCell className="text-right">{formatDate(order.orderDate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette journée de découpe ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button variant="destructive" onClick={handleDeleteCuttingDay}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CuttingDayDetail;
