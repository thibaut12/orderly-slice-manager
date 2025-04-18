
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProductions } from '@/hooks/useProductions';
import { useProducts } from '@/hooks/useProducts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Plus, Search, Calendar, FlaskConical } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ProductionsList = () => {
  const navigate = useNavigate();
  const { productions, searchProductions } = useProductions();
  const [searchTerm, setSearchTerm] = useState('');

  // Utiliser la fonction searchProductions du hook
  const filteredProductions = searchProductions(searchTerm);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Traçabilité des Productions</h2>
            <p className="text-muted-foreground">
              Gérez vos productions et assurez la traçabilité de vos produits
            </p>
          </div>
          <Button onClick={() => navigate('/productions/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle production
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par produit, numéro de lot, ingrédient..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Liste des productions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProductions.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground/60" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Aucune production trouvée</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchTerm ? "Aucun résultat ne correspond à votre recherche." : "Vous n'avez pas encore enregistré de production."}
                  </p>
                </div>
                <Button onClick={() => navigate('/productions/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une production
                </Button>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>N° de lot</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Autoclave</TableHead>
                      <TableHead>Test étuve</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductions.map((production) => (
                      <TableRow key={production.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(production.productionDate), 'dd MMM yyyy', {locale: fr})}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{production.product.name}</div>
                        </TableCell>
                        <TableCell>{production.batchNumber}</TableCell>
                        <TableCell>{production.quantityProduced} unités</TableCell>
                        <TableCell>{production.autoclaveNumber || "N/A"}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            production.stoveTest === 'validé' 
                              ? 'bg-green-50 text-green-700' 
                              : production.stoveTest === 'non-validé'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {production.stoveTest || "En attente"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/productions/${production.id}`)}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductionsList;
