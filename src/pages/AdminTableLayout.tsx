import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Users, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
} from "@xyflow/react";
import { CheckInModal } from "@/components/CheckInModal";
import { toast } from "sonner";
import "@xyflow/react/dist/style.css";

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

interface Event {
  id: string;
  title: string;
  date: string;
}

const TableNode = ({ data }: { data: any }) => {
  const { table, reservation, onClick } = data;
  
  const getTableStatus = () => {
    if (!reservation) return "available";
    if (reservation.checked_out_at) return "checked_out";
    if (reservation.checked_in_at) return "checked_in";
    return "reserved";
  };

  const getStatusColor = () => {
    const status = getTableStatus();
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-300";
      case "reserved": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "checked_in": return "bg-blue-100 text-blue-800 border-blue-300";
      case "checked_out": return "bg-gray-100 text-gray-600 border-gray-300";
      default: return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  const getStatusText = () => {
    const status = getTableStatus();
    switch (status) {
      case "available": return "Available";
      case "reserved": return "Reserved";
      case "checked_in": return "Checked In";
      case "checked_out": return "Checked Out";
      default: return "Unknown";
    }
  };

  return (
    <div
      className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${getStatusColor()}`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className="font-bold text-lg">T{table.table_number}</div>
        <div className="text-xs">{table.max_guests} seats</div>
        <div className="text-xs mt-1">{getStatusText()}</div>
        {reservation && (
          <>
            <div className="text-xs font-medium mt-1">{reservation.guest_name}</div>
            <div className="text-xs">Party of {reservation.guest_count}</div>
          </>
        )}
        {table.location && (
          <div className="text-xs text-muted-foreground">{table.location}</div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

export default function AdminTableLayout() {
  const [tables, setTables] = useState<VenueTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<VenueTable | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Update nodes when data changes
  useEffect(() => {
    if (selectedEvent || selectedDate) {
      loadReservations();
    }
  }, [selectedEvent, selectedDate]);

  useEffect(() => {
    updateNodes();
  }, [tables, reservations]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('table_reservations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_reservations'
        },
        () => {
          loadReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEvent, selectedDate]);

  const loadData = async () => {
    try {
      const [tablesResponse, eventsResponse] = await Promise.all([
        supabase.from("venue_tables").select("*").order("table_number"),
        supabase.from("events").select("id, title, date").order("date", { ascending: false })
      ]);

      if (tablesResponse.error) throw tablesResponse.error;
      if (eventsResponse.error) throw eventsResponse.error;

      setTables(tablesResponse.data);
      setEvents(eventsResponse.data);
      
      // Set default event to today's event if available
      const today = new Date().toISOString().split('T')[0];
      const todayEvent = eventsResponse.data.find(event => event.date === today);
      if (todayEvent) {
        setSelectedEvent(todayEvent.id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load table layout data");
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    if (!selectedDate) return;
    
    try {
      let query = supabase
        .from("table_reservations")
        .select("*");

      if (selectedEvent) {
        query = query.eq("event_id", selectedEvent);
      } else {
        // For dining reservations, find by date
        const startDate = selectedDate + " 00:00:00";
        const endDate = selectedDate + " 23:59:59";
        query = query
          .gte("created_at", startDate)
          .lte("created_at", endDate)
          .eq("reservation_type", "dining");
      }

      const { data, error } = await query.eq("status", "confirmed");
      
      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error loading reservations:", error);
      toast.error("Failed to load reservations");
    }
  };

  const updateNodes = () => {
    const filteredTables = tables.filter(table => 
      searchQuery === "" || 
      table.table_number.toString().includes(searchQuery) ||
      (table.location && table.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const newNodes: Node[] = filteredTables.map((table) => {
      const reservation = reservations.find(r => r.table_id === table.id);
      
      return {
        id: table.id,
        type: "table",
        position: { x: table.position_x, y: table.position_y },
        data: {
          table,
          reservation,
          onClick: () => handleTableClick(table, reservation),
        },
        style: {
          width: table.width,
          height: table.height,
        },
        draggable: false,
      };
    });

    setNodes(newNodes);
  };

  const handleTableClick = (table: VenueTable, reservation: Reservation | undefined) => {
    setSelectedTable(table);
    setSelectedReservation(reservation || null);
    setIsModalOpen(true);
  };

  const handleCheckInOut = async (action: "check_in" | "check_out") => {
    if (!selectedReservation) return;

    try {
      const { data: adminUser } = await supabase.auth.getUser();
      if (!adminUser.user) throw new Error("Not authenticated");

      const updates: any = {};
      if (action === "check_in") {
        updates.checked_in_at = new Date().toISOString();
        updates.checked_in_by = adminUser.user.id;
      } else {
        updates.checked_out_at = new Date().toISOString();
        updates.checked_out_by = adminUser.user.id;
      }

      const { error } = await supabase
        .from("table_reservations")
        .update(updates)
        .eq("id", selectedReservation.id);

      if (error) throw error;

      toast.success(`Guest ${action === "check_in" ? "checked in" : "checked out"} successfully`);
      setIsModalOpen(false);
      loadReservations();
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Failed to ${action.replace("_", " ")} guest`);
    }
  };

  const getStatusCounts = () => {
    const counts = {
      available: 0,
      reserved: 0,
      checked_in: 0,
      checked_out: 0,
    };

    tables.forEach(table => {
      const reservation = reservations.find(r => r.table_id === table.id);
      if (!reservation) {
        counts.available++;
      } else if (reservation.checked_out_at) {
        counts.checked_out++;
      } else if (reservation.checked_in_at) {
        counts.checked_in++;
      } else {
        counts.reserved++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading table layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Table Layout Management</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tables or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* Date Filter */}
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />

            {/* Event Filter */}
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} ({event.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Summary */}
        <div className="px-4 pb-4 flex gap-4">
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
            Available: {statusCounts.available}
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <div className="w-2 h-2 rounded-full bg-yellow-600 mr-2"></div>
            Reserved: {statusCounts.reserved}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
            Checked In: {statusCounts.checked_in}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
            <div className="w-2 h-2 rounded-full bg-gray-600 mr-2"></div>
            Checked Out: {statusCounts.checked_out}
          </Badge>
        </div>
      </div>

      {/* Table Layout */}
      <div className="flex-1" style={{ height: "calc(100vh - 200px)" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          style={{ backgroundColor: "hsl(var(--background))" }}
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              const reservation = reservations.find(r => r.table_id === node.id);
              if (!reservation) return "#10b981"; // green
              if (reservation.checked_out_at) return "#6b7280"; // gray
              if (reservation.checked_in_at) return "#3b82f6"; // blue
              return "#f59e0b"; // yellow
            }}
          />
        </ReactFlow>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        table={selectedTable}
        reservation={selectedReservation}
        onCheckIn={() => handleCheckInOut("check_in")}
        onCheckOut={() => handleCheckInOut("check_out")}
      />
    </div>
  );
}