import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/utils";

interface MembershipLevel {
  id: string;
  name: string;
  price: number;
  description: string;
  duration_months: number;
}

const VIPPurchase = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const { data: level, isLoading } = useQuery({
    queryKey: ["membership-level-purchase", levelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("id", levelId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as MembershipLevel | null;
    },
    enabled: !!levelId,
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (form.phone && !validatePhoneNumber(form.phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-membership-payment', {
        body: {
          membershipLevelId: levelId,
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone || null,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Membership Not Found</h1>
          <Button onClick={() => navigate("/vip-memberships")}>View All Memberships</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Purchase {level.name} Membership | Royal Palace DTX</title>
        <meta name="description" content={`Complete your ${level.name} VIP membership purchase at Royal Palace DTX.`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            className="mb-8"
            onClick={() => navigate(`/vip-memberships/${levelId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Button>

          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Crown className="h-10 w-10 mx-auto mb-2 text-secondary" />
                <CardTitle className="text-2xl">{level.name} Membership</CardTitle>
                <p className="text-3xl font-bold mt-2">{formatPrice(level.price)}</p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Your membership card will be sent to this email
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 555-5555"
                    />
                  </div>

                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-2">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>1. Complete secure payment via Stripe</li>
                      <li>2. Receive your digital VIP card via email</li>
                      <li>3. Show your QR code at any Royal Palace event</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment - {formatPrice(level.price)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By purchasing, you agree to our terms of service and membership guidelines.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default VIPPurchase;
