import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PrivatePartyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleBookNow = () => {
    navigate("/plan-event");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 bg-transparent my-4">
        <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/20 p-2 text-white hover:bg-black/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="grid md:grid-cols-2 min-h-[400px]">
            {/* Image Half */}
            <div className="relative h-80 md:h-auto">
              <img
                src="/lovable-uploads/c6341962-1434-4b49-9e1b-0c9059e9748f.png"
                alt="Private party celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>

            {/* Content Half */}
            <div className="p-8 flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Host Your Private Event
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Transform your special occasions into unforgettable experiences. 
                  Whether it's a birthday celebration, networking event, product launch, 
                  or corporate gathering, our elegant venue provides the perfect backdrop 
                  for your exclusive event.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>✨ Customizable menus & private dining areas</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>🎵 Professional entertainment & sound system</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>🍾 Dedicated event coordination team</span>
                </div>
              </div>

              <Button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Plan Your Event
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivatePartyModal;