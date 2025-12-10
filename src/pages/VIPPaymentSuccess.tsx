import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Loader2, QrCode } from "lucide-react";
import { Helmet } from "react-helmet-async";

const VIPPaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setError("Missing session ID");
        setStatus("error");
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.functions.invoke(
          "verify-membership-payment",
          {
            body: { sessionId },
          }
        );

        if (verifyError) throw verifyError;

        if (data?.success) {
          setCardUrl(data.cardUrl);
          setStatus("success");
        } else {
          throw new Error(data?.error || "Verification failed");
        }
      } catch (err: any) {
        console.error("Payment verification error:", err);
        setError(err.message || "Failed to verify payment");
        setStatus("error");
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-secondary" />
            <h1 className="text-xl font-bold mb-2">Activating Your Membership</h1>
            <p className="text-muted-foreground">Please wait while we process your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-xl font-bold mb-2">Something Went Wrong</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/vip")}>Back to Memberships</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Welcome to VIP | Royal Palace DTX</title>
      </Helmet>
      
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <Crown className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <h1 className="text-2xl font-bold mb-2">Welcome to VIP!</h1>
            <p className="text-muted-foreground mb-6">
              Your membership is now active. Check your email for your VIP card link.
            </p>
            
            <div className="space-y-3">
              {cardUrl && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate(cardUrl)}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  View Your VIP Card
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/")}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VIPPaymentSuccess;
