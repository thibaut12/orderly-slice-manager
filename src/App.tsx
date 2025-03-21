
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";

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
import Summary from "./pages/summary/Summary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Routes Clients */}
            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            
            {/* Routes Produits */}
            <Route path="/products" element={<ProductsList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
            {/* Routes Commandes */}
            <Route path="/orders" element={<OrdersList />} />
            <Route path="/orders/new" element={<OrderCreate />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            
            {/* Routes Journées de découpe */}
            <Route path="/cutting-days" element={<CuttingDaysList />} />
            <Route path="/cutting-days/:id" element={<CuttingDayDetail />} />
            
            {/* Synthèse */}
            <Route path="/summary" element={<Summary />} />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
