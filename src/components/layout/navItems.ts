
import { Home, Users, Package, ShoppingBag, Scissors, FileText, FlaskConical, LogOut, UserCog, CreditCard } from 'lucide-react';
import { NavItem } from './types';

export const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/",
    icon: Home
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users
  },
  {
    title: "Produits",
    href: "/products",
    icon: Package
  },
  {
    title: "Commandes",
    href: "/orders",
    icon: ShoppingBag
  },
  {
    title: "Journées de découpe",
    href: "/cutting-days",
    icon: Scissors
  },
  {
    title: "Traçabilité",
    href: "/productions",
    icon: FlaskConical
  },
  {
    title: "Synthèse",
    href: "/summary",
    icon: FileText
  },
  {
    title: "Abonnement",
    href: "/paiement",
    icon: CreditCard
  },
  {
    title: "Utilisateurs",
    href: "/users",
    icon: UserCog,
    adminOnly: true
  },
  {
    title: "Admin Abonnements",
    href: "/admin/subscriptions",
    icon: CreditCard,
    adminOnly: true
  }
];
