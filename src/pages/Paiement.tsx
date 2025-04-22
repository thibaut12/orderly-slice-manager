import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const PAID_AMOUNT = 50; // euros par an

const Paiement = () => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Dans une vraie application, ces données viendraient de Supabase
  const [subscription, setSubscription] = useState({
    status: "trial", // trial, active, expired
    trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    subscriptionEndsAt: null
  });

  const handlePayment = () => {
    setPaymentLoading(true);
    // Simule un paiement
    setTimeout(() => {
      setPaymentLoading(false);
      setSubscription({
        ...subscription,
        status: "active",
        subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
      toast("Succès du paiement (simulation)", {
        description: "Le paiement a été simulé. Un email de confirmation vous sera envoyé.",
        icon: <Mail className="text-primary" />,
      });
    }, 1200);
  };

  const handleReturn = () => {
    navigate('/');
  };

  const getDaysLeft = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Votre abonnement</CardTitle>
            <div className="text-muted-foreground text-sm">
              Gérez votre abonnement à AgriDécoupe
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleReturn}
            className="self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour au tableau de bord</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informations sur l'abonnement en cours */}
          <div className="p-4 border rounded-md bg-muted/30">
            <div className="mb-2">
              <div className="text-sm font-medium mb-1">Statut actuel:</div>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full mr-2 ${
                  subscription.status === 'trial' ? 'bg-blue-500' : 
                  subscription.status === 'active' ? 'bg-green-500' : 
                  'bg-red-500'
                }`} />
                <span className="font-medium">
                  {subscription.status === 'trial' ? 'Période d\'essai' : 
                   subscription.status === 'active' ? 'Abonnement actif' : 
                   'Abonnement expiré'}
                </span>
              </div>
            </div>

            {subscription.status === 'trial' && (
              <>
                <div className="text-sm mt-2">
                  Votre période d'essai se termine dans <strong>{getDaysLeft(subscription.trialEndsAt)} jours</strong>
                  <br />(le {subscription.trialEndsAt.toLocaleDateString('fr-FR')})
                </div>
                <div className="mt-2 text-xs text-amber-600">
                  Abonnez-vous avant la fin de votre période d'essai pour continuer à utiliser tous les services.
                </div>
              </>
            )}

            {subscription.status === 'active' && subscription.subscriptionEndsAt && (
              <div className="text-sm mt-2">
                Votre abonnement est valide jusqu'au <strong>{subscription.subscriptionEndsAt.toLocaleDateString('fr-FR')}</strong>
                <br />(encore {getDaysLeft(subscription.subscriptionEndsAt)} jours)
              </div>
            )}

            {subscription.status === 'expired' && (
              <div className="text-sm mt-2 text-destructive">
                Votre abonnement a expiré. Veuillez vous réabonner pour accéder à tous les services.
              </div>
            )}
          </div>

          <div>
            <div className="text-lg font-bold mb-2">
              Abonnement annuel : <span className="text-primary">{PAID_AMOUNT} € / an</span>
            </div>
            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={paymentLoading || subscription.status === 'active'}
            >
              {paymentLoading ? "Paiement en cours..." : 
               subscription.status === 'active' ? "Déjà abonné" : "Payer maintenant"}
            </Button>
            
            {subscription.status === 'active' && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                Votre abonnement se renouvellera automatiquement.
                <br />
                Vous recevrez un rappel par email 30 jours avant l'échéance.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-5 text-xs text-muted-foreground">
        Pour toute question concernant votre abonnement, veuillez contacter le support.
      </div>
    </div>
  );
};

export default Paiement;
