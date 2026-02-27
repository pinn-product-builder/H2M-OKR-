import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-muted-foreground">Página não encontrada</p>
        <p className="text-sm text-muted-foreground">
          O endereço <code className="bg-muted px-2 py-1 rounded text-xs">{location.pathname}</code> não existe.
        </p>
        <Button asChild className="gap-2">
          <a href="/">
            <Home className="w-4 h-4" />
            Voltar ao Início
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
