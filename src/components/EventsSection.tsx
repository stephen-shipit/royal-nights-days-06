import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Music, Mic, Users } from "lucide-react";
import { Link } from "react-router-dom";

const todaysEvents = [
  {
    id: 1,
    title: "Comedy Night with Alex Rivers",
    time: "8:00 PM",
    type: "Comedy Show",
    icon: Mic,
    description: "Stand-up comedy featuring local and touring comedians"
  },
  {
    id: 2,
    title: "Jazz Trio Live",
    time: "9:30 PM",
    type: "Live Music",
    icon: Music,
    description: "Smooth jazz performances in our intimate lounge setting"
  }
];

const upcomingEvents = [
  {
    id: 3,
    title: "Spoken Word Poetry Night",
    date: "Tomorrow",
    time: "7:00 PM",
    type: "Spoken Word",
    icon: Mic,
    price: "Free Entry"
  },
  {
    id: 4,
    title: "Saturday Night Live DJ Set",
    date: "This Saturday", 
    time: "9:00 PM",
    type: "Nightlife",
    icon: Music,
    price: "Free Entry"
  },
  {
    id: 5,
    title: "Wine & Jazz Evening",
    date: "Next Friday",
    time: "6:30 PM", 
    type: "Live Music",
    icon: Music,
    price: "$85 per person"
  }
];

const EventsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Today's Events */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Today's Events</h2>
            <p className="text-lg text-muted-foreground">Live entertainment happening tonight</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {todaysEvents.map((event) => {
              const IconComponent = event.icon;
              return (
                <Card key={event.id} className="border-secondary/20 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-secondary" />
                      </div>
                      <Badge variant="secondary">{event.type}</Badge>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <Button variant="royal" size="sm" asChild>
                      <Link to="/events">View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground">Don't miss these exciting upcoming shows</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {upcomingEvents.map((event) => {
              const IconComponent = event.icon;
              return (
                <Card key={event.id} className="border-secondary/20 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-secondary" />
                      </div>
                      <Badge variant="secondary">{event.type}</Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-secondary">{event.price}</span>
                      <Button variant="luxury" size="sm" asChild>
                        <Link to="/events">Reserve</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <Button variant="royal" size="lg" asChild>
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;