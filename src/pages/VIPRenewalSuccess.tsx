import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crown, CheckCircle, AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

const VIPRenewalSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (!sessionId) {
        setStatus("error");
        setError("No payment session found");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-renewal-payment", {
          body: { sessionId },
        });

        if (error) {
          throw error;
        }

        if (data?.success) {
          setStatus("success");
          setCardUrl(data.cardUrl);
        } else {
          throw new Error(data?.error || "Verification failed");
        }
      } catch (err: any) {
        console.error("Renewal verification error:", err);
        setStatus("error");
        setError(err.message || "Failed to verify renewal");
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-primary-foreground/70">Confirming Your Renewal...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">
            Renewal Failed
          </h1>
          <p className="text-primary-foreground/70 mb-6">{error}</p>
          <Button onClick={() => navigate("/vip-memberships")}>
            Back to Memberships
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Membership Renewed! | Royal Palace DTX</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="relative mb-6">
            <Crown className="h-16 w-16 mx-auto text-secondary" />
            <CheckCircle className="h-8 w-8 absolute bottom-0 right-1/2 translate-x-8 text-green-500 bg-primary rounded-full" />
          </div>
          
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Membership Renewed!
          </h1>
          <p className="text-primary-foreground/70 mb-8">
            Your VIP membership has been successfully renewed. A confirmation email has been sent.
          </p>

          <div className="space-y-4">
            {cardUrl && (
              <Button 
                className="w-full"
                onClick={() => navigate(cardUrl)}
              >
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
        </div>
      </div>
    </>
  );
};

export default VIPRenewalSuccess;
