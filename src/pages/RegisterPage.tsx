
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const RegisterPage = () => {
  const [form, setForm] = useState({
    farmName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
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
      console.error("Erreur lors de l'inscription:", error);
      toast.error("Erreur lors de l'inscription", {
        description: "Une erreur est survenue. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création du compte..." : "Créer mon compte"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
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
