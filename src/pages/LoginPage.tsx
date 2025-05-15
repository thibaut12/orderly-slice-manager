
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Si déjà authentifié, rediriger vers la page d'accueil
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast.error("Champs obligatoires", {
        description: "Veuillez remplir tous les champs"
      });
      return;
    }
    
    setLoading(true);
    try {
      const success = await login(email, password);
      console.log("Résultat de connexion:", success);
      
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error("Exception lors de la connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
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
