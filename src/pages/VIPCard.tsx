import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Download, Calendar, Users, Clock, Key, Eye, EyeOff, Check, LogOut, RefreshCw, CreditCard, MapPin } from "lucide-react";
import { differenceInDays } from "date-fns";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import QRCode from "react-qr-code";

interface Membership {
  id: string;
  membership_level_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  qr_code_token: string;
  purchase_date: string;
  expiration_date: string;
  remaining_daily_scans: number;
  last_scan_reset_date: string;
  active: boolean;
  payment_status: string;
  membership_levels?: {
    name: string;
    max_daily_scans: number;
    multi_user_enabled: boolean;
  };
}

interface PhysicalCardRequest {
  id: string;
  status: string;
  requested_at: string;
  ready_at: string | null;
  picked_up_at: string | null;
}

interface ScanLog {
  id: string;
  scanned_at: string;
  scan_status: string;
  event_name: string | null;
}

const VIPCard = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);
  const [selectedRenewalDuration, setSelectedRenewalDuration] = useState(12);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setCurrentUserId(session?.user?.id ?? null);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
      setCurrentUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/vip-memberships");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Re-authenticate with current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Unable to verify user");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password changed successfully!");
      setShowPasswordSection(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRenewal = async () => {
    if (!membership) return;
    
    setIsRenewing(true);
    try {
      const { data, error } = await supabase.functions.invoke("renew-membership-payment", {
        body: {
          membershipId: membership.id,
          durationMonths: selectedRenewalDuration,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (err: any) {
      console.error("Renewal error:", err);
      toast.error(err.message || "Failed to start renewal");
    } finally {
      setIsRenewing(false);
    }
  };

  const { data: membership, isLoading } = useQuery({
    queryKey: ["vip-card", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("*, membership_levels(*)")
        .eq("qr_code_token", token)
        .maybeSingle();
      if (error) throw error;
      return data as Membership | null;
    },
    enabled: !!token,
  });

  const { data: scanLogs } = useQuery({
    queryKey: ["vip-card-scans", membership?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_scan_logs")
        .select("*")
        .eq("membership_id", membership!.id)
        .order("scanned_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as ScanLog[];
    },
    enabled: !!membership?.id,
  });

  // Physical card request query
  const { data: physicalCardRequest } = useQuery({
    queryKey: ["physical-card-request", membership?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physical_card_requests")
        .select("*")
        .eq("membership_id", membership!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PhysicalCardRequest | null;
    },
    enabled: !!membership?.id && isLoggedIn,
  });

  // Physical card request mutation
  const requestPhysicalCardMutation = useMutation({
    mutationFn: async () => {
      if (!membership || !currentUserId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("physical_card_requests")
        .insert({
          membership_id: membership.id,
          user_id: currentUserId,
          status: "pending",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Physical card request submitted! Pick it up at Royal Palace.");
      queryClient.invalidateQueries({ queryKey: ["physical-card-request", membership?.id] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to request physical card");
    },
  });

  const downloadCard = () => {
    // Create a canvas and draw the card for download
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;

    if (ctx) {
      // Background
      ctx.fillStyle = "#141414";
      ctx.fillRect(0, 0, 400, 600);

      // Gold border
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 380, 580);

      // Title
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 24px serif";
      ctx.textAlign = "center";
      ctx.fillText("ROYAL PALACE DTX", 200, 50);
      ctx.font = "16px sans-serif";
      ctx.fillText("VIP MEMBERSHIP", 200, 75);

      // Member info
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(membership?.full_name || "", 200, 120);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#D4AF37";
      ctx.fillText(membership?.membership_levels?.name || "", 200, 145);

      // QR Code - draw as image
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 100, 170, 200, 200);
        
        // Expiration
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Expires: ${format(new Date(membership?.expiration_date || ""), "MMM d, yyyy")}`, 200, 410);

        // Download
        const link = document.createElement("a");
        link.download = `vip-card-${membership?.full_name?.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-4 text-primary-foreground/70">Loading your card...</p>
        </div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Card Not Found</h1>
            <p className="text-muted-foreground">
              This membership card doesn't exist or the link is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(membership.expiration_date) < new Date();
  const isPending = membership.payment_status === "pending";
  const isInactive = !membership.active;
  const daysUntilExpiry = differenceInDays(new Date(membership.expiration_date), new Date());
  const showRenewal = daysUntilExpiry <= 30 || isExpired;

  return (
    <>
      <Helmet>
        <title>VIP Card - {membership.full_name} | Royal Palace DTX</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-primary py-8 px-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* VIP Card */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-secondary/30">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>
            
            <div className="p-8 text-center">
              {/* Header */}
              <Crown className="h-10 w-10 mx-auto mb-2 text-secondary" />
              <h1 className="text-secondary font-bold text-xl tracking-wider">ROYAL PALACE DTX</h1>
              <p className="text-secondary/70 text-sm tracking-widest">VIP MEMBERSHIP</p>
              
              {/* Member Name */}
              <div className="mt-6 mb-4">
                <p className="text-white text-2xl font-bold">{membership.full_name}</p>
                <Badge className="mt-2 bg-secondary text-secondary-foreground">
                  {membership.membership_levels?.name}
                </Badge>
              </div>

              {/* Status Badge */}
              {(isExpired || isPending || isInactive) && (
                <Badge 
                  variant="destructive" 
                  className="mb-4"
                >
                  {isPending ? "Payment Pending" : isInactive ? "Inactive" : "Expired"}
                </Badge>
              )}

              {/* QR Code */}
              <div className="bg-white rounded-xl p-4 inline-block my-4">
                <QRCode
                  id="qr-code-svg"
                  value={`https://twbqokjjdopxcgiiuluz.supabase.co/functions/v1/scan-membership?token=${membership.qr_code_token}`}
                  size={180}
                  level="H"
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 text-white/80 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  <span>Expires: {format(new Date(membership.expiration_date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span>
                    {membership.remaining_daily_scans} / {membership.membership_levels?.max_daily_scans} scans
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button 
            className="w-full" 
            variant="outline"
            onClick={downloadCard}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Card Image
          </Button>

          {/* Renewal Section */}
          {showRenewal && membership.payment_status === "completed" && (
            <Card className="border-secondary/30 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
              <CardContent className="p-4 space-y-4">
                <div className="text-center">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-secondary" />
                  <h3 className="font-semibold text-foreground">
                    {isExpired ? "Your Membership Has Expired" : `Expiring in ${daysUntilExpiry} days`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isExpired ? "Renew now to continue enjoying VIP benefits" : "Renew early to keep your benefits"}
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setSelectedRenewalDuration(months)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        selectedRenewalDuration === months
                          ? "border-secondary bg-secondary/20 text-secondary"
                          : "border-border bg-card hover:border-secondary/50"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {months === 12 ? "1 Year" : `${months}mo`}
                      </span>
                    </button>
                  ))}
                </div>

                <Button 
                  className="w-full"
                  onClick={handleRenewal}
                  disabled={isRenewing}
                >
                  {isRenewing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew Membership
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Physical Card Request - Only for logged in users */}
          {isLoggedIn && membership.payment_status === "completed" && (
            <Card className="border-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold">Physical VIP Card</h3>
                </div>
                
                {!physicalCardRequest ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Request a physical VIP card to pick up at Royal Palace.
                    </p>
                    <Button 
                      className="w-full"
                      onClick={() => requestPhysicalCardMutation.mutate()}
                      disabled={requestPhysicalCardMutation.isPending}
                    >
                      {requestPhysicalCardMutation.isPending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Request Physical Card
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge 
                        className={
                          physicalCardRequest.status === "ready" 
                            ? "bg-green-600" 
                            : physicalCardRequest.status === "picked_up"
                              ? "bg-blue-600"
                              : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {physicalCardRequest.status === "ready" 
                          ? "Ready for Pickup" 
                          : physicalCardRequest.status === "picked_up"
                            ? "Picked Up"
                            : "Processing"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Requested:</span>
                      <span>{format(new Date(physicalCardRequest.requested_at), "MMM d, yyyy")}</span>
                    </div>
                    {physicalCardRequest.status === "ready" && (
                      <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-500">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">Ready at Royal Palace!</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Visit us to pick up your physical VIP card.
                        </p>
                      </div>
                    )}
                    {physicalCardRequest.status === "picked_up" && physicalCardRequest.picked_up_at && (
                      <p className="text-xs text-muted-foreground">
                        Picked up on {format(new Date(physicalCardRequest.picked_up_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Change Password Section - Only for logged in users */}
          {isLoggedIn && (
            <Card>
              <CardContent className="p-4">
                {!showPasswordSection ? (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowPasswordSection(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Change Password
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 chars)"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Update
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sign Out Button - Only for logged in users */}
          {isLoggedIn && (
            <Button 
              variant="outline" 
              className="w-full text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}

          {/* Scan History */}
          {scanLogs && scanLogs.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Scan History
                </h3>
                <div className="space-y-2">
                  {scanLogs.slice(0, 5).map((log) => (
                    <div 
                      key={log.id} 
                      className="flex justify-between items-center text-sm py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(log.scanned_at), "MMM d, yyyy")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(log.scanned_at), "h:mm a")}
                        </p>
                      </div>
                      <Badge 
                        className={
                          log.scan_status === "valid" 
                            ? "bg-green-600" 
                            : log.scan_status === "limit_reached" 
                              ? "bg-yellow-600" 
                              : "bg-red-600"
                        }
                      >
                        {log.scan_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <p className="text-center text-primary-foreground/50 text-xs">
            Present this QR code at the door for VIP entry.
            <br />
            Scan limits reset daily at midnight.
          </p>
        </div>
      </div>
    </>
  );
};

export default VIPCard;
