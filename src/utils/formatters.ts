
// Formatte le poids en fonction de l'unité (g ou kg)
export const formatWeight = (weight: number): string => {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(2)} kg`;
  }
  return `${weight} g`;
};

// Formatte la date au format français
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Traduit les statuts en français
export const translateStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'processing': 'En traitement',
    'completed': 'Terminée',
    'cancelled': 'Annulée'
  };
  
  return statusMap[status] || status;
};

// Retourne la couleur de fond en fonction du statut
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
