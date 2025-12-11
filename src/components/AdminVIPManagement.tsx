import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, Download, Crown, QrCode, Users, RefreshCw, History, CreditCard, Upload, X, Image } from "lucide-react";
import { format } from "date-fns";

interface MembershipLevel {
  id: string;
  name: string;
  price: number;
  description: string;
  perks: string[];
  duration_months: number;
  multi_user_enabled: boolean;
  max_daily_scans: number;
  status: string;
  sort_order: number;
  created_at: string;
  card_image_url: string | null;
  premium_1_month: number;
  premium_2_months: number;
  premium_3_months: number;
}

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
  created_at: string;
  membership_levels?: MembershipLevel;
}

interface ScanLog {
  id: string;
  membership_id: string;
  scanned_at: string;
  scan_status: string;
  event_name: string | null;
  memberships?: Membership;
}

const AdminVIPManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("levels");
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MembershipLevel | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membership | null>(null);
  const [filterLevelId, setFilterLevelId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Edit member form state
  const [editMemberForm, setEditMemberForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    expiration_date: "",
    active: true,
    membership_level_id: "",
  });

  // Form state for levels
  const [levelForm, setLevelForm] = useState({
    name: "",
    price: 0,
    description: "",
    perks: [""],
    duration_months: 12,
    multi_user_enabled: false,
    max_daily_scans: 1,
    status: "active",
    sort_order: 0,
    card_image_url: "" as string | null,
    premium_1_month: 20,
    premium_2_months: 15,
    premium_3_months: 10,
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch membership levels
  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: ["admin-membership-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_levels")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as MembershipLevel[];
    },
  });

  // Fetch memberships
  const { data: memberships, isLoading: membershipsLoading } = useQuery({
    queryKey: ["admin-memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("*, membership_levels(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Membership[];
    },
  });

  // Fetch scan logs
  const { data: scanLogs, isLoading: scanLogsLoading } = useQuery({
    queryKey: ["admin-scan-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_scan_logs")
        .select("*, memberships(*, membership_levels(*))")
        .order("scanned_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as ScanLog[];
    },
  });

  // Upload card image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `vip-card-${Date.now()}.${fileExt}`;
      const filePath = `vip-cards/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('admin-uploads')
        .getPublicUrl(filePath);

      setLevelForm({ ...levelForm, card_image_url: publicUrl });
      toast({
        title: "Image Uploaded",
        description: "Card image uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Create/Update level mutation
  const levelMutation = useMutation({
    mutationFn: async (data: typeof levelForm & { id?: string }) => {
      const payload = {
        name: data.name,
        price: data.price,
        description: data.description,
        perks: data.perks.filter(p => p.trim() !== ""),
        duration_months: data.duration_months,
        multi_user_enabled: data.multi_user_enabled,
        max_daily_scans: data.max_daily_scans,
        status: data.status,
        sort_order: data.sort_order,
        card_image_url: data.card_image_url || null,
        premium_1_month: data.premium_1_month,
        premium_2_months: data.premium_2_months,
        premium_3_months: data.premium_3_months,
      };

      if (data.id) {
        const { error } = await supabase
          .from("membership_levels")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("membership_levels").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-membership-levels"] });
      setLevelDialogOpen(false);
      resetLevelForm();
      toast({
        title: editingLevel ? "Level Updated" : "Level Created",
        description: editingLevel 
          ? "The membership level has been updated successfully."
          : "The membership level has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save membership level. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete level mutation
  const deleteLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("membership_levels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-membership-levels"] });
      toast({
        title: "Level Deleted",
        description: "The membership level has been deleted.",
      });
    },
  });

  // Update membership mutation
  const updateMembershipMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Membership> }) => {
      const { error } = await supabase
        .from("memberships")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast({
        title: "Membership Updated",
        description: "The membership has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update membership.",
        variant: "destructive",
      });
    },
  });

  // Delete membership mutation
  const deleteMembershipMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("memberships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      setMemberDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "Membership Deleted",
        description: "The membership has been deleted.",
      });
    },
  });

  // Extend membership mutation
  const extendMembershipMutation = useMutation({
    mutationFn: async ({ id, months }: { id: string; months: number }) => {
      const membership = memberships?.find(m => m.id === id);
      if (!membership) throw new Error("Membership not found");
      
      const currentExpiration = new Date(membership.expiration_date);
      const now = new Date();
      const startDate = currentExpiration > now ? currentExpiration : now;
      const newExpiration = new Date(startDate);
      newExpiration.setMonth(newExpiration.getMonth() + months);
      
      const { error } = await supabase
        .from("memberships")
        .update({ 
          expiration_date: newExpiration.toISOString(),
          active: true,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast({
        title: "Membership Extended",
        description: "The membership has been extended.",
      });
    },
  });

  const resetScansMutation = useMutation({
    mutationFn: async (membershipId?: string) => {
      if (membershipId) {
        // Reset single membership
        const membership = memberships?.find(m => m.id === membershipId);
        const level = levels?.find(l => l.id === membership?.membership_level_id);
        if (level) {
          const { error } = await supabase
            .from("memberships")
            .update({ 
              remaining_daily_scans: level.max_daily_scans,
              last_scan_reset_date: new Date().toISOString().split('T')[0]
            })
            .eq("id", membershipId);
          if (error) throw error;
        }
      } else {
        // Reset all - call the database function
        const { error } = await supabase.rpc('reset_membership_daily_scans');
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      toast({
        title: "Scans Reset",
        description: "Daily scan limits have been reset.",
      });
    },
  });

  const resetLevelForm = () => {
    setLevelForm({
      name: "",
      price: 0,
      description: "",
      perks: [""],
      duration_months: 12,
      multi_user_enabled: false,
      max_daily_scans: 1,
      status: "active",
      sort_order: 0,
      card_image_url: null,
      premium_1_month: 20,
      premium_2_months: 15,
      premium_3_months: 10,
    });
    setEditingLevel(null);
  };

  const openEditLevel = (level: MembershipLevel) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      price: level.price,
      description: level.description,
      perks: level.perks.length > 0 ? level.perks : [""],
      duration_months: level.duration_months,
      multi_user_enabled: level.multi_user_enabled,
      max_daily_scans: level.max_daily_scans,
      status: level.status,
      sort_order: level.sort_order,
      card_image_url: level.card_image_url,
      premium_1_month: level.premium_1_month ?? 20,
      premium_2_months: level.premium_2_months ?? 15,
      premium_3_months: level.premium_3_months ?? 10,
    });
    setLevelDialogOpen(true);
  };

  const handleLevelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    levelMutation.mutate(editingLevel ? { ...levelForm, id: editingLevel.id } : levelForm);
  };

  const addPerk = () => {
    setLevelForm({ ...levelForm, perks: [...levelForm.perks, ""] });
  };

  const updatePerk = (index: number, value: string) => {
    const newPerks = [...levelForm.perks];
    newPerks[index] = value;
    setLevelForm({ ...levelForm, perks: newPerks });
  };

  const removePerk = (index: number) => {
    const newPerks = levelForm.perks.filter((_, i) => i !== index);
    setLevelForm({ ...levelForm, perks: newPerks.length > 0 ? newPerks : [""] });
  };

  const openEditMember = (member: Membership) => {
    setSelectedMember(member);
    setEditMemberForm({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone || "",
      expiration_date: member.expiration_date.split('T')[0],
      active: member.active,
      membership_level_id: member.membership_level_id,
    });
    setEditMemberDialogOpen(true);
  };

  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    
    updateMembershipMutation.mutate({
      id: selectedMember.id,
      updates: {
        full_name: editMemberForm.full_name,
        email: editMemberForm.email,
        phone: editMemberForm.phone || null,
        expiration_date: new Date(editMemberForm.expiration_date).toISOString(),
        active: editMemberForm.active,
        membership_level_id: editMemberForm.membership_level_id,
      },
    });
    setEditMemberDialogOpen(false);
  };

  const filteredMemberships = memberships?.filter((m) => {
    const levelMatch = filterLevelId === "all" || m.membership_level_id === filterLevelId;
    const statusMatch = filterStatus === "all" || 
      (filterStatus === "active" && m.active && m.payment_status === "completed") ||
      (filterStatus === "inactive" && !m.active) ||
      (filterStatus === "pending" && m.payment_status === "pending");
    return levelMatch && statusMatch;
  });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusBadge = (membership: Membership) => {
    if (membership.payment_status === "pending") {
      return <Badge variant="secondary">Payment Pending</Badge>;
    }
    if (!membership.active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (new Date(membership.expiration_date) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-green-600">Active</Badge>;
  };

  const getScanStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      valid: "bg-green-600",
      limit_reached: "bg-yellow-600",
      invalid: "bg-red-600",
      expired: "bg-red-600",
      inactive: "bg-gray-600",
      unpaid: "bg-orange-600",
    };
    return <Badge className={variants[status] || "bg-gray-600"}>{status}</Badge>;
  };

  const exportMembersCSV = () => {
    if (!filteredMemberships) return;

    const headers = ["Name", "Email", "Phone", "Level", "Status", "Expiration", "Remaining Scans", "Joined"];
    const rows = filteredMemberships.map((m) => [
      m.full_name,
      m.email,
      m.phone || "",
      m.membership_levels?.name || "",
      m.active ? "Active" : "Inactive",
      format(new Date(m.expiration_date), "yyyy-MM-dd"),
      m.remaining_daily_scans,
      format(new Date(m.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vip-members-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Membership Levels
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
              {memberships && memberships.filter((m) => m.payment_status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {memberships.filter((m) => m.payment_status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="scans" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Scan History
            </TabsTrigger>
          </TabsList>

          {activeTab === "levels" && (
            <Dialog open={levelDialogOpen} onOpenChange={(open) => {
              setLevelDialogOpen(open);
              if (!open) resetLevelForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Level
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLevel ? "Edit Membership Level" : "Create Membership Level"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleLevelSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Level Name *</Label>
                      <Input
                        id="name"
                        value={levelForm.name}
                        onChange={(e) => setLevelForm({ ...levelForm, name: e.target.value })}
                        placeholder="e.g., Gold, Platinum, Royal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price (cents) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={levelForm.price}
                        onChange={(e) => setLevelForm({ ...levelForm, price: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 9999 for $99.99"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPrice(levelForm.price)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={levelForm.description}
                      onChange={(e) => setLevelForm({ ...levelForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Card Image Upload */}
                  <div className="space-y-2">
                    <Label>Card Image</Label>
                    <p className="text-xs text-muted-foreground">
                      Upload an image to display as the VIP card preview (recommended: 800x500px)
                    </p>
                    {levelForm.card_image_url ? (
                      <div className="relative w-full max-w-xs aspect-[1.6/1] rounded-lg overflow-hidden border">
                        <img 
                          src={levelForm.card_image_url} 
                          alt="Card preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => setLevelForm({ ...levelForm, card_image_url: null })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Perks & Benefits</Label>
                    <div className="space-y-2">
                      {levelForm.perks.map((perk, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={perk}
                            onChange={(e) => updatePerk(index, e.target.value)}
                            placeholder="Enter a perk..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePerk(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={addPerk}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Perk
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (months)</Label>
                      <Select
                        value={levelForm.duration_months.toString()}
                        onValueChange={(v) => setLevelForm({ ...levelForm, duration_months: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Month</SelectItem>
                          <SelectItem value="3">3 Months</SelectItem>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">1 Year</SelectItem>
                          <SelectItem value="0">Lifetime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={levelForm.status}
                        onValueChange={(v) => setLevelForm({ ...levelForm, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Multi-User Settings</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Multi-User</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow multiple scans per day for this membership
                        </p>
                      </div>
                      <Switch
                        checked={levelForm.multi_user_enabled}
                        onCheckedChange={(checked) => setLevelForm({ 
                          ...levelForm, 
                          multi_user_enabled: checked,
                          max_daily_scans: checked ? 2 : 1
                        })}
                      />
                    </div>
                    {levelForm.multi_user_enabled && (
                      <div>
                        <Label htmlFor="max_scans">Max Daily Scans</Label>
                        <Input
                          id="max_scans"
                          type="number"
                          min={1}
                          max={10}
                          value={levelForm.max_daily_scans}
                          onChange={(e) => setLevelForm({ ...levelForm, max_daily_scans: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pricing Premiums Section */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium">Short-Term Pricing Premiums</h4>
                    <p className="text-sm text-muted-foreground">
                      Set percentage premiums added to shorter-term memberships (calculated from yearly rate)
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="premium_1">1 Month Premium (%)</Label>
                        <Input
                          id="premium_1"
                          type="number"
                          min={0}
                          max={100}
                          value={levelForm.premium_1_month}
                          onChange={(e) => setLevelForm({ ...levelForm, premium_1_month: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="premium_2">2 Months Premium (%)</Label>
                        <Input
                          id="premium_2"
                          type="number"
                          min={0}
                          max={100}
                          value={levelForm.premium_2_months}
                          onChange={(e) => setLevelForm({ ...levelForm, premium_2_months: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="premium_3">3 Months Premium (%)</Label>
                        <Input
                          id="premium_3"
                          type="number"
                          min={0}
                          max={100}
                          value={levelForm.premium_3_months}
                          onChange={(e) => setLevelForm({ ...levelForm, premium_3_months: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setLevelDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={levelMutation.isPending}>
                      {levelMutation.isPending ? "Saving..." : editingLevel ? "Update Level" : "Create Level"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "members" && (
            <div className="flex gap-4">
              <Select value={filterLevelId} onValueChange={setFilterLevelId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => resetScansMutation.mutate(undefined)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset All Scans
              </Button>
              <Button variant="outline" onClick={exportMembersCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}
        </div>

        {/* Membership Levels Tab */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>VIP Membership Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {levelsLoading ? (
                <p className="text-muted-foreground">Loading levels...</p>
              ) : levels && levels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Multi-User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-medium">{level.name}</TableCell>
                        <TableCell>{formatPrice(level.price)}</TableCell>
                        <TableCell>
                          {level.duration_months === 0 ? "Lifetime" : `${level.duration_months} months`}
                        </TableCell>
                        <TableCell>
                          {level.multi_user_enabled ? (
                            <Badge variant="secondary">{level.max_daily_scans} scans/day</Badge>
                          ) : (
                            <span className="text-muted-foreground">Single</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={level.status === "active" ? "default" : "secondary"}>
                            {level.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditLevel(level)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm("Delete this membership level?")) {
                                  deleteLevelMutation.mutate(level.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No membership levels created yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>VIP Members</CardTitle>
            </CardHeader>
            <CardContent>
              {membershipsLoading ? (
                <p className="text-muted-foreground">Loading members...</p>
              ) : filteredMemberships && filteredMemberships.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Scans Today</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMemberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{membership.full_name}</p>
                            <p className="text-sm text-muted-foreground">{membership.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{membership.membership_levels?.name}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(membership)}</TableCell>
                        <TableCell>
                          {format(new Date(membership.expiration_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {membership.remaining_daily_scans} / {membership.membership_levels?.max_daily_scans || 1}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedMember(membership);
                                setMemberDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => resetScansMutation.mutate(membership.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={membership.active ? "destructive" : "default"}
                              onClick={() => updateMembershipMutation.mutate({
                                id: membership.id,
                                updates: { active: !membership.active }
                              })}
                            >
                              {membership.active ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No members found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan History Tab */}
        <TabsContent value="scans">
          <Card>
            <CardHeader>
              <CardTitle>Recent Scan History</CardTitle>
            </CardHeader>
            <CardContent>
              {scanLogsLoading ? (
                <p className="text-muted-foreground">Loading scan history...</p>
              ) : scanLogs && scanLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Event</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.scanned_at), "MMM d, yyyy h:mm a")}
                        </TableCell>
                        <TableCell>
                          {log.memberships?.full_name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {log.memberships?.membership_levels?.name || "-"}
                        </TableCell>
                        <TableCell>{getScanStatusBadge(log.scan_status)}</TableCell>
                        <TableCell>{log.event_name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">No scan history yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Member Details Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedMember.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedMember.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <p className="font-medium">{selectedMember.membership_levels?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p className="font-medium">
                    {format(new Date(selectedMember.purchase_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Expires</Label>
                  <p className="font-medium">
                    {format(new Date(selectedMember.expiration_date), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">QR Token</Label>
                <p className="font-mono text-sm break-all">{selectedMember.qr_code_token}</p>
              </div>
              
              {/* Quick Extend Options */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Quick Extend</Label>
                <div className="flex gap-2">
                  {[1, 3, 6, 12].map((months) => (
                    <Button
                      key={months}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Extend membership by ${months} month(s)?`)) {
                          extendMembershipMutation.mutate({ id: selectedMember.id, months });
                        }
                      }}
                    >
                      +{months}mo
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`/vip-card/${selectedMember.qr_code_token}`, '_blank');
                  }}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  View Card
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMemberDialogOpen(false);
                    openEditMember(selectedMember);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this membership? This cannot be undone.")) {
                      deleteMembershipMutation.mutate(selectedMember.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Membership</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMemberSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editMemberForm.full_name}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editMemberForm.email}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editMemberForm.phone}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Membership Level</Label>
                <Select 
                  value={editMemberForm.membership_level_id} 
                  onValueChange={(value) => setEditMemberForm({ ...editMemberForm, membership_level_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels?.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-expiration">Expiration Date</Label>
                <Input
                  id="edit-expiration"
                  type="date"
                  value={editMemberForm.expiration_date}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, expiration_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="edit-active"
                  checked={editMemberForm.active}
                  onCheckedChange={(checked) => setEditMemberForm({ ...editMemberForm, active: checked })}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVIPManagement;
