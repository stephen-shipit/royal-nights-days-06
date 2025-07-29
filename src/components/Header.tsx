import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md hidden md:block">
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/lovable-uploads/b1de9097-e588-47f5-b0ac-d02227d99623.png" alt="Royal Palace Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground tracking-wide">
                ROYAL PALACE
              </h1>
              <p className="text-xs text-secondary uppercase tracking-widest">Restaurant & Lounge</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            <Link to="/" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Home
            </Link>
            <Link to="/menu" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Menu
            </Link>
            <Link to="/reservations?showModal=true" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Reservations
            </Link>
            <Link to="/gallery" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Gallery
            </Link>
            <Link to="/events" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Events
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghostGold" size="sm" asChild>
              <a href="tel:+12145565711">
                Call Us (214) 556-5711
              </a>
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