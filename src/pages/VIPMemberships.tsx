import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star, CreditCard, LogIn } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface MembershipLevel {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  duration_months: number;
  multi_user_enabled: boolean;
  max_daily_scans: number;
  card_image_url: string | null;
  premium_1_month: number;
  premium_2_months: number;
  premium_3_months: number;
}

type DurationOption = 1 | 2 | 3 | 12;

const VIPMemberships = () => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(12);

  const { data: levels, isLoading } = useQuery({
    queryKey: ["public-membership-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("status", "active")
        .eq("duration_months", 12) // Get yearly as base prices
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as MembershipLevel[];
    },
  });

  // Calculate price based on selected duration using premiums from database
  const calculatePrice = (level: MembershipLevel, months: DurationOption) => {
    const monthlyRate = level.price / 12;
    if (months === 12) return level.price;
    if (months === 3) return Math.round(monthlyRate * 3 * (1 + level.premium_3_months / 100));
    if (months === 2) return Math.round(monthlyRate * 2 * (1 + level.premium_2_months / 100));
    return Math.round(monthlyRate * (1 + level.premium_1_month / 100));
  };

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
    if (months === 12) return "Year";
    return `${months} Months`;
  };

  const durationOptions: { value: DurationOption; label: string; badge?: string }[] = [
    { value: 1, label: "1 Month" },
    { value: 2, label: "2 Months" },
    { value: 3, label: "3 Months" },
    { value: 12, label: "1 Year", badge: "Best Value" },
  ];

  return (
    <>
      <Helmet>
        <title>VIP Memberships | Royal Palace DTX</title>
        <meta name="description" content="Join our exclusive VIP membership program and enjoy premium benefits, priority access, and special perks at Royal Palace DTX." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-primary py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary"></div>
          <div className="relative z-10 container mx-auto px-4">
            <Crown className="h-16 w-16 mx-auto mb-6 text-secondary" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              VIP Membership
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-6">
              Experience the royal treatment with exclusive benefits, priority access, 
              and unforgettable moments at Royal Palace DTX.
            </p>
            <Button 
              variant="outline" 
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/vip-login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Already a Member? Sign In
            </Button>
          </div>
        </section>

        {/* Duration Toggle */}
        <section className="py-8 container mx-auto px-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedDuration === option.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                  {option.badge && selectedDuration === option.value && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                      {option.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Cards */}
        <section className="pb-16 container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading memberships...</p>
            </div>
          ) : levels && levels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {levels.map((level, index) => (
                <Card 
                  key={level.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    index === 1 ? "border-secondary border-2" : ""
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold z-10">
                      Most Popular
                    </div>
                  )}
                  
                  {/* Card Image Preview */}
                  {level.card_image_url ? (
                    <div className="relative w-full aspect-[1.6/1] overflow-hidden bg-gradient-to-br from-primary to-primary/80">
                      <img 
                        src={level.card_image_url} 
                        alt={`${level.name} VIP Card`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-[1.6/1] bg-gradient-to-br from-primary via-primary/90 to-secondary/30 flex items-center justify-center">
                      <div className="text-center">
                        <CreditCard className="h-12 w-12 text-primary-foreground/60 mx-auto mb-2" />
                        <p className="text-primary-foreground/60 text-sm font-medium">{level.name} Card</p>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <Star className="h-8 w-8 text-secondary" />
                    </div>
                    <CardTitle className="text-2xl">{level.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{formatPrice(calculatePrice(level, selectedDuration))}</span>
                      <span className="text-muted-foreground ml-2">
                        / {getDurationText(selectedDuration)}
                      </span>
                    </div>
                    {selectedDuration === 12 && (
                      <p className="text-xs text-secondary mt-1">Save up to {level.premium_1_month}% vs monthly</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground text-center">{level.description}</p>
                    
                    {/* Top 3 Perks Preview */}
                    <ul className="space-y-3">
                      {level.perks.slice(0, 3).map((perk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{perk}</span>
                        </li>
                      ))}
                      {level.perks.length > 3 && (
                        <li className="text-sm text-muted-foreground text-center">
                          + {level.perks.length - 3} more benefits
                        </li>
                      )}
                    </ul>

                    {level.multi_user_enabled && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Multi-User: {level.max_daily_scans} entries/day
                      </Badge>
                    )}

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => navigate(`/vip-memberships/${level.id}?duration=${selectedDuration}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">
                VIP memberships will be available soon. Check back later!
              </p>
            </div>
          )}
        </section>

        {/* Why Join Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Join VIP?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Priority Access</h3>
                <p className="text-muted-foreground">Skip the line and enjoy VIP entry at all our events.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Exclusive Perks</h3>
                <p className="text-muted-foreground">Enjoy member-only discounts, complimentary items, and more.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Digital Card</h3>
                <p className="text-muted-foreground">Access your membership card anytime on your phone.</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default VIPMemberships;
