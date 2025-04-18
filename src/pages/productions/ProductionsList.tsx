import React from 'react';
import { useProductions } from '@/hooks/useProductions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ProductionsList: React.FC = () => {
  const { productions } = useProductions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <img 
          src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png" 
          alt="AgriDécoupe" 
          className="h-36 w-36 object-contain" 
        />
      </div>

      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Liste des Productions</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une Production
          </Button>
        </div>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de Production
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productions.map((production) => (
                <tr key={production.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{production.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{production.productionDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{production.lot}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button size="sm">Voir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionsList;
