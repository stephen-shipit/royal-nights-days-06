import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-secondary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-wide">
                ROYAL PALACE
              </h1>
              <p className="text-xs text-secondary uppercase tracking-widest">Restaurant & Lounge</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Home
            </Link>
            <Link to="/menu" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Menu
            </Link>
            <button 
              onClick={() => {
                if (window.location.pathname === '/reservations') {
                  // If already on reservations page, trigger modal directly
                  window.dispatchEvent(new CustomEvent('openReservationModal'));
                } else {
                  // Navigate to reservations page
                  window.location.href = '/reservations';
                }
              }}
              className="text-primary-foreground hover:text-secondary transition-colors duration-300 bg-transparent border-none cursor-pointer"
            >
              Reservations
            </button>
            <Link to="/gallery" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Gallery
            </Link>
            <Link to="/events" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Events
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghostGold" size="sm" className="hidden md:inline-flex">
              Call Us
            </Button>
            <Button variant="luxury" size="sm" asChild>
              <Link to="/reservations">Reserve Table</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;