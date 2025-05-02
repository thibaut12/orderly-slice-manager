
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Shield, Settings, Mail, RefreshCw, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const API_KEY_STORAGE_KEY = "stripe_api_key";

const AdminSubscriptions = () => {
  const [stripeApiKey, setStripeApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const { user } = useAuth();
  const [users, setUsers] = useState([
    { 
      id: "1", 
      username: "Ferme du Soleil", 
      email: "ferme.soleil@example.com",
      status: "trial", 
      trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) 
    },
    { 
      id: "2", 
      username: "Ferme des Vallées", 
      email: "vallee@example.com",
      status: "active", 
      trialEndsAt: null,
      subscriptionEndsAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000)
    },
    { 
      id: "3", 
      username: "Élevage Martin", 
      email: "martin@example.com",
      status: "expired", 
      trialEndsAt: null 
    }
  ]);

  useEffect(() => {
    // Récupérer la clé API depuis le localStorage
    const key = localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    setStripeApiKey(key);
    setApiKeyInput(key);

    // Charger les vraies données d'abonnement depuis Supabase
    const loadSubscriptions = async () => {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError || !authUsers) {
        console.error("Erreur lors du chargement des utilisateurs:", authError);
        return;
      }

      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subError || !subscriptions) {
        console.error("Erreur lors du chargement des abonnements:", subError);
        return;
      }

      // Combiner les données des utilisateurs et des abonnements
      const updatedUsers = authUsers.users.map(authUser => {
        const subscription = subscriptions.find(sub => sub.user_id === authUser.id);
        return {
          id: authUser.id,
          username: authUser.user_metadata?.farm_name || authUser.email?.split('@')[0] || 'Utilisateur',
          email: authUser.email || '',
          status: subscription?.status || 'expired',
          trialEndsAt: subscription?.trial_ends_at ? new Date(subscription.trial_ends_at) : null,
          subscriptionEndsAt: subscription?.current_period_ends_at ? new Date(subscription.current_period_ends_at) : null
        };
      });

      setUsers(updatedUsers);
    };

    if (user?.role === 'admin') {
      loadSubscriptions();
    }
  }, [user]);

  const handleSaveApiKey = () => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyInput);
    setStripeApiKey(apiKeyInput);
    toast.success("Clé Stripe enregistrée.");
  };

  const sendReminder = (email: string, username: string) => {
    toast.success(`Rappel envoyé à ${username}`, {
      description: `Un email a été envoyé à ${email} (simulation).`,
      icon: <Mail className="text-primary" />,
    });
  };

  const extendTrial = async (id: string, username: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'trial'
        })
        .eq('user_id', id);

      if (error) throw error;

      setUsers(users.map(user => {
        if (user.id === id) {
          return {
            ...user,
            status: 'trial',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          };
        }
        return user;
      }));

      toast.success(`Période d'essai prolongée pour ${username}`, {
        description: `30 jours supplémentaires accordés.`,
        icon: <Check className="text-primary" />,
      });
    } catch (error: any) {
      console.error("Erreur lors de la prolongation de la période d'essai:", error);
      toast.error("Erreur lors de la prolongation de la période d'essai");
    }
  };

  // Vérifier si l'utilisateur est administrateur
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh] flex-col">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration des abonnements</h1>
            <p className="text-muted-foreground">
              Gérez les abonnements et les paramètres Stripe
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" /> Rafraîchir
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Settings className="h-4 w-4" /> Paramètres avancés
            </Button>
          </div>
        </div>

        {/* Clé API Stripe - Visible uniquement par l'admin */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Stripe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Clé API Stripe (sécurisée)</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="sk_live_xxxxx"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  autoComplete="off"
                  className="w-full"
                />
                <Button
                  variant="secondary"
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput}
                >
                  Enregistrer
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                La clé est stockée localement et n'est visible que par l'administrateur.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des utilisateurs/fermes et leur statut d'abonnement */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion des abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la ferme</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          user.status === 'trial' ? 'bg-blue-500' : 
                          user.status === 'active' ? 'bg-green-500' : 
                          'bg-red-500'
                        }`} />
                        {user.status === 'trial' ? 'Essai' : 
                         user.status === 'active' ? 'Abonné' : 
                         'Expiré'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.trialEndsAt && (
                        <span className="text-sm">
                          Essai jusqu'au {user.trialEndsAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {user.subscriptionEndsAt && (
                        <span className="text-sm">
                          Abonnement jusqu'au {user.subscriptionEndsAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {!user.trialEndsAt && !user.subscriptionEndsAt && (
                        <span className="text-sm text-muted-foreground">
                          Aucun abonnement actif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => sendReminder(user.email, user.username)}
                        >
                          <Mail className="h-4 w-4 mr-1" /> Rappel
                        </Button>
                        {user.status === 'expired' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => extendTrial(user.id, user.username)}
                          >
                            Prolonger essai
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminSubscriptions;
