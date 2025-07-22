import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Music, Mic, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  dj?: string;
  host?: string;
  description: string;
  category: string;
  price: string;
};

const EventsSection = () => {
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
        .order('date', { ascending: true })
        .limit(5);
      
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

  const today = new Date().toISOString().split('T')[0];
  const todaysEvents = events.filter(event => event.date === today);
  const upcomingEvents = events.filter(event => event.date > today);
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Today's Events */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Today's Events</h2>
            <p className="text-lg text-muted-foreground">Live entertainment happening tonight</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : todaysEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No events scheduled for today</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {todaysEvents.map((event) => (
                <Card key={event.id} className="border-secondary/20 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-secondary" />
                      </div>
                      <Badge variant="secondary">{event.category}</Badge>
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
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Upcoming Events</h2>
            <p className="text-lg text-muted-foreground">Don't miss these exciting upcoming shows</p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No upcoming events scheduled</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="border-secondary/20 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-secondary" />
                      </div>
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
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
              ))}
            </div>
          )}

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