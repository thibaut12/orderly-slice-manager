
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RegisterPage = () => {
  const [form, setForm] = useState({
    farmName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  // Si déjà authentifié, rediriger vers la page d'accueil
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!form.farmName || !form.email || !form.password || !form.confirmPassword) {
      toast.error("Champs obligatoires", {
        description: "Veuillez remplir tous les champs"
      });
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Mot de passe trop court", {
        description: "Le mot de passe doit contenir au moins 6 caractères"
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Tentative d'inscription avec:", form.email);
      const success = await register(form.email, form.password, {
        farm_name: form.farmName,
      });
      
      if (success) {
        toast.success("Inscription réussie !", {
          description: "Votre compte a été créé avec succès.",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Exception lors de l'inscription:", error);
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
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Inscription d'une nouvelle ferme</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="farmName">Nom de la ferme</Label>
              <Input
                required
                id="farmName"
                name="farmName"
                value={form.farmName}
                onChange={handleChange}
                placeholder="Nom de votre ferme"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                required
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                required
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Choisissez un mot de passe"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                required
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
              disabled={loading}
            >
              Retour à la connexion
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-3 text-xs text-muted-foreground text-center">
        Votre compte sera immédiatement activé après l'inscription.
      </div>
    </div>
  );
};

export default RegisterPage;
