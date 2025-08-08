import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PrivatePartyModalProps {
  onOpenReservationModal?: () => void;
}

interface ModalContent {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  primary_button_text: string;
  primary_button_action: string;
  secondary_button_text: string;
  secondary_button_action: string;
  is_active: boolean;
}

const PrivatePartyModal = ({ onOpenReservationModal }: PrivatePartyModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModalContent = async () => {
      const { data } = await supabase
        .from("home_modals")
        .select("*")
        .eq("is_active", true);
      
      if (data && data.length > 0) {
        // Get seen modals from localStorage
        const seenModals = JSON.parse(localStorage.getItem('seenModals') || '[]');
        
        // Filter out already seen modals
        const unseenModals = data.filter(modal => !seenModals.includes(modal.id));
        
        let selectedModal;
        if (unseenModals.length > 0) {
          // Show unseen modal
          selectedModal = unseenModals[Math.floor(Math.random() * unseenModals.length)];
        } else {
          // All modals seen, clear the list and start over
          localStorage.setItem('seenModals', '[]');
          selectedModal = data[Math.floor(Math.random() * data.length)];
        }
        
        // Mark this modal as seen
        const updatedSeenModals = [...seenModals, selectedModal.id];
        localStorage.setItem('seenModals', JSON.stringify(updatedSeenModals));
        
        setModalContent(selectedModal);
      }
    };

    fetchModalContent();
  }, []);

  useEffect(() => {
    if (modalContent) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [modalContent]);

  const handlePrimaryAction = () => {
    if (!modalContent) return;
    
    setIsOpen(false);
    
    const action = modalContent.primary_button_action;
    
    if (action.startsWith('event:')) {
      const eventId = action.split(':')[1];
      navigate(`/events/${eventId}`);
    } else if (action.startsWith('menu-item:')) {
      const menuItemId = action.split(':')[1];
      navigate(`/menu/${menuItemId}`);
    } else {
      switch (action) {
        case "plan-event":
          navigate("/plan-event");
          break;
        case "reservation":
          onOpenReservationModal?.();
          break;
        case "menu":
          navigate("/menu");
          break;
        case "events":
          navigate("/events");
          break;
        default:
          navigate("/plan-event");
      }
    }
  };

  const handleSecondaryAction = () => {
    if (!modalContent) return;
    
    setIsOpen(false);
    
    const action = modalContent.secondary_button_action;
    
    if (action.startsWith('event:')) {
      const eventId = action.split(':')[1];
      navigate(`/events/${eventId}`);
    } else if (action.startsWith('menu-item:')) {
      const menuItemId = action.split(':')[1];
      navigate(`/menu/${menuItemId}`);
    } else {
      switch (action) {
        case "plan-event":
          navigate("/plan-event");
          break;
        case "reservation":
          onOpenReservationModal?.();
          break;
        case "menu":
          navigate("/menu");
          break;
        case "events":
          navigate("/events");
          break;
        default:
          onOpenReservationModal?.();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-screen md:h-auto max-h-screen md:max-h-none p-0 border-0 bg-transparent my-0 md:my-4 [&>button]:text-white md:[&>button]:text-black [&>button]:opacity-90 [&>button:hover]:opacity-100 [&>button>svg]:h-5 [&>button>svg]:w-5 md:[&>button>svg]:h-4 md:[&>button>svg]:w-4 [&>button]:hidden md:[&>button]:flex">
        <div className="relative bg-card rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full md:h-[600px]">
          {/* Mobile close button */}
          <div className="md:hidden absolute top-8 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 flex-1 md:flex-none overflow-y-auto md:overflow-hidden">
            {/* Image Half */}
            <div className="relative h-64 md:h-[600px] overflow-hidden">
              <img
                src={modalContent?.image_url || "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop"}
                alt={modalContent?.title || "Private party celebration"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>

            {/* Content Half */}
            <div className="flex flex-col h-full">
              <div className="p-8 pt-12 md:pt-8 flex-1 overflow-y-auto md:flex md:flex-col md:justify-center space-y-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {modalContent?.title || "Host Your Private Event"}
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    {modalContent?.description || "Transform your special occasions into unforgettable experiences."}
                  </p>
                </div>
              </div>

              {/* Sticky buttons container for mobile */}
              <div className="sticky bottom-0 bg-card p-6 pb-8 border-t md:border-t-0 md:p-8 md:pb-8 md:static">
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handlePrimaryAction}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {modalContent?.primary_button_text || "Plan Your Event"}
                  </Button>
                  
                  <Button
                    onClick={handleSecondaryAction}
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    {modalContent?.secondary_button_text || "Reserve a Table"}
                  </Button>
                  
                  {/* Mobile close button in button area */}
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    className="md:hidden w-full text-muted-foreground hover:text-foreground py-2"
                  >
                    Close
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