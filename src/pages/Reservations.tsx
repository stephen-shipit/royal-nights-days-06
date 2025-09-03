import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Utensils, Music, Users, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/utils";

const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reservationType, setReservationType] = useState("dining");
  const [showSelectionModal, setShowSelectionModal] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [privateEventPhone, setPrivateEventPhone] = useState("");
  const [diningPhone, setDiningPhone] = useState("");
  const [socialPhone, setSocialPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedTableType, setSelectedTableType] = useState("");
  const [phoneErrors, setPhoneErrors] = useState({
    privateEvent: "",
    dining: "",
    social: ""
  });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    console.log('Reservations component mounted');
    
    // Check if we should show the modal based on URL parameter
    if (searchParams.get('showModal') === 'true') {
      setShowSelectionModal(true);
      setSelectedService(null);
      setReservationType("dining");
      // Clear the URL parameter after opening modal
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('Reservation form submitted');
    
    try {
      // Get phone number based on reservation type
      let phoneNumber = "";
      let phoneFieldType = "";
      
      if (selectedService === "private") {
        phoneNumber = privateEventPhone;
        phoneFieldType = "privateEvent";
      } else if (reservationType === "dining") {
        phoneNumber = diningPhone;
        phoneFieldType = "dining";
      } else if (reservationType === "nightlife") {
        phoneNumber = socialPhone;
        phoneFieldType = "social";
      }
      
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        setPhoneErrors(prev => ({
          ...prev,
          [phoneFieldType]: "Please enter a valid phone number in format (XXX) XXX-XXXX"
        }));
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number in format (XXX) XXX-XXXX",
          variant: "destructive"
        });
        return;
      }
      
      // Clear phone error if validation passes
      setPhoneErrors(prev => ({
        ...prev,
        [phoneFieldType]: ""
      }));
      
      const formData = new FormData(e.target as HTMLFormElement);
      const guestName = formData.get('name') as string;
      const guestEmail = formData.get('email') as string;
      
      // Get guests from state or formdata with fallback
      let guestCount = parseInt(selectedGuests || formData.get('guests') as string || "1");
      
      // Validate required fields
      if (!guestName || !guestEmail || !guestCount || !selectedDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Form data:', { guestName, guestEmail, guestCount, phoneNumber, selectedDate });
    
      let eventId = null;
      
      // Only get event for nightlife reservations
      if (reservationType === 'nightlife') {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id')
          .eq('date', selectedDate?.toISOString().split('T')[0])
          .single();

        if (eventError) {
          console.error('Event lookup error:', eventError);
          throw new Error('No event found for selected date. Please check if there are any events scheduled for this date.');
        }
        eventId = eventData.id;
      }

      // Get the first available table
      const { data: tables } = await supabase
        .from('venue_tables')
        .select('id')
        .eq('is_available', true)
        .limit(1);
      
      if (!tables || tables.length === 0) {
        throw new Error('No tables available');
      }

      // All reservations start as 'pending' status until manually confirmed by staff
      const { data: reservationData, error } = await supabase
        .from('table_reservations')
        .insert({
          event_id: eventId, // null for dining, event ID for entertainment
          table_id: tables[0].id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_count: guestCount,
          guest_phone: phoneNumber,
          reservation_type: reservationType,
          time_slot: reservationType === 'dining' ? '3pm-9pm' : '9pm-5am',
          status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Database insertion error:', error);
        
        // Handle specific RLS errors
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          throw new Error('Unable to create reservation. Please ensure all fields are completed and try again.');
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!reservationData?.id) {
        throw new Error('Reservation was not created properly');
      }

      console.log('Reservation created successfully:', reservationData);

      // For dinner reservations, send initial "request received" email notifications
      if (reservationType === 'dining' && reservationData?.id) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
            body: { 
              reservationId: reservationData.id,
              sessionId: null, // No payment session for free dinner reservations
              emailType: 'request_received' // Indicate this is an initial request email
            }
          });

          if (emailError) {
            console.error('Error sending reservation email:', emailError);
            // Don't fail the reservation if email fails, just log it
          }
        } catch (emailError) {
          console.error('Error invoking email function:', emailError);
          // Don't fail the reservation if email fails, just log it
        }
      }

      toast({
        title: "Reservation Request Submitted",
        description: reservationType === 'dining' 
          ? "Your dinner reservation request has been submitted! You'll receive a confirmation email once our staff reviews and approves your reservation."
          : "We'll contact you shortly to confirm your reservation.",
      });
      
      // Only navigate to thank you page on successful reservation
      navigate('/thank-you');
    } catch (error) {
      console.error('Error submitting reservation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to submit reservation: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelection = (service: string) => {
    console.log('Service selected:', service);
    setShowSelectionModal(false);
    
    if (service === "dining") {
      setSelectedService("dining");
      setReservationType("dining");
    } else if (service === "entertainment") {
      navigate("/events");
    } else if (service === "private") {
      navigate("/plan-event");
    }
  };

  const openServiceModal = () => {
    setShowSelectionModal(true);
  };

  console.log('Reservations render - selectedService:', selectedService, 'showModal:', showSelectionModal);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      {/* Service Selection Modal */}
      <Dialog open={showSelectionModal} onOpenChange={setShowSelectionModal}>
        <DialogContent className="max-w-2xl h-screen md:h-auto w-screen md:w-auto max-h-screen md:max-h-[90vh] rounded-none md:rounded-lg p-0 md:p-6 top-0 md:top-[50%] translate-y-0 md:translate-y-[-50%]">
          <div className="h-full flex flex-col">
            <DialogHeader className="p-6 md:p-0">
              <DialogTitle className="text-xl md:text-2xl text-center mb-6">
                What type of reservation would you like to make?
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-6 pb-6 md:px-0 md:pb-0 flex-1 overflow-y-auto">
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
                  Book a table for our Social experience (9PM - 5AM)
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
          </div>
        </DialogContent>
      </Dialog>

      <div className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Make a Reservation
              </h1>
              <p className="text-lg text-muted-foreground">
                Book your table for an unforgettable dining or nightlife experience
              </p>
            </div>

            {selectedService && selectedService === "private" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Private Event Inquiry</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReservation} className="space-y-6">
                    {/* Hidden inputs for controlled values */}
                    <input type="hidden" name="phone" value={privateEventPhone} />
                    <input type="hidden" name="event_type" value={selectedEventType} />
                    <input type="hidden" name="budget" value={selectedBudget} />
                    <input type="hidden" name="selected_date" value={selectedDate?.toISOString().split('T')[0] || ''} />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="event-name">Full Name</Label>
                          <Input 
                            id="event-name" 
                            name="name" 
                            placeholder="Enter your name" 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-email">Email</Label>
                          <Input 
                            id="event-email" 
                            name="email" 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-phone">Phone Number</Label>
                          <Input 
                            id="event-phone" 
                            type="tel" 
                            placeholder="(XXX) XXX-XXXX" 
                            value={privateEventPhone}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value);
                              setPrivateEventPhone(formatted);
                              if (phoneErrors.privateEvent) {
                                setPhoneErrors(prev => ({ ...prev, privateEvent: "" }));
                              }
                            }}
                            required 
                          />
                          {phoneErrors.privateEvent && (
                            <p className="text-sm text-destructive mt-1">{phoneErrors.privateEvent}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="event-type">Event Type</Label>
                          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="birthday">Birthday Party</SelectItem>
                              <SelectItem value="corporate">Corporate Event</SelectItem>
                              <SelectItem value="wedding">Wedding Reception</SelectItem>
                              <SelectItem value="anniversary">Anniversary</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="guest-count">Expected Guest Count</Label>
                          <Input 
                            id="guest-count" 
                            name="guest_count" 
                            type="number" 
                            placeholder="Number of guests" 
                            required 
                          />
                        </div>
                        <div>
                          <Label htmlFor="budget">Estimated Budget</Label>
                          <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                              <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                              <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                              <SelectItem value="50000+">$50,000+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label>Preferred Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border touch-manipulation"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                        <div>
                          <Label htmlFor="event-details">Event Details & Requirements</Label>
                          <textarea
                            id="event-details"
                            name="event_details"
                            placeholder="Please describe your event, any special requirements, catering needs, etc."
                            className="w-full h-32 p-3 border rounded-md resize-none touch-manipulation"
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Private Event Inquiry"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : selectedService ? (
              <Tabs value={reservationType} onValueChange={(value) => {
                if (value === 'nightlife') {
                  navigate('/events');
                } else {
                  setReservationType(value);
                }
              }} className="mb-8">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dining">Dinner (3PM - 9PM)</TabsTrigger>
                  <TabsTrigger value="nightlife">Social Hours (9PM - 5AM)</TabsTrigger>
                </TabsList>

              <TabsContent value="dining">
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Dinner Reservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReservation} className="space-y-6">
                      {/* Hidden inputs for controlled values */}
                      <input type="hidden" name="phone" value={diningPhone} />
                      <input type="hidden" name="guests" value={selectedGuests} />
                      <input type="hidden" name="preferred_time" value={selectedTime} />
                      <input type="hidden" name="selected_date" value={selectedDate?.toISOString().split('T')[0] || ''} />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input 
                              id="name" 
                              name="name" 
                              placeholder="Enter your name" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              name="email" 
                              type="email" 
                              placeholder="Enter your email" 
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                              id="phone" 
                              type="tel" 
                              placeholder="(XXX) XXX-XXXX"
                              value={diningPhone}
                              onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setDiningPhone(formatted);
                                if (phoneErrors.dining) {
                                  setPhoneErrors(prev => ({ ...prev, dining: "" }));
                                }
                              }}
                              required 
                            />
                            {phoneErrors.dining && (
                              <p className="text-sm text-destructive mt-1">{phoneErrors.dining}</p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="guests">Number of Guests</Label>
                            <Select value={selectedGuests} onValueChange={setSelectedGuests}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select guest count" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="time">Preferred Time</Label>
                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="15:30">3:30 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                                <SelectItem value="16:30">4:30 PM</SelectItem>
                                <SelectItem value="17:00">5:00 PM</SelectItem>
                                <SelectItem value="17:30">5:30 PM</SelectItem>
                                <SelectItem value="18:00">6:00 PM</SelectItem>
                                <SelectItem value="18:30">6:30 PM</SelectItem>
                                <SelectItem value="19:00">7:00 PM</SelectItem>
                                <SelectItem value="19:30">7:30 PM</SelectItem>
                                <SelectItem value="20:00">8:00 PM</SelectItem>
                                <SelectItem value="20:30">8:30 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Select Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border touch-manipulation"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" variant="luxury" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reserving...
                          </>
                        ) : (
                          "Reserve Table"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nightlife">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Hours Reservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReservation} className="space-y-6">
                      {/* Hidden inputs for controlled values */}
                      <input type="hidden" name="phone" value={socialPhone} />
                      <input type="hidden" name="guests" value={selectedGuests} />
                      <input type="hidden" name="table_type" value={selectedTableType} />
                      <input type="hidden" name="selected_date" value={selectedDate?.toISOString().split('T')[0] || ''} />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                             <Label htmlFor="night-name">Full Name</Label>
                             <Input 
                               id="night-name" 
                               name="name" 
                               placeholder="Enter your name" 
                               required 
                             />
                           </div>
                           <div>
                             <Label htmlFor="night-email">Email</Label>
                             <Input 
                               id="night-email" 
                               name="email" 
                               type="email" 
                               placeholder="Enter your email" 
                               required 
                             />
                           </div>
                           <div>
                             <Label htmlFor="night-phone">Phone Number</Label>
                             <Input 
                               id="night-phone" 
                               type="tel" 
                               placeholder="(XXX) XXX-XXXX"
                               value={socialPhone}
                               onChange={(e) => {
                                 const formatted = formatPhoneNumber(e.target.value);
                                 setSocialPhone(formatted);
                                 if (phoneErrors.social) {
                                   setPhoneErrors(prev => ({ ...prev, social: "" }));
                                 }
                               }}
                               required 
                             />
                             {phoneErrors.social && (
                               <p className="text-sm text-destructive mt-1">{phoneErrors.social}</p>
                             )}
                           </div>
                           <div>
                             <Label htmlFor="party-size">Party Size</Label>
                             <Select value={selectedGuests} onValueChange={setSelectedGuests}>
                               <SelectTrigger>
                                 <SelectValue placeholder="Select party size" />
                               </SelectTrigger>
                               <SelectContent>
                                 {Array.from({ length: 15 }, (_, i) => (
                                   <SelectItem key={i + 1} value={String(i + 1)}>
                                     {i + 1} {i === 0 ? 'Person' : 'People'}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                          <div>
                            <Label htmlFor="table-type">Table Preference</Label>
                            <Select value={selectedTableType} onValueChange={setSelectedTableType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select table type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="regular">Regular Table</SelectItem>
                                <SelectItem value="vip">VIP Section</SelectItem>
                                <SelectItem value="booth">Premium Booth</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Select Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border touch-manipulation"
                            disabled={(date) => date < new Date()}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" variant="royal" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Reserving...
                          </>
                        ) : (
                          "Reserve Night Table"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Reservations;
