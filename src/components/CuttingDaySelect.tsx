
import React from 'react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CuttingDay } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatWeight } from '@/utils/calculations';

interface CuttingDaySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CuttingDaySelect: React.FC<CuttingDaySelectProps> = ({ value, onChange, disabled }) => {
  const navigate = useNavigate();
  const { cuttingDays } = useApp();
  
  // Sort cutting days by date (most recent first)
  const sortedCuttingDays = [...cuttingDays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Filter only future cutting days or those in the last 7 days
  const relevantCuttingDays = sortedCuttingDays.filter(day => {
    const dayDate = new Date(day.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return dayDate >= sevenDaysAgo;
  });

  // Navigate to the cutting days page
  const handleCreateCuttingDay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/cutting-days');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="cutting-day-select" className="text-sm font-medium">
          Journée de découpe
        </label>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={handleCreateCuttingDay}
          className="h-8 px-2 text-xs"
          disabled={disabled}
        >
          <Plus className="mr-1 h-3 w-3" /> Créer
        </Button>
      </div>
      
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="cutting-day-select" className="w-full">
          <SelectValue placeholder="Sélectionner une journée de découpe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Aucune journée sélectionnée</SelectItem>
          
          {relevantCuttingDays.length === 0 ? (
            <SelectItem value="no-days" disabled>
              Aucune journée disponible
            </SelectItem>
          ) : (
            relevantCuttingDays.map((day) => (
              <SelectItem key={day.id} value={day.id}>
                <div className="flex items-center">
                  <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    {format(new Date(day.date), "d MMMM yyyy", { locale: fr })}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({day.orderCount} cmd • {formatWeight(day.totalWeight)})
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CuttingDaySelect;
