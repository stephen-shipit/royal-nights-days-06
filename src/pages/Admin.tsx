import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAuth } from "@/components/AdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Calendar, Image, Utensils, MapPin, Layers, Grid, List } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { BulkImageUpload } from "@/components/BulkImageUpload";
import AdminHeader from "@/components/AdminHeader";
import AdminFooter from "@/components/AdminFooter";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch data for overview - moved before early return to follow rules of hooks
  const { data: menuItems } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated, // Only run when authenticated
  });

  const { data: reservations } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("table_reservations").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: galleryItems } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: venueTables } = useQuery({
    queryKey: ["venue-tables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venue_tables").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: homeModals } = useQuery({
    queryKey: ["home-modals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("home_modals").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={() => setIsAuthenticated(false)} />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your restaurant's content and reservations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="reservations" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reservations
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="modals" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Modals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reservations?.filter(r => r.status === 'confirmed').length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{events?.filter(e => {
                      try {
                        const eventDate = new Date(e.date);
                        return !isNaN(eventDate.getTime()) && eventDate >= new Date();
                      } catch {
                        return false;
                      }
                    }).length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{galleryItems?.length || 0}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reservations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reservations?.slice(0, 5).map((reservation) => (
                        <div key={reservation.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{reservation.guest_name}</p>
                            <p className="text-sm text-muted-foreground">{reservation.guest_count} guests</p>
                          </div>
                          <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                            {reservation.status}
                          </Badge>
                        </div>
                      )) || <p className="text-muted-foreground">No reservations yet</p>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Venue Tables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {venueTables?.slice(0, 5).map((table) => (
                        <div key={table.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">Table {table.table_number}</p>
                            <p className="text-sm text-muted-foreground">Max {table.max_guests} guests</p>
                          </div>
                          <Badge variant={table.is_available ? 'default' : 'destructive'}>
                            {table.is_available ? 'Available' : 'Occupied'}
                          </Badge>
                        </div>
                      )) || <p className="text-muted-foreground">No tables configured</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="menu">
              <MenuManagement />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationManagement />
            </TabsContent>

            <TabsContent value="events">
              <EventManagement />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryManagement />
            </TabsContent>

            <TabsContent value="tables">
              <TableManagement />
            </TabsContent>

            <TabsContent value="modals">
              <ModalManagement />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <AdminFooter />
    </div>
  );
};

// Menu Management Component
const MenuManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  const { data: menuItems, isLoading, refetch } = useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*");
      if (error) throw error;
      return data;
    },
  });

  const addMenuItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data, error } = await supabase.from("menu_items").insert([newItem]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["menu-items"], (old: any[]) => {
        if (!old) return data;
        return [...old, ...data];
      });
      toast({ title: "Menu item added successfully!" });
      setIsEditing(false);
      setEditingItem(null);
      setImageUrl('');
    },
    onError: (error) => {
      toast({ title: "Error adding menu item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("menu_items").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });
      const previousMenuItems = queryClient.getQueryData(["menu-items"]);
      queryClient.setQueryData(["menu-items"], (old: any[]) => {
        if (!old) return old;
        return old.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
      });
      return { previousMenuItems };
    },
    onSuccess: async () => {
      toast({ title: "Menu item updated successfully!" });
      setIsEditing(false);
      setEditingItem(null);
      setImageUrl('');
    },
    onError: (error, variables, context) => {
      if (context?.previousMenuItems) {
        queryClient.setQueryData(["menu-items"], context.previousMenuItems);
      }
      toast({ title: "Error updating menu item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });
      const previousMenuItems = queryClient.getQueryData(["menu-items"]);
      queryClient.setQueryData(["menu-items"], (old: any[]) => {
        if (!old) return old;
        return old.filter(item => item.id !== id);
      });
      return { previousMenuItems };
    },
    onSuccess: () => {
      toast({ title: "Menu item deleted successfully!" });
    },
    onError: (error, variables, context) => {
      if (context?.previousMenuItems) {
        queryClient.setQueryData(["menu-items"], context.previousMenuItems);
      }
      toast({ title: "Error deleting menu item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      category: formData.get("category") as string,
      image_url: imageUrl,
      ingredients: (formData.get("ingredients") as string).split(',').map(i => i.trim()),
      dietary: (formData.get("dietary") as string).split(',').map(d => d.trim()).filter(Boolean),
    };
    
    if (editingItem) {
      updateMenuItemMutation.mutate({ id: editingItem.id, updates: itemData });
    } else {
      addMenuItemMutation.mutate(itemData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditing(true);
    setImageUrl(item?.image_url || '');
    
    setTimeout(() => {
      const formElement = document.getElementById('menu-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => { setIsEditing(true); setEditingItem(null); setImageUrl(''); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Menu Item
        </Button>
      </div>

      {isEditing && (
        <Card id="menu-form">
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingItem?.id || 'new'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editingItem?.name || ""} required />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" defaultValue={editingItem?.price || ""} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingItem?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="main">Main Course</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                  <Input id="ingredients" name="ingredients" defaultValue={editingItem?.ingredients?.join(', ') || ""} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingItem?.description || ""} />
              </div>
              
              <div>
                <Label htmlFor="dietary">Dietary Info (comma-separated)</Label>
                <Input id="dietary" name="dietary" defaultValue={editingItem?.dietary?.join(', ') || ""} placeholder="e.g., vegetarian, gluten-free" />
              </div>
              
              <div>
                <Label>Item Image</Label>
                <ImageUpload 
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingItem(null); setImageUrl(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 items-center">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="appetizer">Appetizers</SelectItem>
            <SelectItem value="main">Main Courses</SelectItem>
            <SelectItem value="dessert">Desserts</SelectItem>
            <SelectItem value="beverage">Beverages</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'card' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('card')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems?.filter(item => categoryFilter === 'all' || item.category === categoryFilter).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems?.filter(item => categoryFilter === 'all' || item.category === categoryFilter).map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{item.name}</h3>
                    <span className="font-bold text-primary">{item.price}</span>
                  </div>
                  <Badge variant="outline" className="w-fit">{item.category}</Badge>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Ingredients:</strong> {item.ingredients.join(', ')}
                    </div>
                  )}
                  {item.dietary && item.dietary.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.dietary.map((diet: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">{diet}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Reservation Management Component
const ReservationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("table_reservations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase.from("table_reservations").update({ status }).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Reservation updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      toast({ title: "Error updating reservation", description: error.message, variant: "destructive" });
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("table_reservations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Reservation deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting reservation", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateReservationMutation.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      deleteReservationMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reservation Management</h2>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Special Requests</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations?.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell className="font-medium">{reservation.guest_name}</TableCell>
                <TableCell>{reservation.guest_email}</TableCell>
                <TableCell>{reservation.guest_email}</TableCell>
                <TableCell>{reservation.created_at?.split('T')[0]}</TableCell>
                <TableCell>{reservation.time_slot}</TableCell>
                <TableCell>{reservation.guest_count}</TableCell>
                <TableCell>
                  <Select value={reservation.status} onValueChange={(value) => handleStatusUpdate(reservation.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-xs truncate">{reservation.special_requests || "None"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(reservation.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Event Management Component
const EventManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async (newEvent: any) => {
      const { data, error } = await supabase.from("events").insert([newEvent]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Event added successfully!" });
      setIsEditing(false);
      setEditingEvent(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      toast({ title: "Error adding event", description: error.message, variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("events").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Event updated successfully!" });
      setIsEditing(false);
      setEditingEvent(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      toast({ title: "Error updating event", description: error.message, variant: "destructive" });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Event deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting event", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      price: formData.get("price") as string,
      max_attendees: parseInt(formData.get("max_attendees") as string),
      image_url: imageUrl,
      location: formData.get("location") as string,
      organizer_name: formData.get("organizer_name") as string,
      organizer_contact: formData.get("organizer_contact") as string,
    };
    
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, updates: eventData });
    } else {
      addEventMutation.mutate(eventData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setIsEditing(true);
    setImageUrl(event?.image_url || '');
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Button onClick={() => { setIsEditing(true); setEditingEvent(null); setImageUrl(''); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? "Edit Event" : "Add New Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingEvent?.id || 'new'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input id="title" name="title" defaultValue={editingEvent?.title || ""} required />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" defaultValue={editingEvent?.location || ""} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={editingEvent?.date || ""} required />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" defaultValue={editingEvent?.time || ""} required />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" defaultValue={editingEvent?.price || ""} required />
                </div>
                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input id="max_attendees" name="max_attendees" type="number" defaultValue={editingEvent?.max_attendees || ""} required />
                </div>
                <div>
                  <Label htmlFor="organizer_name">Organizer Name</Label>
                  <Input id="organizer_name" name="organizer_name" defaultValue={editingEvent?.organizer_name || ""} />
                </div>
                <div>
                  <Label htmlFor="organizer_contact">Organizer Contact</Label>
                  <Input id="organizer_contact" name="organizer_contact" defaultValue={editingEvent?.organizer_contact || ""} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingEvent?.description || ""} required />
              </div>
              
              <div>
                <Label>Event Image</Label>
                <ImageUpload 
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingEvent ? "Update Event" : "Add Event"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingEvent(null); setImageUrl(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              {event.image_url && (
                <img src={event.image_url} alt={event.title} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <div className="space-y-2">
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <div className="text-sm">
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Category:</strong> {event.category}</p>
                  <p><strong>Price:</strong> {event.price}</p>
                  <p><strong>Featured:</strong> {event.featured ? 'Yes' : 'No'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Gallery Management Component
const GalleryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addGalleryItemMutation = useMutation({
    mutationFn: async (newItem: any) => {
      const { data, error } = await supabase.from("gallery_items").insert([newItem]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Gallery item added successfully!" });
      setIsEditing(false);
      setEditingItem(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
    },
    onError: (error) => {
      toast({ title: "Error adding gallery item", description: error.message, variant: "destructive" });
    },
  });

  const updateGalleryItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("gallery_items").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Gallery item updated successfully!" });
      setIsEditing(false);
      setEditingItem(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
    },
    onError: (error) => {
      toast({ title: "Error updating gallery item", description: error.message, variant: "destructive" });
    },
  });

  const deleteGalleryItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Gallery item deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting gallery item", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: imageUrl,
      category: formData.get("category") as string,
    };
    
    if (editingItem) {
      updateGalleryItemMutation.mutate({ id: editingItem.id, updates: itemData });
    } else {
      addGalleryItemMutation.mutate(itemData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsEditing(true);
    setImageUrl(item?.image_url || '');
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      deleteGalleryItemMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <div className="flex gap-2">
          <Button onClick={() => { setIsEditing(true); setEditingItem(null); setImageUrl(''); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Gallery Item
          </Button>
        </div>
      </div>

      <BulkImageUpload onComplete={() => queryClient.invalidateQueries({ queryKey: ["gallery-items"] })} onCancel={() => {}} />

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingItem?.id || 'new'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingItem?.title || ""} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingItem?.category || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="ambiance">Ambiance</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="interior">Interior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingItem?.description || ""} />
              </div>
              
              <div>
                <Label>Image</Label>
                <ImageUpload 
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingItem(null); setImageUrl(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryItems?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <img src={item.src} alt={item.alt} className="w-full h-32 object-cover rounded mb-3" />
              <div className="space-y-2">
                <h3 className="font-semibold">{item.alt}</h3>
                <Badge variant="outline">{item.category}</Badge>
                <p className="text-sm text-muted-foreground">{item.alt}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Table Management Component
const TableManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);

  const { data: venueTables, isLoading } = useQuery({
    queryKey: ["venue-tables"],
    queryFn: async () => {
      const { data, error } = await supabase.from("venue_tables").select("*").order("table_number", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const addTableMutation = useMutation({
    mutationFn: async (newTable: any) => {
      const { data, error } = await supabase.from("venue_tables").insert([newTable]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Table added successfully!" });
      setIsEditing(false);
      setEditingTable(null);
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
    },
    onError: (error) => {
      toast({ title: "Error adding table", description: error.message, variant: "destructive" });
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("venue_tables").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Table updated successfully!" });
      setIsEditing(false);
      setEditingTable(null);
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
    },
    onError: (error) => {
      toast({ title: "Error updating table", description: error.message, variant: "destructive" });
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venue_tables").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Table deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting table", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tableData = {
      table_number: formData.get("table_number") as string,
      max_guests: parseInt(formData.get("max_guests") as string),
      location: formData.get("location") as string,
      reservation_price: parseInt(formData.get("reservation_price") as string) || 0,
      is_available: formData.get("is_available") === "true",
    };
    
    if (editingTable) {
      updateTableMutation.mutate({ id: editingTable.id, updates: tableData });
    } else {
      addTableMutation.mutate(tableData);
    }
  };

  const handleEdit = (table: any) => {
    setEditingTable(table);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      deleteTableMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Table Management</h2>
        <Button onClick={() => { setIsEditing(true); setEditingTable(null); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTable ? "Edit Table" : "Add New Table"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingTable?.id || 'new'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table_number">Table Number</Label>
                  <Input id="table_number" name="table_number" defaultValue={editingTable?.table_number || ""} required />
                </div>
                <div>
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input id="max_guests" name="max_guests" type="number" min="1" defaultValue={editingTable?.max_guests || ""} required />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" defaultValue={editingTable?.location || ""} placeholder="e.g., Main Dining, Patio, Bar" />
                </div>
                <div>
                  <Label htmlFor="reservation_price">Reservation Price ($)</Label>
                  <Input id="reservation_price" name="reservation_price" type="number" min="0" defaultValue={editingTable?.reservation_price || ""} placeholder="0" />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="is_available">Available</Label>
                  <Select name="is_available" defaultValue={editingTable?.is_available?.toString() || "true"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingTable ? "Update Table" : "Add Table"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingTable(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Table Number</TableHead>
              <TableHead>Max Guests</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venueTables?.map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-medium">{table.table_number}</TableCell>
                <TableCell>{table.max_guests}</TableCell>
                <TableCell>{table.location || "Not specified"}</TableCell>
                <TableCell>${table.reservation_price || 0}</TableCell>
                <TableCell>
                  <Badge variant={table.is_available ? 'default' : 'destructive'}>
                    {table.is_available ? 'Available' : 'Occupied'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(table)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(table.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// Modal Management Component  
const ModalManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingModal, setEditingModal] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');

  const { data: homeModals, isLoading } = useQuery({
    queryKey: ["home-modals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("home_modals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addModalMutation = useMutation({
    mutationFn: async (newModal: any) => {
      const { data, error } = await supabase.from("home_modals").insert([newModal]).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Modal added successfully!" });
      setIsEditing(false);
      setEditingModal(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
    },
    onError: (error) => {
      toast({ title: "Error adding modal", description: error.message, variant: "destructive" });
    },
  });

  const updateModalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("home_modals").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Modal updated successfully!" });
      setIsEditing(false);
      setEditingModal(null);
      setImageUrl('');
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
    },
    onError: (error) => {
      toast({ title: "Error updating modal", description: error.message, variant: "destructive" });
    },
  });

  const deleteModalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_modals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Modal deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting modal", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dataToSave = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      image_url: imageUrl,
      primary_button_text: formData.get("primary_button_text") as string,
      primary_button_action: formData.get("primary_button_action") as string,
      secondary_button_text: formData.get("secondary_button_text") as string,
      secondary_button_action: formData.get("secondary_button_action") as string,
      is_active: formData.get("is_active") === "true",
    };
    
    if (editingModal) {
      updateModalMutation.mutate({ id: editingModal.id, updates: dataToSave });
    } else {
      addModalMutation.mutate(dataToSave);
    }
  };

  const handleEdit = (modal: any) => {
    setEditingModal(modal);
    setIsEditing(true);
    setImageUrl(modal?.image_url || '');
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this modal?")) {
      deleteModalMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Modal Management</h2>
        <Button onClick={() => { setIsEditing(true); setEditingModal(null); setImageUrl(''); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Modal
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingModal ? "Edit Modal" : "Add New Modal"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingModal?.id || 'new'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingModal?.title || ""} required />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="is_active">Active</Label>
                  <Select name="is_active" defaultValue={editingModal?.is_active?.toString() || "true"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingModal?.description || ""} required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_button_text">Primary Button Text</Label>
                  <Input id="primary_button_text" name="primary_button_text" defaultValue={editingModal?.primary_button_text || ""} />
                </div>
                <div>
                  <Label htmlFor="primary_button_action">Primary Button Action</Label>
                  <Input id="primary_button_action" name="primary_button_action" defaultValue={editingModal?.primary_button_action || ""} placeholder="URL or action" />
                </div>
                <div>
                  <Label htmlFor="secondary_button_text">Secondary Button Text</Label>
                  <Input id="secondary_button_text" name="secondary_button_text" defaultValue={editingModal?.secondary_button_text || ""} />
                </div>
                <div>
                  <Label htmlFor="secondary_button_action">Secondary Button Action</Label>
                  <Input id="secondary_button_action" name="secondary_button_action" defaultValue={editingModal?.secondary_button_action || ""} placeholder="URL or action" />
                </div>
              </div>
              
              <div>
                <Label>Modal Image</Label>
                <ImageUpload 
                  value={imageUrl}
                  onChange={(url) => setImageUrl(url)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingModal ? "Update Modal" : "Add Modal"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingModal(null); setImageUrl(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homeModals?.map((modal) => (
          <Card key={modal.id}>
            <CardContent className="p-4">
              {modal.image_url && (
                <img src={modal.image_url} alt={modal.title} className="w-full h-32 object-cover rounded mb-3" />
              )}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{modal.title}</h3>
                  <Badge variant={modal.is_active ? 'default' : 'secondary'}>
                    {modal.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{modal.description}</p>
                <div className="text-xs text-muted-foreground">
                  {modal.primary_button_text && (
                    <p><strong>Primary:</strong> {modal.primary_button_text}</p>
                  )}
                  {modal.secondary_button_text && (
                    <p><strong>Secondary:</strong> {modal.secondary_button_text}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(modal)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(modal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Admin;
