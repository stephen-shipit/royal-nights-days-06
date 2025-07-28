import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AtmosphereSection from "@/components/AtmosphereSection";
import HoursSection from "@/components/HoursSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";
import PrivatePartyModal from "@/components/PrivatePartyModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Music, Users } from "lucide-react";

const Index = () => {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const navigate = useNavigate();

  const handleServiceSelection = (service: string) => {
    setShowReservationModal(false);
    
    if (service === "dining") {
      navigate("/reservations");
    } else if (service === "entertainment") {
      navigate("/events");
    } else if (service === "private") {
      navigate("/plan-event");
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <MobileHeader />
      <div className="pb-20 md:pb-0">
        <HeroSection />
        <AboutSection />
        <AtmosphereSection />
        <EventsSection />
        <HoursSection />
        <Footer />
      </div>
      <MobileBottomNav />
      <PrivatePartyModal onOpenReservationModal={() => setShowReservationModal(true)} />
      
      {/* Reservation Selection Modal */}
      <Dialog open={showReservationModal} onOpenChange={setShowReservationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-6">
              What type of reservation would you like to make?
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors duration-200"
              onClick={() => handleServiceSelection("dining")}
            >
              <CardContent className="p-6 text-center">
                <Utensils className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Dining</h3>
                <p className="text-muted-foreground text-sm">
                  Reserve a table for our fine dining experience (3PM - 9PM)
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-primary transition-colors duration-200"
              onClick={() => handleServiceSelection("entertainment")}
            >
              <CardContent className="p-6 text-center">
                <Music className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Entertainment</h3>
                <p className="text-muted-foreground text-sm">
                  Book a table for our nightlife experience (9PM - 5AM)
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-primary transition-colors duration-200"
              onClick={() => handleServiceSelection("private")}
            >
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Private Event</h3>
                <p className="text-muted-foreground text-sm">
                  Host a private group event or special occasion
                </p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
