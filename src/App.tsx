import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";

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
              {/* Route publique pour l'inscription */}
              <Route path="/register" element={<RegisterPage />} />
              
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
              
              {/* Paiement - accessible à tous les utilisateurs */}
              <Route path="/paiement" element={
                <ProtectedRoute>
                  <Paiement />
                </ProtectedRoute>
              } />
              
              {/* Administration des abonnements - accessible uniquement aux admins */}
              <Route path="/admin/subscriptions" element={
                <ProtectedRoute>
                  <AdminSubscriptions />
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
