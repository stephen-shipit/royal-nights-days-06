import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star, CreditCard } from "lucide-react";
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
}

const VIPMemberships = () => {
  const navigate = useNavigate();

  const { data: levels, isLoading } = useQuery({
    queryKey: ["public-membership-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .eq("status", "active")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as MembershipLevel[];
    },
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getDurationText = (months: number) => {
    if (months === 0) return "Lifetime";
    if (months === 1) return "Monthly";
    if (months === 12) return "Yearly";
    return `${months} Months`;
  };

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
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Experience the royal treatment with exclusive benefits, priority access, 
              and unforgettable moments at Royal Palace DTX.
            </p>
          </div>
        </section>

        {/* Membership Cards */}
        <section className="py-16 container mx-auto px-4">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading memberships...</p>
            </div>
          ) : levels && levels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {levels.map((level, index) => (
                <Card 
                  key={level.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    index === 1 ? "border-secondary border-2 scale-105" : ""
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground px-4 py-1 text-sm font-semibold z-10">
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
                      <span className="text-4xl font-bold">{formatPrice(level.price)}</span>
                      <span className="text-muted-foreground ml-2">
                        / {getDurationText(level.duration_months)}
                      </span>
                    </div>
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
                      onClick={() => navigate(`/vip-memberships/${level.id}`)}
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
