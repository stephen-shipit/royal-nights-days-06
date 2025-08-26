import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Calendar,
  MessageSquare,
  Gift,
  CheckCircle,
  XCircle
} from "lucide-react";

interface VenueTable {
  id: string;
  table_number: number;
  max_guests: number;
  location: string | null;
  reservation_price: number | null;
}

interface Reservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  guest_count: number;
  status: string;
  checked_in_at: string | null;
  checked_out_at: string | null;
  time_slot: string | null;
  special_requests: string | null;
  birthday_package: boolean | null;
  reservation_type: string | null;
}

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: VenueTable | null;
  reservation: Reservation | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function CheckInModal({
  isOpen,
  onClose,
  table,
  reservation,
  onCheckIn,
  onCheckOut,
}: CheckInModalProps) {
  if (!table) return null;

  const getTableStatus = () => {
    if (!reservation) return "available";
    if (reservation.checked_out_at) return "checked_out";
    if (reservation.checked_in_at) return "checked_in";
    return "reserved";
  };

  const getStatusBadge = () => {
    const status = getTableStatus();
    switch (status) {
      case "available":
        return <Badge className="bg-success text-success-foreground">Available</Badge>;
      case "reserved":
        return <Badge className="bg-warning text-warning-foreground">Reserved</Badge>;
      case "checked_in":
        return <Badge className="bg-info text-info-foreground">Checked In</Badge>;
      case "checked_out":
        return <Badge className="bg-muted text-muted-foreground">Checked Out</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MapPin className="h-5 w-5" />
            Table {table.table_number}
            {getStatusBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Capacity: {table.max_guests} guests</span>
            </div>
            {table.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Location: {table.location}</span>
              </div>
            )}
            {table.reservation_price && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Price: ${table.reservation_price}</span>
              </div>
            )}
          </div>

          {/* Reservation Information */}
          {reservation ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reservation Details</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{reservation.guest_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Party of {reservation.guest_count}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{reservation.guest_email}</span>
                </div>

                {reservation.guest_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{reservation.guest_phone}</span>
                  </div>
                )}

                {reservation.time_slot && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time Slot: {reservation.time_slot}</span>
                  </div>
                )}

                {reservation.reservation_type && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="capitalize">
                      {reservation.reservation_type}
                    </Badge>
                  </div>
                )}

                {reservation.birthday_package && (
                  <div className="flex items-center gap-3">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Birthday Package Included</span>
                  </div>
                )}

                {reservation.special_requests && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Special Requests:</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {reservation.special_requests}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Check-in/Check-out History */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status History</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Reservation Status: {reservation.status}</span>
                  </div>
                  
                  {reservation.checked_in_at && (
                    <div className="flex items-center gap-2 text-info">
                      <CheckCircle className="h-3 w-3" />
                      <span>Checked in: {formatTime(reservation.checked_in_at)}</span>
                    </div>
                  )}
                  
                  {reservation.checked_out_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-3 w-3" />
                      <span>Checked out: {formatTime(reservation.checked_out_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                {!reservation.checked_in_at && !reservation.checked_out_at && (
                  <Button onClick={onCheckIn} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Check In Guest
                  </Button>
                )}
                
                {reservation.checked_in_at && !reservation.checked_out_at && (
                  <Button 
                    onClick={onCheckOut}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Check Out Guest
                  </Button>
                )}

                {reservation.checked_out_at && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Guest has been checked out
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>No reservation for this table</p>
              <p className="text-sm">Table is currently available</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}