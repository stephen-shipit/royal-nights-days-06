import { Button } from "@/components/ui/button";
import { Menu, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-primary border-secondary">
            <div className="flex flex-col space-y-6 mt-8">
              <Link 
                to="/" 
                className="text-primary-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/menu" 
                className="text-primary-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Menu
              </Link>
              <Link 
                to="/reservations" 
                className="text-primary-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Reservations
              </Link>
              <Link 
                to="/gallery" 
                className="text-primary-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Gallery
              </Link>
              <Link 
                to="/events" 
                className="text-primary-foreground hover:text-secondary text-lg font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-sm">R</span>
          </div>
          <span className="text-primary-foreground font-bold text-lg">ROYAL PALACE</span>
        </Link>

        {/* Call Button */}
        <Button variant="ghost" size="sm" className="text-primary-foreground">
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;