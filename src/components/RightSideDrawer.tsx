import { X, Calendar, Clock, MapPin, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RightSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'auditions' | 'events';
  onBookAudition?: () => void;
}

const auditionDates = [
  { date: 'Aug 26, 2025', status: 'available' },
  { date: 'Sep 2, 2025', status: 'available' },
  { date: 'Sep 9, 2025', status: 'available' },
];

const eventDates = [
  { date: 'Sep 11, 2025', special: true, note: 'Kickoff Event - $1,000 Prizes' },
  { date: 'Sep 18, 2025', special: false },
  { date: 'Sep 25, 2025', special: false },
  { date: 'Oct 2, 2025', special: true, note: '$1,000 Prize Week' },
  { date: 'Oct 9, 2025', special: false },
  { date: 'Oct 16, 2025', special: false },
  { date: 'Oct 23, 2025', special: false },
  { date: 'Oct 30, 2025', special: true, note: 'Halloween Special - $1,000 Prizes' },
];

export default function RightSideDrawer({ isOpen, onClose, type, onBookAudition }: RightSideDrawerProps) {
  if (!isOpen) return null;

  const isAuditions = type === 'auditions';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full md:w-[40%] bg-black border-l-2 border-secondary z-50",
        "transform transition-transform duration-300 ease-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-secondary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {isAuditions ? 'Audition to Perform' : 'Royal Mic Thursdays Schedule'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-secondary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {isAuditions && (
            <p className="text-secondary mt-2">Secure your spot on the Royal Mic stage</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {isAuditions ? (
            <>
              {/* Venue Info */}
              <div className="mb-8 p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                <div className="flex items-center space-x-3 mb-4">
                  <MapPin className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-bold text-white">Audition Venue</h3>
                </div>
                <p className="text-white mb-2">Royal Palace, Addison</p>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  <p className="text-white/80">Tuesdays, 5:00 PM - 8:00 PM</p>
                </div>
                <p className="text-secondary text-sm mt-2">*Venue closed to public during auditions</p>
              </div>

              {/* Audition Dates */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Upcoming Audition Dates</h3>
                <div className="space-y-3">
                  {auditionDates.map((audition, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-secondary" />
                        <span className="text-white font-medium">{audition.date}</span>
                      </div>
                      <span className="text-secondary text-sm">Available</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audition Requirements */}
              <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-bold text-secondary mb-4">What to Bring</h3>
                <ul className="space-y-2 text-white/80">
                  <li>• 3-5 minute performance piece</li>
                  <li>• Your own backing tracks (if needed)</li>
                  <li>• Valid ID</li>
                  <li>• Professional attitude and energy</li>
                </ul>
              </div>

              {/* CTA */}
              <Button 
                onClick={onBookAudition}
                className="w-full bg-secondary text-black font-bold py-4 text-lg hover:bg-secondary/90 transition-colors"
              >
                Book Your Audition
              </Button>
            </>
          ) : (
            <>
              {/* Event Schedule */}
              <div className="space-y-4">
                {eventDates.map((event, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-4 rounded-lg border transition-colors",
                      event.special 
                        ? "bg-secondary/10 border-secondary/30 hover:bg-secondary/20" 
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className={cn(
                          "w-5 h-5",
                          event.special ? "text-secondary" : "text-white/60"
                        )} />
                        <span className="text-white font-medium">{event.date}</span>
                        {event.special && (
                          <Trophy className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <Clock className="w-4 h-4 text-white/40" />
                    </div>
                    
                    {event.note && (
                      <p className="text-secondary text-sm mt-2 font-medium">{event.note}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2 text-white/60 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Royal Palace • 4:00 PM - 9:00 PM</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Event Info */}
              <div className="mt-8 p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-6 h-6 text-secondary" />
                  <h3 className="text-xl font-bold text-white">Event Highlights</h3>
                </div>
                <ul className="space-y-2 text-white/80">
                  <li>• 12-15 performers each week</li>
                  <li>• Live audience voting via QR codes</li>
                  <li>• Professional sound and lighting</li>
                  <li>• Social media coverage for winners</li>
                  <li>• Networking opportunities with industry professionals</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}