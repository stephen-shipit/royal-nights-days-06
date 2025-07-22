import { Home, UtensilsCrossed, Calendar, Camera, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: UtensilsCrossed, label: "Menu", path: "/menu" },
    { icon: Calendar, label: "Reserve", path: "/reservations" },
    { icon: Camera, label: "Gallery", path: "/gallery" },
    { icon: Users, label: "Events", path: "/events" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-t border-secondary/20 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200",
                isActive 
                  ? "text-secondary" 
                  : "text-primary-foreground/70 hover:text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;