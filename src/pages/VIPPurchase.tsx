import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet-async";
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/utils";
import { z } from "zod";

interface MembershipLevel {
  id: string;
  name: string;
  price: number;
  description: string;
  duration_months: number;
  premium_1_month: number;
  premium_2_months: number;
  premium_3_months: number;
}

type DurationOption = 1 | 2 | 3 | 12;

const VIPPurchase = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const durationParam = parseInt(searchParams.get("duration") || "12") as DurationOption;
  const selectedDuration: DurationOption = [1, 2, 3, 12].includes(durationParam) ? durationParam : 12;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

  // Calculate price based on selected duration using premiums from database
  const calculatePrice = (months: DurationOption) => {
    if (!level) return 0;
    const monthlyRate = level.price / 12;
    if (months === 12) return level.price;
    if (months === 3) return Math.round(monthlyRate * 3 * (1 + level.premium_3_months / 100));
    if (months === 2) return Math.round(monthlyRate * 2 * (1 + level.premium_2_months / 100));
    return Math.round(monthlyRate * (1 + level.premium_1_month / 100));
  };

  const currentPrice = calculatePrice(selectedDuration);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getDurationText = (months: number) => {
    if (months === 1) return "1 Month";
    if (months === 2) return "2 Months";
    if (months === 3) return "3 Months";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate email
    const emailSchema = z.string().trim().email({ message: "Invalid email address" });
    const emailResult = emailSchema.safeParse(form.email);
    if (!emailResult.success) {
      toast({
        title: "Invalid Email",
        description: emailResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Validate password
    if (!form.password) {
      setPasswordError("Password is required");
      toast({
        title: "Password Required",
        description: "Please create a password for your account.",
        variant: "destructive",
      });
      return;
    }

    if (form.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
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
          password: form.password,
          durationMonths: selectedDuration,
          calculatedPrice: currentPrice,
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
                <p className="text-sm text-muted-foreground">{getDurationText(selectedDuration)}</p>
                <p className="text-3xl font-bold mt-2">{formatPrice(currentPrice)}</p>
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

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Create Your Account Password</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => {
                              setForm({ ...form, password: e.target.value });
                              setPasswordError("");
                            }}
                            placeholder="Create a password"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          At least 6 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => {
                              setForm({ ...form, confirmPassword: e.target.value });
                              setPasswordError("");
                            }}
                            placeholder="Confirm your password"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {passwordError && (
                          <p className="text-sm text-destructive mt-1">{passwordError}</p>
                        )}
                      </div>
                    </div>
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
                        Proceed to Payment - {formatPrice(currentPrice)}
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
