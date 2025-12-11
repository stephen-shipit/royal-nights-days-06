import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Check, Package, MapPin, Clock, User, Crown } from "lucide-react";
import { format } from "date-fns";

interface PhysicalCardRequest {
  id: string;
  membership_id: string;
  user_id: string;
  status: string;
  requested_at: string;
  ready_at: string | null;
  picked_up_at: string | null;
  admin_notes: string | null;
  memberships?: {
    full_name: string;
    email: string;
    phone: string | null;
    membership_levels?: {
      name: string;
    };
  };
}

const AdminPhysicalCardManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<PhysicalCardRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch physical card requests with membership info
  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-physical-card-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("physical_card_requests")
        .select(`
          *,
          memberships (
            full_name,
            email,
            phone,
            membership_levels (
              name
            )
          )
        `)
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data as PhysicalCardRequest[];
    },
  });

  // Update request status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, any> = { status };
      
      if (status === "ready") {
        updates.ready_at = new Date().toISOString();
      } else if (status === "picked_up") {
        updates.picked_up_at = new Date().toISOString();
      }
      
      if (notes !== undefined) {
        updates.admin_notes = notes;
      }

      const { error } = await supabase
        .from("physical_card_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-physical-card-requests"] });
      toast({
        title: "Status Updated",
        description: "The card request status has been updated.",
      });
      setDetailsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Save notes mutation
  const saveNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("physical_card_requests")
        .update({ admin_notes: notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-physical-card-requests"] });
      toast({
        title: "Notes Saved",
        description: "Admin notes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notes.",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests?.filter((r) => {
    if (filterStatus === "all") return true;
    return r.status === filterStatus;
  });

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;
  const readyCount = requests?.filter((r) => r.status === "ready").length || 0;
  const pickedUpCount = requests?.filter((r) => r.status === "picked_up").length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-500 border-yellow-600/30">Pending</Badge>;
      case "ready":
        return <Badge className="bg-green-600/20 text-green-500 border-green-600/30">Ready for Pickup</Badge>;
      case "picked_up":
        return <Badge className="bg-blue-600/20 text-blue-500 border-blue-600/30">Picked Up</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDetails = (request: PhysicalCardRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-600/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-yellow-600/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-600/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-600/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready for Pickup</p>
              <p className="text-2xl font-bold">{readyCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-600/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
              <Check className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Picked Up</p>
              <p className="text-2xl font-bold">{pickedUpCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="ready">Ready for Pickup</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Physical Card Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests && filteredRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.memberships?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{request.memberships?.email}</p>
                        {request.memberships?.phone && (
                          <p className="text-sm text-muted-foreground">{request.memberships?.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-secondary/50">
                        <Crown className="h-3 w-3 mr-1" />
                        {request.memberships?.membership_levels?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requested_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {request.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "ready" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Mark Ready
                          </Button>
                        )}
                        {request.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: request.id, status: "picked_up" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Mark Picked Up
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetails(request)}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No physical card requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Card Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member</p>
                  <p className="font-medium">{selectedRequest.memberships?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membership Level</p>
                  <p className="font-medium">{selectedRequest.memberships?.membership_levels?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedRequest.memberships?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedRequest.memberships?.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested</p>
                  <p className="font-medium">
                    {format(new Date(selectedRequest.requested_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                {selectedRequest.ready_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ready At</p>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.ready_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                )}
                {selectedRequest.picked_up_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Picked Up At</p>
                    <p className="font-medium">
                      {format(new Date(selectedRequest.picked_up_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => saveNotesMutation.mutate({ id: selectedRequest.id, notes: adminNotes })}
                  disabled={saveNotesMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: "ready",
                      notes: adminNotes 
                    })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Ready
                  </Button>
                )}
                {selectedRequest.status === "ready" && (
                  <Button
                    onClick={() => updateStatusMutation.mutate({ 
                      id: selectedRequest.id, 
                      status: "picked_up",
                      notes: adminNotes 
                    })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Picked Up
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPhysicalCardManagement;
