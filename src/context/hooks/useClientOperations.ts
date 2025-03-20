
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../types';
import { toast } from "sonner";

export const useClientOperations = (
  clients: Client[],
  setClients: React.Dispatch<React.SetStateAction<Client[]>>
) => {
  const addClient = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...client,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setClients([...clients, newClient]);
    toast.success("Client ajouté avec succès");
  };

  const updateClient = (clientId: string, clientData: Partial<Client>) => {
    setClients(
      clients.map((client) =>
        client.id === clientId
          ? { ...client, ...clientData, updatedAt: new Date() }
          : client
      )
    );
    toast.success("Client mis à jour");
  };

  const deleteClient = (clientId: string) => {
    setClients(clients.filter((client) => client.id !== clientId));
    toast.success("Client supprimé");
  };

  return { addClient, updateClient, deleteClient };
};
