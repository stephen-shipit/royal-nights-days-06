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
import { Plus, Edit, Trash2, Users, Calendar, Image, Utensils, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
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

  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onLogout={() => setIsAuthenticated(false)} />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your restaurant's content and reservations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
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
                    <div className="text-2xl font-bold">{events?.filter(e => new Date(e.date) >= new Date()).length || 0}</div>
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

  const { data: menuItems, isLoading } = useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Menu item added successfully!" });
      setIsEditing(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast({ title: "Error adding menu item", description: error.message, variant: "destructive" });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data, error } = await supabase.from("menu_items").update(updates).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Menu item updated successfully!" });
      setIsEditing(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast({ title: "Error updating menu item", description: error.message, variant: "destructive" });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({ title: "Menu item deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting menu item", description: error.message, variant: "destructive" });
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
    setImageUrl(item?.image_url || '');
    setIsEditing(true);
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
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Select name="category" defaultValue={editingItem?.category || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="mains">Main Courses</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="image_url">Image</Label>
                  <ImageUpload 
                    value={imageUrl || editingItem?.image_url || ""}
                    onChange={setImageUrl}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingItem?.description || ""} required />
              </div>
              <div>
                <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
                <Input id="ingredients" name="ingredients" placeholder="ingredient1, ingredient2, ingredient3" defaultValue={editingItem?.ingredients?.join(', ') || ""} />
              </div>
              <div>
                <Label htmlFor="dietary">Dietary Info (comma-separated)</Label>
                <Input id="dietary" name="dietary" placeholder="vegetarian, gluten-free, etc." defaultValue={editingItem?.dietary?.join(', ') || ""} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingItem ? "Update Item" : "Add Item"}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingItem(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
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
              {menuItems?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
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
        </CardContent>
      </Card>
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
      const { data, error } = await supabase.from("table_reservations").select("*");
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
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast({ title: "Reservation updated successfully!" });
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
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast({ title: "Reservation deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting reservation", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
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
      <h2 className="text-2xl font-bold">Reservation Management</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>All Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations?.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.guest_name}</TableCell>
                  <TableCell>{reservation.guest_email}</TableCell>
                  <TableCell>{reservation.guest_count}</TableCell>
                  <TableCell>{reservation.reservation_type}</TableCell>
                  <TableCell>{reservation.time_slot}</TableCell>
                  <TableCell>
                    <Select
                      value={reservation.status}
                      onValueChange={(value) => handleStatusChange(reservation.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(reservation.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
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
  const [eventImageUrl, setEventImageUrl] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*");
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event added successfully!" });
      setIsEditing(false);
      setEditingEvent(null);
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event updated successfully!" });
      setIsEditing(false);
      setEditingEvent(null);
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
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({ title: "Event deleted successfully!" });
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
      category: formData.get("category") as string,
      price: formData.get("price") as string,
      price_range: formData.get("price_range") as string,
      host: formData.get("host") as string,
      dj: formData.get("dj") as string,
      image_url: eventImageUrl,
    };
    
    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, updates: eventData });
    } else {
      addEventMutation.mutate(eventData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setEventImageUrl(event?.image_url || '');
    setIsEditing(true);
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
        <Button onClick={() => { setIsEditing(true); setEditingEvent(null); setEventImageUrl(''); }} className="flex items-center gap-2">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingEvent?.title || ""} required />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={editingEvent?.date || ""} required />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" defaultValue={editingEvent?.time || ""} required />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" defaultValue={editingEvent?.category || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live-music">Live Music</SelectItem>
                      <SelectItem value="dj-night">DJ Night</SelectItem>
                      <SelectItem value="special-event">Special Event</SelectItem>
                      <SelectItem value="private-party">Private Party</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" defaultValue={editingEvent?.price || ""} required />
                </div>
                <div>
                  <Label htmlFor="price_range">Price Range</Label>
                  <Input id="price_range" name="price_range" defaultValue={editingEvent?.price_range || ""} required />
                </div>
                <div>
                  <Label htmlFor="host">Host</Label>
                  <Input id="host" name="host" defaultValue={editingEvent?.host || ""} />
                </div>
                <div>
                  <Label htmlFor="dj">DJ</Label>
                  <Input id="dj" name="dj" defaultValue={editingEvent?.dj || ""} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="image_url">Image</Label>
                  <ImageUpload 
                    value={eventImageUrl || editingEvent?.image_url || ""}
                    onChange={setEventImageUrl}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingEvent?.description || ""} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingEvent ? "Update Event" : "Add Event"}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingEvent(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.time}</TableCell>
                  <TableCell>{event.category}</TableCell>
                  <TableCell>{event.price}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Gallery Management Component
const GalleryManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [galleryImageUrl, setGalleryImageUrl] = useState('');

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_items").select("*");
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
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      toast({ title: "Gallery item added successfully!" });
      setIsEditing(false);
      setEditingItem(null);
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
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      toast({ title: "Gallery item updated successfully!" });
      setIsEditing(false);
      setEditingItem(null);
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
      queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
      toast({ title: "Gallery item deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting gallery item", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      src: galleryImageUrl,
      alt: formData.get("alt") as string,
      category: formData.get("category") as string,
      gallery_type: formData.get("gallery_type") as string,
    };
    
    if (editingItem) {
      updateGalleryItemMutation.mutate({ id: editingItem.id, updates: itemData });
    } else {
      addGalleryItemMutation.mutate(itemData);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setGalleryImageUrl(item?.src || '');
    setIsEditing(true);
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
        <Button onClick={() => { setIsEditing(true); setEditingItem(null); setGalleryImageUrl(''); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image">Image</Label>
                  <ImageUpload 
                    value={galleryImageUrl || editingItem?.src || ""}
                    onChange={setGalleryImageUrl}
                  />
                </div>
                <div>
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input id="alt" name="alt" defaultValue={editingItem?.alt || ""} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue={editingItem?.category || ""} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atmosphere">Atmosphere</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="interior">Interior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gallery_type">Gallery Type</Label>
                    <Select name="gallery_type" defaultValue={editingItem?.gallery_type || ""} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gallery type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Gallery</SelectItem>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="archive">Archive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingItem ? "Update Item" : "Add Item"}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingItem(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems?.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <img 
                src={item.src} 
                alt={item.alt} 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <div className="space-y-2">
                <p className="font-medium">{item.alt}</p>
                <div className="flex gap-2">
                  <Badge>{item.category}</Badge>
                  <Badge variant="outline">{item.gallery_type}</Badge>
                </div>
                <div className="flex gap-2">
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
      const { data, error } = await supabase.from("venue_tables").select("*");
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
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
      toast({ title: "Table added successfully!" });
      setIsEditing(false);
      setEditingTable(null);
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
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
      toast({ title: "Table updated successfully!" });
      setIsEditing(false);
      setEditingTable(null);
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
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
      toast({ title: "Table deleted successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error deleting table", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tableData = {
      table_number: parseInt(formData.get("table_number") as string),
      max_guests: parseInt(formData.get("max_guests") as string),
      position_x: parseFloat(formData.get("position_x") as string),
      position_y: parseFloat(formData.get("position_y") as string),
      width: parseFloat(formData.get("width") as string),
      height: parseFloat(formData.get("height") as string),
      reservation_price: parseInt((parseFloat(formData.get("reservation_price") as string) * 100).toString()),
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table_number">Table Number</Label>
                  <Input id="table_number" name="table_number" type="number" defaultValue={editingTable?.table_number || ""} required />
                </div>
                <div>
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input id="max_guests" name="max_guests" type="number" defaultValue={editingTable?.max_guests || ""} required />
                </div>
                <div>
                  <Label htmlFor="position_x">Position X</Label>
                  <Input id="position_x" name="position_x" type="number" step="0.1" defaultValue={editingTable?.position_x || "0"} required />
                </div>
                <div>
                  <Label htmlFor="position_y">Position Y</Label>
                  <Input id="position_y" name="position_y" type="number" step="0.1" defaultValue={editingTable?.position_y || "0"} required />
                </div>
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" name="width" type="number" step="0.1" defaultValue={editingTable?.width || "100"} required />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" name="height" type="number" step="0.1" defaultValue={editingTable?.height || "80"} required />
                </div>
                <div>
                  <Label htmlFor="reservation_price">Reservation Price ($)</Label>
                  <Input id="reservation_price" name="reservation_price" type="number" step="0.01" defaultValue={editingTable ? (editingTable.reservation_price / 100).toFixed(2) : "0"} required />
                </div>
                <div>
                  <Label htmlFor="is_available">Availability</Label>
                  <Select name="is_available" defaultValue={editingTable?.is_available?.toString() || "true"} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Available</SelectItem>
                      <SelectItem value="false">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingTable ? "Update Table" : "Add Table"}</Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setEditingTable(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Venue Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Number</TableHead>
                <TableHead>Max Guests</TableHead>
                <TableHead>Position (X, Y)</TableHead>
                <TableHead>Size (W x H)</TableHead>
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
                  <TableCell>({table.position_x}, {table.position_y})</TableCell>
                  <TableCell>{table.width} x {table.height}</TableCell>
                  <TableCell>${(table.reservation_price / 100).toFixed(2)}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;