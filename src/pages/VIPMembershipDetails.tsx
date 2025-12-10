import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ArrowLeft, Users, Clock, Shield } from "lucide-react";
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
}

const VIPMembershipDetails = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const { data: level, isLoading } = useQuery({
    queryKey: ["membership-level", levelId],
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

  const getDurationText = (months: number) => {
    if (months === 0) return "Lifetime Access";
    if (months === 1) return "1 Month";
    if (months === 12) return "1 Year";
    return `${months} Months`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading membership details...</p>
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
          <p className="text-muted-foreground mb-8">This membership level doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate("/vip-memberships")}>View All Memberships</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{level.name} VIP Membership | Royal Palace DTX</title>
        <meta name="description" content={level.description} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <Button 
            variant="ghost" 
            className="mb-8"
            onClick={() => navigate("/vip-memberships")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Memberships
          </Button>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="bg-primary text-primary-foreground p-8 text-center">
                <Crown className="h-12 w-12 mx-auto mb-4 text-secondary" />
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{level.name}</h1>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-5xl font-bold">{formatPrice(level.price)}</span>
                  <span className="text-primary-foreground/70 text-lg">
                    / {getDurationText(level.duration_months)}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-8 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">About This Membership</h2>
                  <p className="text-muted-foreground leading-relaxed">{level.description}</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <p className="font-medium">{getDurationText(level.duration_months)}</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <p className="font-medium">
                      {level.multi_user_enabled ? `${level.max_daily_scans} entries/day` : "Single User"}
                    </p>
                    <p className="text-sm text-muted-foreground">Access Type</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <p className="font-medium">Instant Activation</p>
                    <p className="text-sm text-muted-foreground">Start Today</p>
                  </div>
                </div>

                {/* Full Perks List */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">All Benefits Included</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {level.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-3 bg-muted/50 rounded-lg p-3">
                        <Check className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Multi-User Info */}
                {level.multi_user_enabled && (
                  <div className="bg-secondary/10 rounded-lg p-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5 text-secondary" />
                      Multi-User Membership
                    </h3>
                    <p className="text-muted-foreground">
                      This membership allows up to {level.max_daily_scans} entries per day. 
                      Perfect for bringing guests or family members to events.
                      Scan limits reset automatically at midnight each day.
                    </p>
                  </div>
                )}

                {/* Rules & Guidelines */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Terms & Conditions</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Membership is non-transferable and linked to your email address</li>
                    <li>• QR code must be presented at entry for verification</li>
                    <li>• Benefits are subject to availability at each event</li>
                    <li>• Membership cannot be paused or refunded after purchase</li>
                    <li>• Daily scan limits reset at midnight Central Time</li>
                  </ul>
                </div>

                {/* Purchase Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate(`/vip-purchase/${level.id}`)}
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Purchase Membership - {formatPrice(level.price)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default VIPMembershipDetails;
