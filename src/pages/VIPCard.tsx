import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Download, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
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

interface ScanLog {
  id: string;
  scanned_at: string;
  scan_status: string;
  event_name: string | null;
}

const VIPCard = () => {
  const { token } = useParams();

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
