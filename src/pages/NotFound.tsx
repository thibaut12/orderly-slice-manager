
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-8 glass-panel rounded-lg animate-slide-in">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas.
        </p>
        <Button 
          className="button-effect"
          onClick={() => navigate("/")}
        >
          <Home className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
