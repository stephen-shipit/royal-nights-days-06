import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Music, Search, Filter, Users, DollarSign } from "lucide-react";
import { useState } from "react";

const upcomingEvents = [
  {
    id: 1,
    title: "Saturday Night Live DJ Set",
    date: "2024-01-20",
    time: "9:00 PM - 2:00 AM",
    dj: "DJ Marco Villa",
    description: "Experience the hottest beats with international DJ Marco Villa spinning the latest house and techno tracks.",
    image: "/api/placeholder/400/250",
    price: "Free Entry",
    category: "Nightlife",
    priceRange: "free"
  },
  {
    id: 2,
    title: "Wine Tasting Dinner",
    date: "2024-01-25",
    time: "6:30 PM - 9:30 PM",
    host: "Sommelier Antonio",
    description: "Join our expert sommelier for an evening of exceptional wines paired with our signature dishes.",
    image: "/api/placeholder/400/250",
    price: "$125 per person",
    category: "Dining",
    priceRange: "expensive"
  },
  {
    id: 3,
    title: "Comedy Night with Alex Rivers",
    date: "2024-01-18",
    time: "8:00 PM - 11:00 PM",
    host: "Alex Rivers",
    description: "Stand-up comedy featuring local and touring comedians for a night of laughter and entertainment.",
    image: "/api/placeholder/400/250",
    price: "$25 per person",
    category: "Comedy Show",
    priceRange: "moderate"
  },
  {
    id: 4,
    title: "Spoken Word Poetry Night",
    date: "2024-01-22",
    time: "7:00 PM - 10:00 PM",
    host: "Local Artists Collective",
    description: "An intimate evening of spoken word poetry, storytelling, and artistic expression.",
    image: "/api/placeholder/400/250",
    price: "Free Entry",
    category: "Spoken Word",
    priceRange: "free"
  },
  {
    id: 5,
    title: "Live Jazz Night",
    date: "2024-02-14",
    time: "7:00 PM - 11:00 PM",
    host: "The Royal Jazz Trio",
    description: "Enjoy an intimate evening with live jazz music while savoring our chef's special Valentine's menu.",
    image: "/api/placeholder/400/250",
    price: "$85 per person",
    category: "Live Music",
    priceRange: "expensive"
  },
  {
    id: 6,
    title: "New Year's Eve Gala",
    date: "2024-12-31",
    time: "8:00 PM - 3:00 AM",
    dj: "Special Guest DJ",
    description: "Ring in the New Year with style at our exclusive gala featuring live entertainment, premium drinks, and midnight champagne toast.",
    image: "/api/placeholder/400/250",
    price: "$200 per person",
    category: "Special Event",
    priceRange: "expensive"
  }
];

const categories = ["All", "Nightlife", "Dining", "Live Music", "Comedy Show", "Spoken Word", "Special Event"];
const priceRanges = ["All", "Free", "Under $50", "$50-$100", "Over $100"];

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesPrice = true;
    if (selectedPriceRange === "Free") {
      matchesPrice = event.priceRange === "free";
    } else if (selectedPriceRange === "Under $50") {
      matchesPrice = event.priceRange === "moderate" || event.priceRange === "free";
    } else if (selectedPriceRange === "$50-$100") {
      matchesPrice = event.priceRange === "expensive";
    } else if (selectedPriceRange === "Over $100") {
      matchesPrice = event.priceRange === "expensive";
    }
    
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Upcoming Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join us for exclusive dining experiences, live entertainment, and unforgettable nights
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-80 flex-shrink-0">
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
              <div className="grid lg:grid-cols-2 gap-6 mb-12">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video">
                      <img
                        src={event.image}
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
                      <Button className="w-full" variant="luxury">
                        Reserve for This Event
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

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
    </div>
  );
};

export default Events;