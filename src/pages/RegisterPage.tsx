
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Simule l'inscription – dans une vraie app, il faudrait connecter à Supabase/auth
const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    // Ici, on simule une inscription réussie
    setTimeout(() => {
      setLoading(false);
      toast.success("Inscription réussie !", {
        description: "Votre compte a été créé. Connectez-vous maintenant.",
      });
      navigate("/login");
    }, 1200);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Inscription d'une nouvelle ferme</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1" htmlFor="name">Nom de la ferme</label>
              <Input required autoFocus id="name" name="name" value={form.name} onChange={handleChange} placeholder="Nom de la ferme" />
            </div>
            <div>
              <label className="block mb-1" htmlFor="email">Email</label>
              <Input required id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Adresse email" />
            </div>
            <div>
              <label className="block mb-1" htmlFor="password">Mot de passe</label>
              <Input required id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" />
            </div>
            <div>
              <label className="block mb-1" htmlFor="confirmPassword">Confirmer mot de passe</label>
              <Input required id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirmer mot de passe" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création du compte..." : "Créer mon compte"}
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={() => navigate("/login")}>
              Retour à la connexion
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-3 text-xs text-muted-foreground text-center">
        Votre compte sera soumis à validation par un administrateur si besoin.
      </div>
    </div>
  );
};

export default RegisterPage;
