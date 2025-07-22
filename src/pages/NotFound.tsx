import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <div className="pt-20 pb-20 md:pb-0 flex items-center justify-center min-h-screen">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold mb-4 text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
          <a href="/" className="text-primary hover:text-secondary underline">
            Return to Home
          </a>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default NotFound;
