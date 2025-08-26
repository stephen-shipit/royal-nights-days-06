import React, { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, MapPin, Clock, User } from "lucide-react";

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
  event_id: string | null;
  table_id: string;
  reservation_type: string | null;
}

interface VenueTable {
  id: string;
  table_number: number;
  max_guests: number;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  location: string | null;
  reservation_price: number | null;
  is_available: boolean;
}

interface GuestListDrawerProps {
  reservations: Reservation[];
  tables: VenueTable[];
  onGuestClick: (table: VenueTable, reservation: Reservation) => void;
}

export function GuestListDrawer({ reservations, tables, onGuestClick }: GuestListDrawerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredGuests = useMemo(() => {
    return reservations.filter(reservation =>
      reservation.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.guest_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reservations, searchQuery]);

  const getGuestStatus = (reservation: Reservation) => {
    if (reservation.checked_out_at) return "checked_out";
    if (reservation.checked_in_at) return "checked_in";
    return "reserved";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reserved":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Reserved</Badge>;
      case "checked_in":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Checked In</Badge>;
      case "checked_out":
        return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">Checked Out</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTableForReservation = (reservation: Reservation) => {
    return tables.find(table => table.id === reservation.table_id);
  };

  const handleGuestClick = (reservation: Reservation) => {
    const table = getTableForReservation(reservation);
    if (table) {
      onGuestClick(table, reservation);
      setIsOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Guests ({reservations.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guest List
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Guest List */}
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No guests found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search</p>
                )}
              </div>
            ) : (
              filteredGuests.map((reservation) => {
                const table = getTableForReservation(reservation);
                const status = getGuestStatus(reservation);
                
                return (
                  <div
                    key={reservation.id}
                    onClick={() => handleGuestClick(reservation)}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{reservation.guest_name}</span>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>Table {table?.table_number || "N/A"}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>{reservation.guest_count} guests</span>
                      </div>
                      
                      {reservation.time_slot && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>{reservation.time_slot}</span>
                        </div>
                      )}
                      
                      {reservation.special_requests && (
                        <div className="text-xs text-muted-foreground/80 mt-1">
                          {reservation.special_requests}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}