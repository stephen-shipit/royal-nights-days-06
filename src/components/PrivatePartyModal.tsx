import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PrivatePartyModalProps {
  onOpenReservationModal?: () => void;
}

const PrivatePartyModal = ({ onOpenReservationModal }: PrivatePartyModalProps) => {
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

  const handleReserveTable = () => {
    setIsOpen(false);
    // Open the reservation modal via the callback
    onOpenReservationModal?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-screen md:h-auto max-h-screen md:max-h-none p-0 border-0 bg-transparent my-0 md:my-4 [&>button]:text-white md:[&>button]:text-black [&>button]:opacity-90 [&>button:hover]:opacity-100 [&>button>svg]:h-5 [&>button>svg]:w-5 md:[&>button>svg]:h-4 md:[&>button>svg]:w-4">
        <div className="relative bg-card rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full md:h-[600px]">
          
          <div className="grid md:grid-cols-2 flex-1 md:flex-none overflow-y-auto md:overflow-hidden">
            {/* Image Half */}
            <div className="relative h-64 md:h-[600px] overflow-hidden">
              <img
                src="/lovable-uploads/c6341962-1434-4b49-9e1b-0c9059e9748f.png"
                alt="Private party celebration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>

            {/* Content Half */}
            <div className="flex flex-col h-full">
              <div className="p-8 flex-1 overflow-y-auto md:flex md:flex-col md:justify-center space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    Host Your Private Event
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
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
              </div>

              {/* Sticky buttons container for mobile */}
              <div className="sticky bottom-0 bg-card p-6 border-t md:border-t-0 md:p-8 md:static">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleBookNow}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Plan Your Event
                  </Button>
                  
                  <Button
                    onClick={handleReserveTable}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    Reserve a Table
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivatePartyModal;