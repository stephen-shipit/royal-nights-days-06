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
  const [validationStatus, setValidationStatus] = useState({
    name: false,
    email: false,
    guests: false,
    time: false,
    phone: false
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

  // Helper function to check if a date is Monday or Tuesday (closed days)
  const isRestaurantClosed = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 1 || dayOfWeek === 2; // Monday = 1, Tuesday = 2
  };

  // Check if restaurant is closed today
  const isClosedToday = isRestaurantClosed(new Date());

  // Helper function to convert 24-hour time to 12-hour format
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    console.log('=== MOBILE DEBUG: Reservation form submitted ===');
    console.log('User agent:', navigator.userAgent);
    console.log('Selected service:', selectedService);
    console.log('Reservation type:', reservationType);
    console.log('Selected date:', selectedDate);
    console.log('Selected guests state:', selectedGuests);
    console.log('Selected time state:', selectedTime);
    
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
      
      console.log('MOBILE DEBUG: Phone number collected:', phoneNumber);
      console.log('MOBILE DEBUG: Phone field type:', phoneFieldType);
      
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        console.log('MOBILE DEBUG: Phone validation failed');
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
      
      // Mobile-specific form data collection
      const formData = new FormData(e.target as HTMLFormElement);
      console.log('MOBILE DEBUG: FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      
      // Get form values with mobile-safe fallbacks
      const guestName = formData.get('name') as string;
      const guestEmail = formData.get('email') as string;
      
      // For mobile, prioritize state values over FormData with proper parsing
      let guestCount;
      if (selectedGuests && selectedGuests !== "") {
        // Extract number from strings like "7 Guests" or just "7"
        const guestMatch = selectedGuests.match(/(\d+)/);
        guestCount = guestMatch ? parseInt(guestMatch[1]) : NaN;
        console.log('MOBILE DEBUG: Using guests from state:', selectedGuests, '-> parsed:', guestCount);
      } else {
        const formGuests = formData.get('guests') as string;
        const formMatch = formGuests?.match(/(\d+)/);
        guestCount = formMatch ? parseInt(formMatch[1]) : 1;
        console.log('MOBILE DEBUG: Using guests from FormData:', formGuests, '-> parsed:', guestCount);
      }
      
      // Mobile-safe time collection with DOM fallback
      let timeSlot = selectedTime;
      if (!timeSlot) {
        timeSlot = formData.get('time') as string;
        console.log('MOBILE DEBUG: Time from FormData:', timeSlot);
      }
      
      // Additional DOM fallback for mobile Safari Select issues
      if (!timeSlot && reservationType === 'dining') {
        const timeSelectElement = document.querySelector('select[name="time"]') as HTMLSelectElement;
        if (timeSelectElement) {
          timeSlot = timeSelectElement.value;
          console.log('MOBILE DEBUG: Time from DOM fallback:', timeSlot);
        }
      }
      
      // Guest count DOM fallback with better parsing
      if (!guestCount || isNaN(guestCount)) {
        const guestSelectElement = document.querySelector('select[name="guests"]') as HTMLSelectElement;
        if (guestSelectElement && guestSelectElement.value) {
          const domMatch = guestSelectElement.value.match(/(\d+)/);
          const domGuestCount = domMatch ? parseInt(domMatch[1]) : NaN;
          if (!isNaN(domGuestCount)) {
            guestCount = domGuestCount;
            console.log('MOBILE DEBUG: Guests from DOM fallback:', guestSelectElement.value, '-> parsed:', guestCount);
          }
        }
      }
      
      console.log('MOBILE DEBUG: Final form values:', { 
        guestName, 
        guestEmail, 
        guestCount, 
        phoneNumber, 
        selectedDate,
        timeSlot 
      });
      
      // Enhanced mobile validation with specific error messages
      const missingFields = [];
      if (!guestName?.trim()) missingFields.push("Name");
      if (!guestEmail?.trim()) missingFields.push("Email");
      if (!guestCount || isNaN(guestCount)) missingFields.push("Number of guests");
      if (!selectedDate) missingFields.push("Date");
      if (!phoneNumber?.trim()) missingFields.push("Phone number");
      if (reservationType === 'dining' && !timeSlot) missingFields.push("Time slot");
      
      if (missingFields.length > 0) {
        const errorMessage = `Please complete the following fields: ${missingFields.join(', ')}`;
        console.log('MOBILE DEBUG: Missing fields:', missingFields);
        toast({
          title: "Missing Information",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
    
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
      const insertData = {
        event_id: eventId, // null for dining, event ID for entertainment
        table_id: tables[0].id,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_count: guestCount,
        guest_phone: phoneNumber,
        reservation_type: reservationType,
        time_slot: reservationType === 'dining' ? convertTo12Hour(timeSlot) : '9pm-5am',
        status: 'pending'
      };
      
      console.log('Attempting to insert reservation with data:', insertData);
      
      const { data: reservationData, error } = await supabase
        .from('table_reservations')
        .insert(insertData)
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
                <h3 className="text-lg font-semibold mb-2">Social</h3>
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
              {isClosedToday && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive font-medium">
                    We're currently closed on Mondays and Tuesdays.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please visit us Wednesday through Sunday or make a reservation for future dates.
                  </p>
                </div>
              )}
            </div>

            {selectedService && selectedService === "private" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Private Event Inquiry</CardTitle>
                </CardHeader>
                <CardContent>
                  {isClosedToday ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Private event inquiries are not available while we're closed. Please visit us Wednesday through Sunday.
                      </p>
                      <Button onClick={openServiceModal} className="mt-4">
                        Choose Another Service
                      </Button>
                    </div>
                  ) : (
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
                              onSelect={(date) => {
                                console.log('MOBILE DEBUG: Calendar date selected:', date);
                                setSelectedDate(date);
                              }}
                              className="rounded-md border touch-manipulation w-full"
                              disabled={(date) => {
                                // Block past dates
                                if (date < new Date()) return true;
                                // Block Mondays (1) and Tuesdays (2) - we're closed
                                const dayOfWeek = date.getDay();
                                return dayOfWeek === 1 || dayOfWeek === 2;
                              }}
                              modifiers={{
                                today: new Date()
                              }}
                              modifiersStyles={{
                                today: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                              }}
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
                  )}
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
                    {isClosedToday ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Dinner reservations are not available while we're closed. Please visit us Wednesday through Sunday.
                        </p>
                        <Button onClick={openServiceModal} className="mt-4">
                          Choose Another Service
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleReservation} className="space-y-6">
                      {/* Hidden inputs for controlled values */}
                      <input type="hidden" name="phone" value={diningPhone} />
                      <input type="hidden" name="guests" value={selectedGuests} />
                      <input type="hidden" name="preferred_time" value={selectedTime} />
                      <input type="hidden" name="selected_date" value={selectedDate?.toISOString().split('T')[0] || ''} />
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                             <Label htmlFor="name" className="flex items-center gap-2">
                               Full Name
                               {validationStatus.name && <span className="text-green-500 text-xs">✓</span>}
                             </Label>
                             <Input 
                               id="name" 
                               name="name" 
                               placeholder="Enter your name" 
                               className="h-12"
                               onChange={(e) => {
                                 setValidationStatus(prev => ({ ...prev, name: !!e.target.value.trim() }));
                               }}
                               required 
                             />
                           </div>
                           <div>
                             <Label htmlFor="email" className="flex items-center gap-2">
                               Email
                               {validationStatus.email && <span className="text-green-500 text-xs">✓</span>}
                             </Label>
                             <Input 
                               id="email" 
                               name="email" 
                               type="email" 
                               placeholder="Enter your email" 
                               className="h-12"
                               onChange={(e) => {
                                 setValidationStatus(prev => ({ ...prev, email: !!e.target.value.trim() }));
                               }}
                               required 
                             />
                           </div>
                           <div>
                             <Label htmlFor="phone" className="flex items-center gap-2">
                               Phone Number
                               {validationStatus.phone && <span className="text-green-500 text-xs">✓</span>}
                             </Label>
                             <Input 
                               id="phone" 
                               type="tel" 
                               placeholder="(XXX) XXX-XXXX"
                               className="h-12"
                               value={diningPhone}
                               onChange={(e) => {
                                 const formatted = formatPhoneNumber(e.target.value);
                                 setDiningPhone(formatted);
                                 setValidationStatus(prev => ({ ...prev, phone: validatePhoneNumber(formatted) }));
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
                             <Label htmlFor="guests" className="flex items-center gap-2">
                               Number of Guests
                               {validationStatus.guests && <span className="text-green-500 text-xs">✓</span>}
                             </Label>
                             <Select 
                               value={selectedGuests} 
                               onValueChange={(value) => {
                                 console.log('MOBILE DEBUG: Guests selected:', value);
                                 setSelectedGuests(value);
                                 setValidationStatus(prev => ({ ...prev, guests: !!value }));
                               }}
                             >
                               <SelectTrigger className="touch-manipulation h-12">
                                 <SelectValue placeholder="Select guest count" />
                               </SelectTrigger>
                               <SelectContent className="z-50 bg-background border border-border shadow-lg">
                                 {Array.from({ length: 10 }, (_, i) => (
                                   <SelectItem key={i + 1} value={String(i + 1)} className="touch-manipulation">
                                     {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                             {selectedGuests && (
                               <div className="text-xs text-green-600 mt-1">
                                 ✓ {selectedGuests} Guest{selectedGuests !== '1' ? 's' : ''} selected
                               </div>
                             )}
                            {/* Hidden inputs for mobile fallback */}
                            <input type="hidden" name="guests" value={selectedGuests} />
                            <select name="guests" style={{ display: 'none' }} value={selectedGuests}>
                              {Array.from({ length: 10 }, (_, i) => (
                                <option key={i + 1} value={String(i + 1)}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                           </div>
                            <div>
                              <Label htmlFor="time" className="flex items-center gap-2">
                                Preferred Time
                                {validationStatus.time && <span className="text-green-500 text-xs">✓</span>}
                              </Label>
                               <Select 
                                 value={selectedTime} 
                                 onValueChange={(value) => {
                                   console.log('MOBILE DEBUG: Time selected:', value);
                                   setSelectedTime(value);
                                   setValidationStatus(prev => ({ ...prev, time: !!value }));
                                 }}
                               >
                                 <SelectTrigger className="touch-manipulation h-12">
                                   <SelectValue placeholder="Select time" />
                                 </SelectTrigger>
                                 <SelectContent className="z-50 bg-background border border-border shadow-lg">
                                   <SelectItem value="15:00" className="touch-manipulation">3:00 PM</SelectItem>
                                   <SelectItem value="15:30" className="touch-manipulation">3:30 PM</SelectItem>
                                   <SelectItem value="16:00" className="touch-manipulation">4:00 PM</SelectItem>
                                   <SelectItem value="16:30" className="touch-manipulation">4:30 PM</SelectItem>
                                   <SelectItem value="17:00" className="touch-manipulation">5:00 PM</SelectItem>
                                   <SelectItem value="17:30" className="touch-manipulation">5:30 PM</SelectItem>
                                   <SelectItem value="18:00" className="touch-manipulation">6:00 PM</SelectItem>
                                   <SelectItem value="18:30" className="touch-manipulation">6:30 PM</SelectItem>
                                   <SelectItem value="19:00" className="touch-manipulation">7:00 PM</SelectItem>
                                   <SelectItem value="19:30" className="touch-manipulation">7:30 PM</SelectItem>
                                   <SelectItem value="20:00" className="touch-manipulation">8:00 PM</SelectItem>
                                   <SelectItem value="20:30" className="touch-manipulation">8:30 PM</SelectItem>
                                 </SelectContent>
                               </Select>
                               {selectedTime && (
                                 <div className="text-xs text-green-600 mt-1">
                                   ✓ {selectedTime === '15:00' ? '3:00 PM' : 
                                      selectedTime === '15:30' ? '3:30 PM' : 
                                      selectedTime === '16:00' ? '4:00 PM' : 
                                      selectedTime === '16:30' ? '4:30 PM' : 
                                      selectedTime === '17:00' ? '5:00 PM' : 
                                      selectedTime === '17:30' ? '5:30 PM' : 
                                      selectedTime === '18:00' ? '6:00 PM' : 
                                      selectedTime === '18:30' ? '6:30 PM' : 
                                      selectedTime === '19:00' ? '7:00 PM' : 
                                      selectedTime === '19:30' ? '7:30 PM' : 
                                      selectedTime === '20:00' ? '8:00 PM' : 
                                      selectedTime === '20:30' ? '8:30 PM' : selectedTime} selected
                                 </div>
                               )}
                              {/* Hidden inputs for mobile fallback */}
                              <input type="hidden" name="time" value={selectedTime} />
                              <select name="time" style={{ display: 'none' }} value={selectedTime}>
                                <option value="15:00">3:00 PM</option>
                                <option value="15:30">3:30 PM</option>
                                <option value="16:00">4:00 PM</option>
                                <option value="16:30">4:30 PM</option>
                                <option value="17:00">5:00 PM</option>
                                <option value="17:30">5:30 PM</option>
                                <option value="18:00">6:00 PM</option>
                                <option value="18:30">6:30 PM</option>
                                <option value="19:00">7:00 PM</option>
                                <option value="19:30">7:30 PM</option>
                                <option value="20:00">8:00 PM</option>
                                <option value="20:30">8:30 PM</option>
                              </select>
                            </div>
                        </div>
                        <div>
                           <Label>Select Date</Label>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                console.log('MOBILE DEBUG: Dining calendar date selected:', date);
                                setSelectedDate(date);
                              }}
                              className="rounded-md border touch-manipulation w-full"
                              disabled={(date) => {
                                // Block past dates
                                if (date < new Date()) return true;
                                // Block Mondays (1) and Tuesdays (2) - we're closed
                                const dayOfWeek = date.getDay();
                                return dayOfWeek === 1 || dayOfWeek === 2;
                              }}
                              modifiers={{
                                today: new Date()
                              }}
                              modifiersStyles={{
                                today: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                              }}
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
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>

               <TabsContent value="nightlife">
                 <Card>
                   <CardHeader>
                     <CardTitle>Social Hours Reservation</CardTitle>
                   </CardHeader>
                   <CardContent>
                     {isClosedToday ? (
                       <div className="text-center py-8">
                         <p className="text-muted-foreground">
                           Social hours reservations are not available while we're closed. Please visit us Wednesday through Sunday.
                         </p>
                         <Button onClick={openServiceModal} className="mt-4">
                           Choose Another Service
                         </Button>
                       </div>
                     ) : (
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
                             <Select 
                               value={selectedGuests} 
                               onValueChange={(value) => {
                                 console.log('MOBILE DEBUG: Party size selected:', value);
                                 setSelectedGuests(value);
                               }}
                             >
                               <SelectTrigger className="touch-manipulation h-12">
                                 <SelectValue placeholder="Select party size" />
                               </SelectTrigger>
                               <SelectContent className="z-50 bg-popover">
                                 {Array.from({ length: 15 }, (_, i) => (
                                   <SelectItem key={i + 1} value={String(i + 1)} className="touch-manipulation">
                                     {i + 1} {i === 0 ? 'Person' : 'People'}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                          <div>
                            <Label htmlFor="table-type">Table Preference</Label>
                            <Select 
                              value={selectedTableType} 
                              onValueChange={(value) => {
                                console.log('MOBILE DEBUG: Table type selected:', value);
                                setSelectedTableType(value);
                              }}
                            >
                              <SelectTrigger className="touch-manipulation h-12">
                                <SelectValue placeholder="Select table type" />
                              </SelectTrigger>
                              <SelectContent className="z-50 bg-popover">
                                <SelectItem value="regular" className="touch-manipulation">Regular Table</SelectItem>
                                <SelectItem value="vip" className="touch-manipulation">VIP Section</SelectItem>
                                <SelectItem value="booth" className="touch-manipulation">Premium Booth</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Select Date</Label>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                console.log('MOBILE DEBUG: Nightlife calendar date selected:', date);
                                setSelectedDate(date);
                              }}
                              className="rounded-md border touch-manipulation w-full"
                              disabled={(date) => {
                                // Block past dates
                                if (date < new Date()) return true;
                                // Block Mondays (1) and Tuesdays (2) - we're closed
                                const dayOfWeek = date.getDay();
                                return dayOfWeek === 1 || dayOfWeek === 2;
                              }}
                              modifiers={{
                                today: new Date()
                              }}
                              modifiersStyles={{
                                today: { backgroundColor: 'hsl(var(--primary))', color: 'white' }
                              }}
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
                     )}
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
