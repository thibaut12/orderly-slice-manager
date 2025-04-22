
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const PAID_AMOUNT = 50; // euros

const API_KEY_STORAGE_KEY = "stripe_api_key";

const Paiement = () => {
  const [stripeApiKey, setStripeApiKey] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem(API_KEY_STORAGE_KEY) || "";
    setStripeApiKey(key);
    setApiKeyInput(key);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKeyInput);
    setStripeApiKey(apiKeyInput);
    toast.success("Clé Stripe enregistrée.");
  };

  const handlePayment = () => {
    setPaymentLoading(true);
    // Simule un paiement
    setTimeout(() => {
      setPaymentLoading(false);
      toast("Succès du paiement (simulation)", {
        description: "Le paiement a été simulé. Un email de confirmation serait envoyé ici.",
        icon: <Mail className="text-primary" />,
      });
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Abonnement annuel</CardTitle>
          <div className="text-muted-foreground text-sm">
            Accédez à toutes les fonctionnalités pour 50 €/an. <br />
            <span className="font-medium text-destructive">Paiement réellement activé dès que vous enregistrez une clé Stripe valide.</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Clé API Stripe</label>
            <div className="flex gap-2">
              <Input
                type="text"
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
              La clé est enregistrée localement (n’est pas envoyée au serveur).
            </div>
          </div>
          <div>
            <div className="text-lg font-bold mb-2">
              Total à payer : <span className="text-primary">{PAID_AMOUNT} € / an</span>
            </div>
            <Button
              className="w-full"
              onClick={handlePayment}
              disabled={!stripeApiKey || paymentLoading}
            >
              {stripeApiKey ? (paymentLoading ? "Paiement en cours..." : "Payer maintenant") : "Ajouter une clé Stripe pour activer"}
            </Button>
            {!stripeApiKey && (
              <div className="text-destructive text-sm mt-2 flex items-center gap-1">
                <Mail className="inline w-4 h-4" /> Paiement désactivé : ajoutez une clé Stripe pour activer.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="mt-5 text-xs text-muted-foreground">
        Après le paiement réel, une confirmation sera envoyée par email.<br />
        (Prévu lors de l’intégration finale de Stripe et Email)
      </div>
    </div>
  );
};

export default Paiement;
