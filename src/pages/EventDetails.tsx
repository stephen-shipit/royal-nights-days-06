import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Music, Users, ArrowLeft, X, Info, Grid3x3 } from "lucide-react";
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
  location?: string;
  reserved_guests?: number;
  reservation_type?: string;
};

type ReservationForm = {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  special_requests: string;
  birthday_package: boolean;
};

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [venueTables, setVenueTables] = useState<VenueTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<VenueTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [reservationForm, setReservationForm] = useState<ReservationForm>({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_count: 1,
    special_requests: "",
    birthday_package: false
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  const fetchVenueTables = async () => {
    try {
      console.log('Fetching venue tables for event:', eventId);
      
      // Get venue tables and their reservations for this specific event only
      const { data: tables, error: tablesError } = await supabase
        .from('venue_tables')
        .select('*')
        .order('table_number');

      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        return;
      }

      console.log('Fetched tables:', tables);

      // Clean up expired reservations and get all active reservations for this event
      await supabase.rpc('cleanup_expired_reservations');
      
      const { data: reservations, error: reservationsError } = await supabase
        .from('table_reservations')
        .select('table_id, guest_count, event_id, status')
        .eq('event_id', eventId)
        .in('status', ['confirmed', 'pending']);

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError);
        return;
      }

      console.log('Fetched reservations for event', eventId, ':', reservations);

      // Combine tables with reservation data - only for this event
      const tablesWithReservations = tables?.map(table => {
        // Find reservations specifically for this table AND this event
        const reservation = reservations?.find(r => 
          r.table_id === table.id && r.event_id === eventId
        );
        
        return {
          ...table,
          reserved_guests: reservation?.guest_count || 0
        };
      }) || [];

      console.log('Tables with reservations for event', eventId, ':', tablesWithReservations);
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

    // Validation
    if (reservationForm.guest_count > selectedTable.max_guests) {
      toast({
        title: "Too Many Guests",
        description: `This table can accommodate maximum ${selectedTable.max_guests} guests`,
        variant: "destructive",
      });
      return;
    }

    if (!reservationForm.guest_name || !reservationForm.guest_email || !reservationForm.guest_phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Clean up expired reservations first
      await supabase.rpc('cleanup_expired_reservations');
      
      // Check if table is still available
      const { data: isAvailable } = await supabase.rpc('is_table_available', {
        p_event_id: event.id,
        p_table_id: selectedTable.id
      });
      
      if (!isAvailable) {
        toast({
          title: "Table Unavailable",
          description: "This table is no longer available. Please select another table.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        // Refresh the page to update table availability
        window.location.reload();
        return;
      }

      // Create pending reservation with 30 minutes expiry
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      
      const { data: reservation, error: reservationError } = await supabase
        .from('table_reservations')
        .insert({
          event_id: event.id,
          table_id: selectedTable.id,
          guest_name: reservationForm.guest_name,
          guest_email: reservationForm.guest_email,
          guest_count: reservationForm.guest_count,
          status: 'pending',
          expires_at: expiresAt
        })
        .select()
        .single();

      if (reservationError) {
        console.error('Error creating reservation:', reservationError);
        toast({
          title: "Reservation Failed",
          description: "Could not create your reservation. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      // Calculate pricing
      const tablePrice = selectedTable.reservation_price || 0;
      const birthdayPackagePrice = reservationForm.birthday_package ? 5000 : 0; // $50 in cents
      const totalPrice = tablePrice + birthdayPackagePrice;

      // Create Stripe payment session
      const { data, error: paymentError } = await supabase.functions.invoke('create-payment-session', {
        body: {
          reservationId: reservation.id,
          eventId: event.id,
          tableId: selectedTable.id,
          guestName: reservationForm.guest_name,
          guestEmail: reservationForm.guest_email,
          guestPhone: reservationForm.guest_phone,
          guestCount: reservationForm.guest_count,
          specialRequests: reservationForm.special_requests,
          birthdayPackage: reservationForm.birthday_package,
          tablePrice: tablePrice
        }
      });

      if (paymentError) {
        console.error('Error creating payment session:', paymentError);
        toast({
          title: "Payment Error",
          description: "Could not create payment session. Please try again.",
          variant: "destructive",
        });
        setIsProcessingPayment(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.open(data.url, '_blank');
      }

      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="pt-20 pb-20 md:pb-0 flex items-center justify-center h-96">
          <div className="text-center">Loading event details...</div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="pt-20 pb-20 md:pb-0 flex items-center justify-center h-96">
          <div className="text-center">Event not found</div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      <div className="pt-20 pb-20 md:pb-0">
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

          {/* Mobile Tabs - Only show on mobile */}
          <div className="lg:hidden mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Event Details
                </TabsTrigger>
                <TabsTrigger value="seating" className="flex items-center gap-2">
                  <Grid3x3 className="w-4 h-4" />
                  Reserve Table
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-6">
                {/* Event Details - Mobile */}
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
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">{event.description}</p>
                      
                      {/* Event Disclaimers */}
                      <div className="border-t border-border pt-4 space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Dress Code:</span> Smart casual attire required. No athletic wear, flip-flops, or overly casual clothing permitted.
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-foreground">Table reservations and cover charges are separate fees.</strong> All patrons must pay the cover charge upon entry, with the exception of the primary reservation holder. Additional guests in your party are subject to the standard cover charge.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="seating" className="mt-6">
                {/* Seating Chart - Mobile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Venue Seating Chart
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Click on an available table to make a reservation
                    </p>
                    {venueTables.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Found {venueTables.length} tables
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg overflow-hidden border border-border">
                      {venueTables.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          Loading tables...
                        </div>
                      ) : (
                        venueTables.map((table) => {
                          const isReserved = table.reserved_guests && table.reserved_guests > 0;
                          
                          return (
                            <button
                              key={table.id}
                              onClick={() => handleTableSelect(table)}
                              className={`absolute rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-xs font-medium shadow-md ${
                                isReserved
                                  ? 'bg-red-500/20 border-red-400 text-red-600 cursor-not-allowed'
                                  : 'bg-background border-primary hover:border-primary hover:bg-primary/10 cursor-pointer hover:shadow-lg'
                              }`}
                              style={{
                                left: `${(table.position_x / 1200) * 100}%`,
                                top: `${(table.position_y / 500) * 100}%`,
                                width: `clamp(20px, ${(table.width / 1200) * 100}%, 60px)`,
                                height: `clamp(16px, ${(table.height / 500) * 100}%, 48px)`,
                                fontSize: 'clamp(8px, 1.5vw, 12px)',
                                transform: 'translate(-50%, -50%)',
                              }}
                              disabled={isReserved}
                            >
                              {isReserved && (
                                <X className="w-3 h-3 md:w-4 md:h-4 text-red-500" strokeWidth={3} />
                              )}
                              {!isReserved && (
                                <>
                                  {Number(table.reservation_price) > 0 && (
                                    <span className="text-[6px] md:text-[8px] font-bold leading-none">
                                      ${Number(table.reservation_price)}
                                    </span>
                                  )}
                                  <span className="text-[8px] md:text-[10px] font-bold">T{table.table_number}</span>
                                  <span className="text-[6px] md:text-[8px] leading-none">{table.max_guests}</span>
                                </>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-background border-2 border-primary rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500/20 border-2 border-red-400 rounded"></div>
                        <span>Reserved</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary/10 border-2 border-primary rounded"></div>
                        <span>Selected</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout - Hidden on mobile */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8">
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
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">{event.description}</p>
                  
                  {/* Event Disclaimers */}
                  <div className="border-t border-border pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Dress Code:</span> Smart casual attire required. No athletic wear, flip-flops, or overly casual clothing permitted.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Table reservations and cover charges are separate fees.</strong> All patrons must pay the cover charge upon entry, with the exception of the primary reservation holder. Additional guests in your party are subject to the standard cover charge.
                      </p>
                    </div>
                  </div>
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
                  {venueTables.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Found {venueTables.length} tables
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-[500px] bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg overflow-hidden border border-border">
                    {venueTables.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        Loading tables...
                      </div>
                    ) : (
                      venueTables.map((table) => {
                        const isReserved = table.reserved_guests && table.reserved_guests > 0;
                        
                        return (
                          <button
                            key={table.id}
                            onClick={() => handleTableSelect(table)}
                             className={`absolute rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center text-sm font-medium shadow-md py-1 px-1 m-1 ${
                               isReserved
                                 ? 'bg-red-500/20 border-red-400 text-red-600 cursor-not-allowed'
                                 : 'bg-background border-primary hover:border-primary hover:bg-primary/10 cursor-pointer hover:shadow-lg'
                             }`}
                             style={{
                                left: `${Math.max(1, Math.min(94, (table.position_x / 1200) * 94 + 1))}%`,
                                top: `${Math.max(1, Math.min(94, (table.position_y / 500) * 94 + 1))}%`,
                                width: `40px`,
                                height: `55px`,
                               paddingTop: `4px`,
                               paddingBottom: `4px`,
                             }}
                             disabled={isReserved}
                          >
                             {isReserved && (
                               <X className="absolute inset-0 w-10 h-10 text-red-500 m-auto" strokeWidth={3} />
                             )}
                             {!isReserved && (
                               <>
                                  {Number(table.reservation_price) > 0 && (
                                    <span className="text-[10px] font-bold leading-none">
                                      ${Number(table.reservation_price)}
                                    </span>
                                  )}
                                  <span className="text-sm font-bold">T{table.table_number}</span>
                                 <span className="text-xs leading-none">{table.max_guests}</span>
                               </>
                             )}
                          </button>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-background border-2 border-primary rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500/20 border-2 border-red-400 rounded"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary/10 border-2 border-primary rounded"></div>
                      <span>Selected</span>
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
        <DialogContent className="max-h-[85vh] max-w-lg mx-auto my-8 overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              Reserve Table {selectedTable?.table_number}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guest_name">Guest Name *</Label>
                <Input
                  id="guest_name"
                  value={reservationForm.guest_name}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, guest_name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="guest_email">Email *</Label>
                <Input
                  id="guest_email"
                  type="email"
                  value={reservationForm.guest_email}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, guest_email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="guest_phone">Phone Number *</Label>
              <Input
                id="guest_phone"
                type="tel"
                value={reservationForm.guest_phone}
                onChange={(e) => setReservationForm(prev => ({ ...prev, guest_phone: e.target.value }))}
                placeholder="(555) 123-4567"
                required
              />
            </div>
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
              {selectedTable?.reservation_price > 0 && (
                <p className="text-sm text-primary mt-1">
                  ${selectedTable.reservation_price} reservation fee
                </p>
              )}
            </div>
            {/* Birthday Package Option */}
            <div className="border border-accent rounded-lg p-4 bg-accent/5">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="birthday_package"
                  checked={reservationForm.birthday_package}
                  onCheckedChange={(checked) => 
                    setReservationForm(prev => ({ ...prev, birthday_package: checked as boolean }))
                  }
                />
                <div className="space-y-2">
                  <Label 
                    htmlFor="birthday_package" 
                    className="text-base font-medium cursor-pointer"
                  >
                    🎉 Birthday Shoutout Package (+$50.00)
                  </Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Special shoutout by our MC</p>
                    <p>• Your picture and name displayed on our large screen</p>
                    <p>• Sparklers and lights display at your table</p>
                    <p>• Custom name sign at your table</p>
                  </div>
                </div>
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

            {/* Price Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Table Reservation</span>
                  <span>${selectedTable ? selectedTable.reservation_price : '0'}</span>
                </div>
                {reservationForm.birthday_package && (
                  <div className="flex justify-between text-sm">
                    <span>Birthday Shoutout Package</span>
                    <span>$50.00</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base border-t pt-2">
                  <span>Total</span>
                  <span>
                     ${selectedTable 
                       ? (selectedTable.reservation_price + (reservationForm.birthday_package ? 50 : 0))
                       : '0'
                     }
                  </span>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleReservation}
              className="w-full"
              disabled={
                !reservationForm.guest_name || 
                !reservationForm.guest_email || 
                !reservationForm.guest_phone ||
                isProcessingPayment
              }
            >
              {isProcessingPayment ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default EventDetails;
