import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

type FeaturedEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  image_url?: string;
  price: string;
  category: string;
  featured: boolean;
  tickets_url?: string;
};

const FeaturedEventsCarousel = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFlyerModal, setShowFlyerModal] = useState(false);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('featured', true)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching featured events:', error);
      } else {
        setFeaturedEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching featured events:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  if (loading || featuredEvents.length === 0) {
    return null;
  }

  const currentEvent = featuredEvents[currentSlide];

  return (
    <div className="relative mb-8 md:mb-16 overflow-hidden md:rounded-2xl">
      <Card className="border-0 overflow-hidden rounded-none md:rounded-2xl">
        <div className="relative h-[500px] md:h-[600px]">
          {/* Background Image - Blurred */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${currentEvent.image_url || '/api/placeholder/1200/600'})`,
              filter: 'blur(8px)',
              transform: 'scale(1.1)',
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Content */}
          <CardContent className="relative h-full flex items-center justify-between p-6 pb-16 md:p-16">
            {/* Left Content */}
            <div className="flex-1 max-w-2xl text-white animate-fade-in pr-8">
              <Badge variant="secondary" className="mb-4 bg-secondary/20 text-white border-secondary/30">
                Featured Event
              </Badge>
              
              {/* Mobile: Thumbnail + Title on same line */}
              <div className="flex items-center gap-3 mb-3 md:mb-4 md:block">
                <button
                  onClick={() => setShowFlyerModal(true)}
                  className="w-16 h-16 flex-shrink-0 md:hidden rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={currentEvent.image_url || '/api/placeholder/80/80'}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover"
                  />
                </button>
                <h1 className="text-2xl md:text-6xl font-bold leading-tight line-clamp-2 md:line-clamp-none">
                  {currentEvent.title}
                </h1>
              </div>
              
              <div className="flex items-center gap-2 mb-4 md:mb-6 text-base md:text-lg">
                <Calendar className="w-4 md:w-5 h-4 md:h-5 flex-shrink-0" />
                <span className="line-clamp-1 md:line-clamp-none">
                  {new Date(currentEvent.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })} at {currentEvent.time}
                </span>
              </div>
              
              <p className="text-base md:text-xl mb-6 md:mb-8 text-white/90 leading-relaxed line-clamp-2 md:line-clamp-none">
                {currentEvent.description}
              </p>
              
              <div className="flex flex-row gap-1 sm:gap-2">
                {currentEvent.tickets_url && (
                  <Button 
                    size="lg" 
                    variant="royal"
                    className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 hover-scale flex-1"
                    onClick={() => window.open(currentEvent.tickets_url, '_blank')}
                  >
                    Buy Tickets
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="royal"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 hover-scale flex-1"
                  onClick={() => navigate(`/events/${currentEvent.id}`)}
                >
                  Reserve Table
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 flex-1"
                  onClick={() => navigate('/events')}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="hidden md:block flex-shrink-0 w-80 h-96">
              <img
                src={currentEvent.image_url || '/api/placeholder/400/600'}
                alt={currentEvent.title}
                className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/20"
              />
            </div>
          </CardContent>

          {/* Navigation Arrows */}
          {featuredEvents.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover-scale"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all hover-scale"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {featuredEvents.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
      
      {/* Flyer Modal */}
      <Dialog open={showFlyerModal} onOpenChange={setShowFlyerModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95">
          <button
            onClick={() => setShowFlyerModal(false)}
            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={currentEvent.image_url || '/api/placeholder/800/1200'}
              alt={currentEvent.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeaturedEventsCarousel;