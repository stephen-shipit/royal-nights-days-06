import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const reservationId = searchParams.get("reservation_id");

  useEffect(() => {
    if (reservationId) {
      cleanupCancelledReservation();
    }
  }, [reservationId]);

  const cleanupCancelledReservation = async () => {
    try {
      // Delete the pending reservation since payment was cancelled
      const { error } = await supabase
        .from("table_reservations")
        .delete()
        .eq("id", reservationId)
        .eq("status", "pending");

      if (error) {
        console.error("Error cleaning up cancelled reservation:", error);
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const handleRetryPayment = () => {
    // Navigate back to the events page to try again
    navigate("/events");
    toast({
      title: "Try Again",
      description: "You can select a table and try your reservation again",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      <div className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Cancellation Header */}
            <div className="text-center mb-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Payment Cancelled
              </h1>
              <p className="text-lg text-muted-foreground">
                Your reservation was not completed
              </p>
            </div>

            {/* Information Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What happened?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You cancelled the payment process before completing your table reservation. 
                  No charges have been made to your payment method.
                </p>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Your table is still available</h3>
                  <p className="text-sm text-muted-foreground">
                    The table you selected has been released and is available for booking. 
                    You can go back and complete your reservation whenever you're ready.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>If you're experiencing issues with the payment process:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Check that your payment information is correct</li>
                    <li>Ensure you have sufficient funds</li>
                    <li>Try a different payment method</li>
                    <li>Contact our support team if problems persist</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg mt-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Contact Support: reservations@venue.com | (555) 123-4567
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate("/events")}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Events
              </Button>
              <Button 
                onClick={handleRetryPayment}
                className="flex-1 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>

            {/* Additional Information */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                If you change your mind, you can always come back and make a reservation later.
                Popular tables book up quickly, so don't wait too long!
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PaymentCancelled;