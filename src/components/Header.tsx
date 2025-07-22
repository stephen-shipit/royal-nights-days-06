import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-secondary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl font-['Playfair_Display']">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground font-['Playfair_Display'] tracking-wide">
                ROYAL PALACE
              </h1>
              <p className="text-xs text-secondary uppercase tracking-widest">Restaurant & Lounge</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#dining" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Dining
            </a>
            <a href="#nightlife" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Nightlife
            </a>
            <a href="#menu" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Menu
            </a>
            <a href="#gallery" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Gallery
            </a>
            <a href="#events" className="text-primary-foreground hover:text-secondary transition-colors duration-300">
              Events
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghostGold" size="sm" className="hidden md:inline-flex">
              Call Us
            </Button>
            <Button variant="luxury" size="sm">
              Reserve Table
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;