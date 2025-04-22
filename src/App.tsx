import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import ClientsList from "./pages/clients/ClientsList";
import ClientDetail from "./pages/clients/ClientDetail";
import ProductsList from "./pages/products/ProductsList";
import ProductDetail from "./pages/products/ProductDetail";
import OrdersList from "./pages/orders/OrdersList";
import OrderCreate from "./pages/orders/OrderCreate";
import OrderDetail from "./pages/orders/OrderDetail";
import CuttingDaysList from "./pages/cuttingDays/CuttingDaysList";
import CuttingDayDetail from "./pages/cuttingDays/CuttingDayDetail";
import ProductionsList from "./pages/productions/ProductionsList";
import ProductionDetail from "./pages/productions/ProductionDetail";
import Summary from "./pages/summary/Summary";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import UsersList from "./pages/users/UsersList";
import Paiement from "./pages/Paiement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Route publique pour la connexion */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Routes protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Routes Clients */}
              <Route path="/clients" element={
                <ProtectedRoute>
                  <ClientsList />
                </ProtectedRoute>
              } />
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <ClientDetail />
                </ProtectedRoute>
              } />
              
              {/* Routes Produits */}
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsList />
                </ProtectedRoute>
              } />
              <Route path="/products/:id" element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              } />
              
              {/* Routes Commandes */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersList />
                </ProtectedRoute>
              } />
              <Route path="/orders/new" element={
                <ProtectedRoute>
                  <OrderCreate />
                </ProtectedRoute>
              } />
              <Route path="/orders/:id" element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } />
              
              {/* Routes Journées de découpe */}
              <Route path="/cutting-days" element={
                <ProtectedRoute>
                  <CuttingDaysList />
                </ProtectedRoute>
              } />
              <Route path="/cutting-days/:id" element={
                <ProtectedRoute>
                  <CuttingDayDetail />
                </ProtectedRoute>
              } />
              
              {/* Routes Productions (traçabilité) */}
              <Route path="/productions" element={
                <ProtectedRoute>
                  <ProductionsList />
                </ProtectedRoute>
              } />
              <Route path="/productions/:id" element={
                <ProtectedRoute>
                  <ProductionDetail />
                </ProtectedRoute>
              } />
              
              {/* Gestion des utilisateurs */}
              <Route path="/users" element={
                <ProtectedRoute>
                  <UsersList />
                </ProtectedRoute>
              } />
              
              {/* Synthèse */}
              <Route path="/summary" element={
                <ProtectedRoute>
                  <Summary />
                </ProtectedRoute>
              } />
              
              {/* Paiement */}
              <Route path="/paiement" element={
                <ProtectedRoute>
                  <Paiement />
                </ProtectedRoute>
              } />
              
              {/* Redirection par défaut vers la connexion */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
