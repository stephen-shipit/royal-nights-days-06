import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Music, Search, Filter, Users, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  dj?: string;
  host?: string;
  description: string;
  image_url?: string;
  price: string;
  category: string;
  price_range: string;
};

const categories = ["All", "Nightlife", "Dining", "Live Music", "Comedy Show", "Spoken Word", "Special Event"];
const priceRanges = ["All", "Free", "Under $50", "$50-$100", "Over $100"];

const Events = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (selectedPriceRange === "Free") {
      matchesPrice = event.price_range === "free";
    } else if (selectedPriceRange === "Under $50") {
      matchesPrice = event.price_range === "moderate" || event.price_range === "free";
    } else if (selectedPriceRange === "$50-$100") {
      matchesPrice = event.price_range === "expensive";
    } else if (selectedPriceRange === "Over $100") {
      matchesPrice = event.price_range === "expensive";
    }
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      <div className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join us for exclusive dining experiences, live entertainment, and unforgettable nights
            </p>
          </div>

          {/* Mobile Filter Section */}
          <div className="lg:hidden mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Events</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Event Category</label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedCategory === category
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price Range
                    </label>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <button
                          key={range}
                          onClick={() => setSelectedPriceRange(range)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedPriceRange === range
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {filteredEvents.length} events found
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Events Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">Loading events...</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
                  {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video">
                      <img
                        src={event.image_url || '/api/placeholder/400/250'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span className="text-lg font-bold text-secondary">{event.price}</span>
                      </div>
                      <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        {event.dj && (
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span>{event.dj}</span>
                          </div>
                        )}
                        {event.host && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>Hosted by {event.host}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <Button 
                        className="w-full" 
                        variant="luxury"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        Reserve for This Event
                      </Button>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}

              {/* Group Booking Section */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-secondary/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-4">Group Bookings & Private Events</CardTitle>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Planning a special celebration? Let us create an unforgettable experience for your group with customized menus, dedicated service, and exclusive access to our venue.
                  </p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">Corporate Events</h3>
                      <p className="text-sm text-muted-foreground">Professional venues for meetings, conferences, and team building</p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">Private Celebrations</h3>
                      <p className="text-sm text-muted-foreground">Birthdays, anniversaries, and special occasions</p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">Wedding Receptions</h3>
                      <p className="text-sm text-muted-foreground">Elegant wedding celebrations with personalized service</p>
                    </div>
                  </div>
                  <Button variant="royal" size="lg">
                    Plan Your Event
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Events;