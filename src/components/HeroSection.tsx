import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-royal-palace.jpg";

const HeroSection = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${heroImage})`
      }}
    >
      <div className="absolute inset-0 hero-overlay"></div>
      
      <div className="relative z-10 text-center text-primary-foreground px-6 max-w-4xl mx-auto">
        {/* Crown Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary font-['Playfair_Display']">♔</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 font-['Playfair_Display'] tracking-wide">
          ROYAL PALACE
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 luxury-text font-light tracking-widest">
          RESTAURANT & LOUNGE
        </p>
        
        <p className="text-lg md:text-xl mb-12 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
          A fusion of Mediterranean & American flavors in an atmosphere of refined elegance
        </p>

        {/* Dual CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <div className="text-center">
            <Button variant="royal" size="xl" className="w-64 mb-2">
              Dine With Us
            </Button>
            <p className="text-sm text-secondary">Wed - Sun • 3PM - 9PM</p>
          </div>
          
          <div className="hidden md:block w-px h-16 bg-secondary/30"></div>
          
          <div className="text-center">
            <Button variant="luxury" size="xl" className="w-64 mb-2">
              Reserve Night Table
            </Button>
            <p className="text-sm text-secondary">Wed - Sun • 9PM - 5AM</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-secondary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-secondary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;