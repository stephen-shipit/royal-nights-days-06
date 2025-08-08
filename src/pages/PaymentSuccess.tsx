import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Users, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type ReservationDetails = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_count: number;
  birthday_package: boolean;
  total_price: number;
  special_requests?: string;
  events: {
    title: string;
    date: string;
    time: string;
  };
  venue_tables: {
    table_number: number;
  };
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get("session_id");
  const reservationId = searchParams.get("reservation_id");

  useEffect(() => {
    if (sessionId && reservationId) {
      verifyPaymentAndFetchDetails();
    } else {
      toast({
        title: "Invalid Payment Link",
        description: "Missing payment session information",
        variant: "destructive",
      });
      navigate("/events");
    }
  }, [sessionId, reservationId]);

  const verifyPaymentAndFetchDetails = async () => {
    try {
      console.log("Verifying payment for session:", sessionId);

      // Verify the payment with Stripe
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('verify-payment', {
        body: {
          sessionId,
          reservationId
        }
      });

      if (paymentError) {
        console.error("Payment verification error:", paymentError);
        toast({
          title: "Payment Verification Failed",
          description: "Could not verify your payment. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log("Payment verification result:", paymentData);

      if (paymentData.status !== "confirmed") {
        toast({
          title: "Payment Not Confirmed",
          description: "Your payment was not successful. Please try again.",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      // Fetch reservation details
      const { data: reservationData, error: reservationError } = await supabase
        .from("table_reservations")
        .select(`
          *,
          events (
            title,
            date,
            time
          ),
          venue_tables (
            table_number
          )
        `)
        .eq("id", reservationId)
        .single();

      if (reservationError) {
        console.error("Error fetching reservation:", reservationError);
        toast({
          title: "Error",
          description: "Could not load reservation details",
          variant: "destructive",
        });
        return;
      }

      setReservation(reservationData);
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="pt-20 pb-20 md:pb-0 flex items-center justify-center h-96">
          <div className="text-center">Verifying your payment...</div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="pt-20 pb-20 md:pb-0 flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg mb-4">Reservation not found</p>
            <Button onClick={() => navigate("/events")}>
              Back to Events
            </Button>
          </div>
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
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your table reservation has been confirmed
              </p>
            </div>

            {/* Reservation Details Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Reservation Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Event</p>
                    <p className="font-medium">{reservation.events.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Table Number</p>
                    <p className="font-medium">Table {reservation.venue_tables.table_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(reservation.events.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{reservation.events.time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Name</p>
                    <p className="font-medium">{reservation.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Party Size</p>
                    <p className="font-medium">{reservation.guest_count} guests</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{reservation.guest_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{reservation.guest_phone}</p>
                  </div>
                </div>

                {reservation.birthday_package && (
                  <div className="bg-accent/10 p-4 rounded-lg border border-accent">
                    <h3 className="font-medium text-accent mb-2">🎉 Birthday Shoutout Package Included!</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Special shoutout by our MC</li>
                      <li>• Your picture and name displayed on our large screen</li>
                      <li>• Sparklers and lights display at your table</li>
                      <li>• Custom name sign at your table</li>
                    </ul>
                  </div>
                )}

                {reservation.special_requests && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                    <p className="font-medium">{reservation.special_requests}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total Paid</span>
                    <span>${(reservation.total_price / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Please arrive 15 minutes before your reservation time</p>
                  <p>• Present this confirmation (or the email we sent you) at the entrance</p>
                  <p>• Dress code: Smart casual to formal attire recommended</p>
                  <p>• For changes or cancellations, please contact us at least 24 hours in advance</p>
                  <p>• Additional guests in your party are subject to the standard cover charge</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg mt-4">
                  <p className="text-sm font-medium">
                    A confirmation email has been sent to {reservation.guest_email} with all the details.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate("/events")}
                variant="outline"
                className="flex-1"
              >
                Browse More Events
              </Button>
              <Button 
                onClick={() => window.print()}
                className="flex-1"
              >
                Print Confirmation
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PaymentSuccess;