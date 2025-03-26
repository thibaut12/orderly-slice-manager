
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Production, Ingredient } from '@/types';

export const exportProductionToPDF = (production: Production) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Fiche de Production', 105, 20, { align: 'center' });
  
  // Add creation date
  doc.setFontSize(10);
  doc.text(`Généré le: ${format(new Date(), 'dd MMMM yyyy HH:mm', {locale: fr})}`, 200, 10, { align: 'right' });
  
  // Add production details
  doc.setFontSize(12);
  doc.text('Informations générales', 14, 30);
  
  const generalInfos = [
    [`Produit:`, `${production.product.name}`],
    [`Numéro de lot:`, `${production.batchNumber}`],
    [`Date de production:`, `${format(new Date(production.productionDate), 'dd MMMM yyyy', {locale: fr})}`],
    [`Quantité produite:`, `${production.quantityProduced} unités`],
  ];
  
  if (production.autoclaveNumber) {
    generalInfos.push([`Numéro d'autoclave:`, `${production.autoclaveNumber}`]);
  }
  
  if (production.temperature) {
    generalInfos.push([`Température:`, `${production.temperature} °C`]);
  }
  
  if (production.duration) {
    generalInfos.push([`Durée:`, `${production.duration} minutes`]);
  }
  
  if (production.stoveTest) {
    generalInfos.push([`Test d'étuve:`, `${production.stoveTest}`]);
  }
  
  autoTable(doc, {
    startY: 35,
    head: [['Information', 'Valeur']],
    body: generalInfos,
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Add ingredients section if there are any
  if (production.ingredients && production.ingredients.length > 0) {
    // On utilise une variable pour stocker la position Y après la dernière table
    const autoTableOutput = doc.autoTable.previous;
    const ingredientsY = autoTableOutput ? autoTableOutput.finalY : 35;
    
    doc.text('Ingrédients et traçabilité', 14, ingredientsY + 10);
    
    const ingredientsData = production.ingredients.map((ingredient: Ingredient) => [
      ingredient.name,
      ingredient.lotNumber,
      `${ingredient.quantity} ${ingredient.unit}`
    ]);
    
    autoTable(doc, {
      startY: ingredientsY + 15,
      head: [['Ingrédient', 'N° de lot', 'Quantité']],
      body: ingredientsData,
      headStyles: { fillColor: [41, 128, 185] },
    });
  }
  
  // Add notes if any
  if (production.notes) {
    const autoTableOutput = doc.autoTable.previous;
    const notesY = autoTableOutput ? autoTableOutput.finalY : 35;
    
    doc.text('Notes', 14, notesY + 10);
    
    autoTable(doc, {
      startY: notesY + 15,
      body: [[production.notes]],
      styles: { overflow: 'linebreak', cellWidth: 'auto' },
    });
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} sur ${pageCount}`, 200, 287, { align: 'right' });
    doc.text('Gestionnaire de Découpe - Traçabilité', 14, 287);
  }
  
  // Save the PDF
  doc.save(`Production_${production.batchNumber}_${format(new Date(production.productionDate), 'yyyyMMdd')}.pdf`);
};
