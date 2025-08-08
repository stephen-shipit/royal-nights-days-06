import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AtmosphereSection = () => {
  const navigate = useNavigate();

  const handleExploreVenue = () => {
    navigate('/gallery?tab=venue');
  };

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image First */}
          <div className="relative order-2 md:order-1">
            <div className="elegant-shadow rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <img 
                src="/lovable-uploads/57e58594-bfe5-4bfa-ac83-a2c38683cf90.png" 
                alt="Upscale lounge atmosphere"
                className="w-full h-[600px] object-cover"
              />
            </div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center gold-glow">
              <span className="text-primary text-4xl">♕</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-8 order-1 md:order-2">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                INDULGE IN THE
              </h2>
              <h3 className="text-3xl md:text-4xl luxury-text font-bold mb-8">
                REFINED ATMOSPHERE
              </h3>
            </div>
            
            <div className="space-y-6 text-lg text-primary-foreground/90 leading-relaxed">
              <p>
                Experience unparalleled luxury in our meticulously designed space. From intimate 
                dining alcoves to our sophisticated lounge areas, every corner reflects our 
                commitment to elegance and comfort.
              </p>
              <p>
                Our carefully curated ambiance transforms throughout the evening - from refined 
                dining atmosphere to vibrant social destination, creating the perfect setting 
                for any occasion.
              </p>
              <p>
                Whether celebrating a special milestone or enjoying an evening out, Royal Palace 
                provides the perfect backdrop for memorable experiences.
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="luxury" size="lg" onClick={handleExploreVenue}>
                Explore Our Venue
              </Button>
              <p className="text-sm text-secondary">
                Virtual tour and photo gallery available
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-secondary/20">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Private Dining Rooms</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Premium Bar Service</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">Live Entertainment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm">VIP Bottle Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AtmosphereSection;