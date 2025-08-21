import { X, Crown, Calendar, Clock, MapPin, Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface KickoffEventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
}

export default function KickoffEventDrawer({ isOpen, onClose, onRegister }: KickoffEventDrawerProps) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate countdown to Sep 11, 2025
  useEffect(() => {
    const targetDate = new Date('2025-09-11T16:00:00');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-black border-t-2 border-secondary",
        "transform transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-secondary transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto">
          {/* Hero Image */}
          <div className="relative h-48 md:h-64 overflow-hidden">
            <img 
              src="/lovable-uploads/1e23e4ca-958c-4d13-80f8-9ed4516de8af.png"
              alt="Royal Mic Kickoff Event"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="flex items-center space-x-3 mb-2">
                <Crown className="w-8 h-8 text-secondary" />
                <h2 className="text-3xl md:text-4xl font-bold text-white">Kickoff Event</h2>
              </div>
              <p className="text-secondary text-xl font-semibold">The Royal Mic Thursdays Launch</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <Calendar className="w-6 h-6 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-secondary font-semibold">Date</p>
                  <p className="text-white">Thursday, Sep 11, 2025</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <Clock className="w-6 h-6 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-secondary font-semibold">Time</p>
                  <p className="text-white">4:00 PM - 9:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <MapPin className="w-6 h-6 text-secondary flex-shrink-0" />
                <div>
                  <p className="text-secondary font-semibold">Location</p>
                  <p className="text-white">Royal Palace, Dallas</p>
                </div>
              </div>
            </div>

            {/* Prize Highlight */}
            <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-6 rounded-xl border border-secondary/30 mb-8">
              <div className="flex items-center space-x-4">
                <Trophy className="w-12 h-12 text-secondary" />
                <div>
                  <h3 className="text-2xl font-bold text-secondary mb-1">$1,000 in Cash Prizes</h3>
                  <p className="text-white/80">Compete for the biggest prizes of the week at our launch event</p>
                </div>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Timer className="w-6 h-6 text-secondary" />
                <h3 className="text-2xl font-bold text-white">Time Until Kickoff</h3>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
                {Object.entries(countdown).map(([unit, value]) => (
                  <div key={unit} className="bg-secondary/10 p-3 md:p-4 rounded-lg border border-secondary/20">
                    <div className="text-2xl md:text-3xl font-bold text-secondary">{value}</div>
                    <div className="text-xs md:text-sm text-white/70 capitalize">{unit}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-secondary mb-2">🎉 Opening Night Exclusive</h4>
                <p className="text-white/80">Special red carpet entrance and professional photography</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-lg font-bold text-secondary mb-2">📺 Live Stream</h4>
                <p className="text-white/80">Event will be broadcast live on Royal Palace social media</p>
              </div>
            </div>
          </div>

          {/* Sticky CTA */}
          <div className="sticky bottom-0 bg-black border-t border-secondary/20 p-4">
            <Button 
              onClick={onRegister}
              className="w-full bg-secondary text-black font-bold py-4 text-lg hover:bg-secondary/90 transition-colors"
            >
              Register to Perform at Kickoff Event
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}