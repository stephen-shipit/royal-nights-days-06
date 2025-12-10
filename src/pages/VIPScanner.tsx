import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Camera, QrCode, Check, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  status: string;
  message: string;
  color: string;
  member_name?: string;
  level?: string;
  remaining_scans?: number;
  max_scans?: number;
  expiration_date?: string;
}

const VIPScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [eventName, setEventName] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      );

      setScanning(true);
    } catch (error) {
      console.error("Failed to start scanner:", error);
      alert("Failed to access camera. Please check permissions or use manual entry.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const extractToken = (input: string): string => {
    // Check if it's a URL with token parameter
    if (input.includes("token=")) {
      const url = new URL(input);
      return url.searchParams.get("token") || input;
    }
    // Otherwise return as-is (direct token)
    return input;
  };

  const handleScan = async (scannedData: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Stop scanner temporarily
    if (scannerRef.current) {
      await scannerRef.current.stop();
    }

    const token = extractToken(scannedData);
    await validateMembership(token);
  };

  const validateMembership = async (token: string) => {
    try {
      const { data, error } = await supabase.rpc('validate_membership_scan', {
        p_qr_token: token,
        p_event_name: eventName || null,
        p_scanned_by: null,
      });

      if (error) throw error;

      setResult(data as unknown as ScanResult);

      // Auto-clear result after 5 seconds
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
      resultTimeoutRef.current = setTimeout(() => {
        setResult(null);
        setIsProcessing(false);
        // Restart scanner if it was active
        if (scanning) {
          startScanning();
        }
      }, 5000);

    } catch (error) {
      console.error("Validation error:", error);
      setResult({
        status: "error",
        message: "Failed to validate membership",
        color: "red",
      });
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    
    setIsProcessing(true);
    await validateMembership(manualToken.trim());
    setManualToken("");
  };

  const resetScanner = () => {
    setResult(null);
    setIsProcessing(false);
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.color) {
      case "green":
        return <Check className="h-16 w-16 text-green-500" />;
      case "yellow":
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
      default:
        return <X className="h-16 w-16 text-red-500" />;
    }
  };

  const getResultBgColor = () => {
    if (!result) return "";
    switch (result.color) {
      case "green":
        return "bg-green-500/10 border-green-500";
      case "yellow":
        return "bg-yellow-500/10 border-yellow-500";
      default:
        return "bg-red-500/10 border-red-500";
    }
  };

  return (
    <>
      <Helmet>
        <title>VIP Scanner | Royal Palace DTX</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-primary p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <Crown className="h-10 w-10 mx-auto mb-2 text-secondary" />
            <h1 className="text-2xl font-bold text-primary-foreground">VIP Scanner</h1>
            <p className="text-primary-foreground/70 text-sm">Scan member QR codes to verify entry</p>
          </div>

          {/* Event Name */}
          <div>
            <Label className="text-primary-foreground">Event Name (Optional)</Label>
            <Input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g., Saturday Night VIP"
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
            />
          </div>

          {/* Result Display */}
          {result && (
            <Card className={`border-2 ${getResultBgColor()}`}>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {getResultIcon()}
                </div>
                <h2 className="text-xl font-bold mb-2">{result.message}</h2>
                {result.member_name && (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{result.member_name}</p>
                    {result.level && (
                      <Badge variant="secondary">{result.level}</Badge>
                    )}
                    {result.remaining_scans !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        Remaining scans: {result.remaining_scans} / {result.max_scans}
                      </p>
                    )}
                  </div>
                )}
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={resetScanner}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan Next
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Camera Scanner */}
          {!result && (
            <Card>
              <CardContent className="p-4">
                <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
                
                {!scanning ? (
                  <Button 
                    className="w-full mt-4" 
                    onClick={startScanning}
                    disabled={isProcessing}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera Scanner
                  </Button>
                ) : (
                  <Button 
                    className="w-full mt-4" 
                    variant="destructive"
                    onClick={stopScanning}
                  >
                    Stop Scanner
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual Entry */}
          {!result && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label>Manual Token Entry</Label>
                    <Input
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Enter membership token..."
                      disabled={isProcessing}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isProcessing || !manualToken.trim()}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Validate Token
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="text-center text-primary-foreground/50 text-xs space-y-1">
            <p>Point camera at member's QR code to scan</p>
            <p>Results are automatically logged</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VIPScanner;
