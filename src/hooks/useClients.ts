
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useClients = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useClients must be used within an AppProvider');
  }
  
  const { clients, addClient, updateClient, deleteClient } = context;
  
  return {
    clients,
    addClient,
    updateClient,
    deleteClient
  };
};
