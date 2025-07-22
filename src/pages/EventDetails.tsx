import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Music, Users, ArrowLeft, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

type VenueTable = {
  id: string;
  table_number: number;
  max_guests: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_available: boolean;
  reservation_price: number;
  reserved_guests?: number;
  reservation_type?: string;
};

type ReservationForm = {
  guest_name: string;
  guest_email: string;
  guest_count: number;
  special_requests: string;
  reservation_type: 'dining' | 'nightlife';
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [venueTables, setVenueTables] = useState<VenueTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<VenueTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservationForm, setReservationForm] = useState<ReservationForm>({
    guest_name: "",
    guest_email: "",
    guest_count: 1,
    special_requests: "",
    reservation_type: "dining"
  });

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchVenueTables();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Could not load event details",
          variant: "destructive",
        });
      } else {
        setEvent(data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const getCurrentTimeSlot = () => {
    const now = new Date();
    const hour = now.getHours();
    // Nightlife: 9pm (21:00) to 5am (05:00)
    // Dining: 3pm (15:00) to 9pm (21:00)
    if (hour >= 21 || hour < 5) {
      return 'nightlife';
    } else if (hour >= 15 && hour < 21) {
      return 'dining';
    }
    return 'dining'; // Default to dining
  };

  const fetchVenueTables = async () => {
    try {
      // Get venue tables and their reservations for this event
      const { data: tables, error: tablesError } = await supabase
        .from('venue_tables')
        .select('*')
        .order('table_number');

      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        return;
      }

      const currentTimeSlot = getCurrentTimeSlot();
      const timeSlotFilter = currentTimeSlot === 'nightlife' ? '9pm-5am' : '3pm-9pm';

      const { data: reservations, error: reservationsError } = await supabase
        .from('table_reservations')
        .select('table_id, guest_count, reservation_type, time_slot')
        .eq('event_id', eventId)
        .eq('time_slot', timeSlotFilter)
        .eq('status', 'confirmed');

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
        return;
      }

      // Combine tables with reservation data
      const tablesWithReservations = tables?.map(table => {
        const reservation = reservations?.find(r => r.table_id === table.id);
        return {
          ...table,
          reserved_guests: reservation?.guest_count || 0,
          reservation_type: reservation?.reservation_type
        };
      }) || [];

      setVenueTables(tablesWithReservations);
    } catch (error) {
      console.error('Error fetching venue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table: VenueTable) => {
    if (table.reserved_guests && table.reserved_guests > 0) {
      toast({
        title: "Table Unavailable",
        description: "This table is already reserved for this event",
        variant: "destructive",
      });
      return;
    }
    setSelectedTable(table);
  };

  const handleReservation = async () => {
    if (!selectedTable || !event) return;

    if (reservationForm.guest_count > selectedTable.max_guests) {
      toast({
        title: "Too Many Guests",
        description: `This table can accommodate maximum ${selectedTable.max_guests} guests`,
        variant: "destructive",
      });
      return;
    }

    const timeSlot = reservationForm.reservation_type === 'nightlife' ? '9pm-5am' : '3pm-9pm';
    const totalPrice = selectedTable.reservation_price || 0;

    // For nightlife reservations, payment is required
    if (reservationForm.reservation_type === 'nightlife' && totalPrice > 0) {
      toast({
        title: "Payment Required",
        description: "Nightlife reservations require payment processing (feature coming soon)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('table_reservations')
        .insert({
          event_id: event.id,
          table_id: selectedTable.id,
          guest_name: reservationForm.guest_name,
          guest_email: reservationForm.guest_email,
          guest_count: reservationForm.guest_count,
          special_requests: reservationForm.special_requests,
          reservation_type: reservationForm.reservation_type,
          time_slot: timeSlot,
          total_price: totalPrice,
          status: 'confirmed'
        });

      if (error) {
        console.error('Error creating reservation:', error);
        toast({
          title: "Reservation Failed",
          description: "Could not create your reservation. Please try again.",
          variant: "destructive",
        });
      } else {
        const priceText = totalPrice > 0 ? ` for $${(totalPrice / 100).toFixed(2)}` : '';
        toast({
          title: "Reservation Confirmed!",
          description: `Table ${selectedTable.table_number} reserved for ${reservationForm.guest_count} guests (${timeSlot})${priceText}`,
        });
        setSelectedTable(null);
        setReservationForm({
          guest_name: "",
          guest_email: "",
          guest_count: 1,
          special_requests: "",
          reservation_type: "dining"
        });
        fetchVenueTables(); // Refresh table availability
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center h-96">
          <div className="text-center">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 flex items-center justify-center h-96">
          <div className="text-center">Event not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/events')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Event Details */}
            <div className="space-y-6">
              <Card>
                <div className="aspect-video">
                  <img
                    src={event.image_url || '/api/placeholder/600/400'}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{event.category}</Badge>
                    <span className="text-2xl font-bold text-secondary">{event.price}</span>
                  </div>
                  <CardTitle className="text-2xl mb-4">{event.title}</CardTitle>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg">{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg">{event.time}</span>
                    </div>
                    {event.dj && (
                      <div className="flex items-center gap-3">
                        <Music className="w-5 h-5" />
                        <span className="text-lg">{event.dj}</span>
                      </div>
                    )}
                    {event.host && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" />
                        <span className="text-lg">Hosted by {event.host}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-lg leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Seating Chart */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Venue Seating Chart
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click on an available table to make a reservation
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-96 bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg overflow-hidden">
                     {venueTables.map((table) => {
                       const isReserved = table.reserved_guests && table.reserved_guests > 0;
                       const isNightlifeReserved = isReserved && table.reservation_type === 'nightlife';
                       const isDiningReserved = isReserved && table.reservation_type === 'dining';
                       
                       return (
                         <button
                           key={table.id}
                           onClick={() => handleTableSelect(table)}
                           className={`absolute rounded-md border transition-all duration-200 flex flex-col items-center justify-center p-1 text-xs font-medium ${
                             isNightlifeReserved
                               ? 'bg-purple-500/20 border-purple-400 text-purple-300 cursor-not-allowed'
                               : isDiningReserved
                               ? 'bg-orange-500/20 border-orange-400 text-orange-300 cursor-not-allowed'
                               : 'bg-background border-border hover:border-primary hover:bg-primary/10 cursor-pointer'
                           }`}
                           style={{
                             left: `${(table.position_x / 1200) * 100}%`,
                             top: `${(table.position_y / 500) * 100}%`,
                             width: `${(table.width / 1200) * 100}%`,
                             height: `${(table.height / 500) * 100}%`,
                           }}
                           disabled={isReserved}
                         >
                           <span className="text-sm font-semibold">{table.table_number}</span>
                           <span className="text-xs leading-tight">
                             {isReserved 
                               ? `${table.reserved_guests} guests`
                               : `${table.max_guests} max`
                             }
                           </span>
                           {table.reservation_price > 0 && !isReserved && (
                             <span className="text-xs text-muted-foreground">
                               ${(table.reservation_price / 100).toFixed(0)}
                             </span>
                           )}
                         </button>
                       );
                     })}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-background border-2 border-border rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500/20 border-2 border-orange-400 rounded"></div>
                      <span>Dining Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-500/20 border-2 border-purple-400 rounded"></div>
                      <span>Nightlife Reserved</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reserve Table {selectedTable?.table_number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest_name">Guest Name</Label>
                <Input
                  id="guest_name"
                  value={reservationForm.guest_name}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, guest_name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="guest_email">Email</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={reservationForm.guest_email}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, guest_email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest_count">Number of Guests</Label>
                <Input
                  id="guest_count"
                  type="number"
                  min="1"
                  max={selectedTable?.max_guests}
                  value={reservationForm.guest_count}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, guest_count: parseInt(e.target.value) }))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum {selectedTable?.max_guests} guests for this table
                </p>
              </div>
              <div>
                <Label htmlFor="reservation_type">Reservation Type</Label>
                <Select
                  value={reservationForm.reservation_type}
                  onValueChange={(value: 'dining' | 'nightlife') => 
                    setReservationForm(prev => ({ ...prev, reservation_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dining">Dining (3pm - 9pm)</SelectItem>
                    <SelectItem value="nightlife">Nightlife (9pm - 5am)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedTable?.reservation_price > 0 && reservationForm.reservation_type === 'nightlife' && (
                  <p className="text-sm text-orange-400 mt-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${(selectedTable.reservation_price / 100).toFixed(2)} payment required
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="special_requests">Special Requests (Optional)</Label>
              <Textarea
                id="special_requests"
                value={reservationForm.special_requests}
                onChange={(e) => setReservationForm(prev => ({ ...prev, special_requests: e.target.value }))}
                placeholder="Any special dietary requirements or requests..."
              />
            </div>
            <Button 
              onClick={handleReservation}
              className="w-full"
              disabled={!reservationForm.guest_name || !reservationForm.guest_email}
            >
              Confirm Reservation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default EventDetails;