
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      console.log("Tentative de connexion avec:", { email });
      const success = await login(email, password);
      
      if (success) {
        console.log("Connexion réussie, redirection vers /");
        toast.success("Connexion réussie", {
          description: "Vous êtes maintenant connecté"
        });
        navigate('/');
      } else {
        console.error("Échec de la connexion: aucune erreur spécifique retournée");
        toast.error("Échec de la connexion", {
          description: "Email ou mot de passe incorrect"
        });
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      toast.error("Erreur de connexion", {
        description: error.message || "Une erreur est survenue lors de la connexion"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 space-y-6">
      <div className="flex flex-col items-center space-y-2">
        <div className="rounded-full overflow-hidden shadow-lg">
          <img
            src="/lovable-uploads/ad6df11d-dc42-4ccd-9e17-3c46ce1a8fcc.png"
            alt="Logo AgriDécoupe"
            className="w-32 h-32 object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">Bienvenue sur AgriDécoupe</h1>
        <p className="text-muted-foreground">
          Connectez-vous pour accéder à votre espace.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span>Nouvelle ferme ? </span>
            <button 
              className="text-primary hover:underline font-medium" 
              onClick={() => navigate("/register")}
            >
              Créer un compte
            </button>
          </div>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AgriDécoupe. Tous droits réservés.
      </p>
    </div>
  );
};

export default LoginPage;
