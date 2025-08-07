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
      // Update the cache with the new item
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });
      
      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData(["menu-items"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["menu-items"], (old: any[]) => {
        if (!old) return old;
        return old.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
      });
      
      // Return a context object with the snapshotted value
      return { previousMenuItems };
    },
    onSuccess: async () => {
      toast({ title: "Menu item updated successfully!" });
      setIsEditing(false);
      setEditingItem(null);
      setImageUrl('');
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMenuItems) {
        queryClient.setQueryData(["menu-items"], context.previousMenuItems);
      }
      toast({ title: "Error updating menu item", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["menu-items"] });
      
      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData(["menu-items"]);
      
      // Optimistically remove the item
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
      // If the mutation fails, use the context returned from onMutate to roll back
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
    // Set the image URL to the existing item's image URL or empty string
    setImageUrl(item?.image_url || '');
    
    // Scroll to the top of the form
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
                  <Select name="category" defaultValue={editingItem?.category || ""} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="appetizers">Appetizers</SelectItem>
                      <SelectItem value="mains">Main Courses</SelectItem>
                      <SelectItem value="salads">Salads</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="alacarte-sides">A La Carte Sides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="image_url">Image</Label>
                  <ImageUpload 
                    value={imageUrl}
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
                <Button type="button" variant="outline" onClick={() => { 
                  setIsEditing(false); 
                  setEditingItem(null); 
                  setImageUrl('');
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Menu Items</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="flex items-center gap-2"
                >
                  <Grid className="h-4 w-4" />
                  Cards
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="category-filter" className="text-sm">Filter by Category:</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="mains">Mains</SelectItem>
                    <SelectItem value="salads">Salads</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="alacarte-sides">A La Carte Sides</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const filteredItems = menuItems?.filter(item => categoryFilter === 'all' || item.category === categoryFilter) || [];
            return (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Showing {filteredItems.length} of {menuItems?.length || 0} menu items
                </p>
                {viewMode === 'list' ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    const sibling = target.nextElementSibling as HTMLElement;
                                    target.style.display = 'none';
                                    if (sibling) sibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs" style={{ display: item.image_url ? 'none' : 'flex' }}>
                                No Image
                              </div>
                            </div>
                          </TableCell>
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
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                const sibling = target.nextElementSibling as HTMLElement;
                                target.style.display = 'none';
                                if (sibling) sibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ display: item.image_url ? 'none' : 'flex' }}>
                            No Image
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="secondary">{item.category}</Badge>
                            <span className="font-bold text-lg">{item.price}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="flex-1 flex items-center gap-1">
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="flex-1 flex items-center gap-1">
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

// Reservation Management Component
const ReservationManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for search, filters, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: allReservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("table_reservations").select("*").order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Filter and search reservations
  const filteredReservations = allReservations?.filter(reservation => {
    // Search by name or email
    const matchesSearch = !searchTerm || 
      reservation.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guest_email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by status
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;

    // Filter by type
    const matchesType = typeFilter === 'all' || reservation.reservation_type === typeFilter;

    // Filter by date range
    const reservationDate = new Date(reservation.created_at);
    const matchesDateRange = (!startDate || reservationDate >= startDate) && 
                            (!endDate || reservationDate <= endDate);

    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

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

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reservation Management</h2>
        <div className="text-sm text-muted-foreground">
          {filteredReservations.length} of {allReservations?.length || 0} reservations
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">Search by Name or Email</Label>
              <Input
                id="search"
                placeholder="Enter name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dining">Dining</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="nightlife">Nightlife</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button variant="outline" onClick={resetFilters} className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reservations found matching your criteria.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">{reservation.guest_name}</TableCell>
                      <TableCell>{reservation.guest_email}</TableCell>
                      <TableCell>{reservation.guest_count}</TableCell>
                      <TableCell className="capitalize">{reservation.reservation_type}</TableCell>
                      <TableCell>{reservation.time_slot}</TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            const date = new Date(reservation.created_at);
                            return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
                          } catch {
                            return 'Invalid Date';
                          }
                        })()}
                      </TableCell>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReservations.length)} of {filteredReservations.length} reservations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : 
                                       currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                       currentPage - 2 + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
  const [isRecurringChecked, setIsRecurringChecked] = useState(false);
  const [eventViewMode, setEventViewMode] = useState<'list' | 'card'>('list');

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
      setEventImageUrl('');
      setIsRecurringChecked(false);
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
      setEventImageUrl('');
      setIsRecurringChecked(false);
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
    const isRecurring = formData.get("is_recurring") === "on";
    const recurrenceEndDate = formData.get("recurrence_end_date") as string;
    const recurrencePattern = formData.get("recurrence_pattern") as string;
    
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
      tickets_url: formData.get("tickets_url") as string,
      image_url: eventImageUrl,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring && recurrencePattern ? recurrencePattern : null,
      recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
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
    // Set the image URL to the existing event's image URL or empty string
    setEventImageUrl(event?.image_url || '');
    // Set the recurring checkbox state
    setIsRecurringChecked(event?.is_recurring || false);
    
    // Scroll to the form at the top
    setTimeout(() => {
      const formElement = document.querySelector('[data-event-form]');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
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
        <Button onClick={() => { setIsEditing(true); setEditingEvent(null); setEventImageUrl(''); setIsRecurringChecked(false); }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {isEditing && (
        <Card data-event-form>
          <CardHeader>
            <CardTitle>{editingEvent ? "Edit Event" : "Add New Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingEvent?.id || 'new-event'}>
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
                  <Label htmlFor="tickets_url">Tickets URL</Label>
                  <Input id="tickets_url" name="tickets_url" type="url" placeholder="https://example.com/tickets" defaultValue={editingEvent?.tickets_url || ""} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="is_recurring" className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_recurring" 
                      name="is_recurring" 
                      checked={isRecurringChecked}
                      onChange={(e) => setIsRecurringChecked(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Make this a recurring event
                  </Label>
                </div>
                {isRecurringChecked && (
                  <>
                    <div>
                      <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
                      <Select name="recurrence_pattern" defaultValue={editingEvent?.recurrence_pattern || "weekly"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recurrence_end_date">Recurrence End Date (Optional)</Label>
                      <Input id="recurrence_end_date" name="recurrence_end_date" type="date" defaultValue={editingEvent?.recurrence_end_date || ""} />
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <Label htmlFor="image_url">Image</Label>
                  <ImageUpload 
                    value={eventImageUrl}
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
                <Button type="button" variant="outline" onClick={() => { 
                  setIsEditing(false); 
                  setEditingEvent(null); 
                  setEventImageUrl('');
                  setIsRecurringChecked(false);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Events</CardTitle>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={eventViewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEventViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={eventViewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setEventViewMode('card')}
                className="flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Cards
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {eventViewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
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
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const sibling = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs" style={{ display: event.image_url ? 'none' : 'flex' }}>
                          No Image
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{(() => {
                      try {
                        const date = new Date(event.date);
                        return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
                      } catch {
                        return 'Invalid Date';
                      }
                    })()}</TableCell>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events?.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {event.image_url ? (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const sibling = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (sibling) sibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ display: event.image_url ? 'none' : 'flex' }}>
                      No Image
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span className="font-bold text-lg">{event.price}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>{new Date(event.date).toLocaleDateString()} at {event.time}</div>
                        {event.host && <div>Host: {event.host}</div>}
                        {event.dj && <div>DJ: {event.dj}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(event)} className="flex-1 flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)} className="flex-1 flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterGalleryType, setFilterGalleryType] = useState<string>('all');

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
    
    // Scroll to the form at the top
    setTimeout(() => {
      const formElement = document.querySelector('[data-gallery-form]');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      deleteGalleryItemMutation.mutate(id);
    }
  };

  // Filter gallery items based on selected filters
  const filteredGalleryItems = galleryItems?.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesGalleryType = filterGalleryType === 'all' || item.gallery_type === filterGalleryType;
    return matchesCategory && matchesGalleryType;
  }) || [];

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterGalleryType('all');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBulkUpload(true)} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Image className="h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={() => { setIsEditing(true); setEditingItem(null); setGalleryImageUrl(''); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filterCategory" className="text-sm font-medium">Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="atmosphere">Atmosphere</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="interior">Interior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filterGalleryType" className="text-sm font-medium">Filter by Gallery Type</Label>
              <Select value={filterGalleryType} onValueChange={setFilterGalleryType}>
                <SelectTrigger>
                  <SelectValue placeholder="All gallery types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All gallery types</SelectItem>
                  <SelectItem value="main">Main Gallery</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="atmosphere">Atmosphere</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {filteredGalleryItems.length} of {galleryItems?.length || 0} items
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card data-gallery-form>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" key={editingItem?.id || 'new-gallery-item'}>
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
                        <SelectItem value="venue">Venue</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="atmosphere">Atmosphere</SelectItem>
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

      {showBulkUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Image Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <BulkImageUpload
              onComplete={() => {
                setShowBulkUpload(false);
                queryClient.invalidateQueries({ queryKey: ["gallery-items"] });
              }}
              onCancel={() => setShowBulkUpload(false)}
            />
          </CardContent>
        </Card>
      )}
      
      {filteredGalleryItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Image className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No images found</h3>
                <p className="text-muted-foreground">
                  {galleryItems?.length === 0 
                    ? "No gallery items have been added yet." 
                    : "No images match the current filters. Try adjusting your filters or clearing them."
                  }
                </p>
              </div>
              {(filterCategory !== 'all' || filterGalleryType !== 'all') && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleryItems.map((item) => (
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
      )}
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

// Modal Management Component
const ModalManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingModal, setEditingModal] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalViewMode, setModalViewMode] = useState<'list' | 'card'>('list');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    primary_button_text: "Plan Your Event",
    primary_button_action: "plan-event",
    secondary_button_text: "Reserve a Table",
    secondary_button_action: "reservation",
    is_active: true
  });

  const { data: homeModals, isLoading } = useQuery({
    queryKey: ["home-modals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("home_modals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events-for-modals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("id, title").order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: menuItems } = useQuery({
    queryKey: ["menu-items-for-modals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const createModal = useMutation({
    mutationFn: async (modalData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("home_modals").insert(modalData).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Modal created successfully" });
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error creating modal", description: error.message, variant: "destructive" });
    },
  });

  const updateModal = useMutation({
    mutationFn: async ({ id, ...modalData }: { id: string; [key: string]: any }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { data, error } = await supabase.from("home_modals").update(modalData).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Modal updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
      setEditingModal(null);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error updating modal", description: error.message, variant: "destructive" });
    },
  });

  const deleteModal = useMutation({
    mutationFn: async (id: string) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { error } = await supabase.from("home_modals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Modal deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["home-modals"] });
    },
    onError: (error) => {
      toast({ title: "Error deleting modal", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      primary_button_text: "Plan Your Event",
      primary_button_action: "plan-event",
      secondary_button_text: "Reserve a Table",
      secondary_button_action: "reservation",
      is_active: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModal) {
      updateModal.mutate({ id: editingModal.id, ...formData });
    } else {
      createModal.mutate(formData);
    }
  };

  const handleEdit = (modal: any) => {
    setEditingModal(modal);
    setFormData({
      title: modal.title,
      description: modal.description,
      image_url: modal.image_url || "",
      primary_button_text: modal.primary_button_text,
      primary_button_action: modal.primary_button_action,
      secondary_button_text: modal.secondary_button_text,
      secondary_button_action: modal.secondary_button_action,
      is_active: modal.is_active
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this modal?")) {
      deleteModal.mutate(id);
    }
  };

  const getActionOptions = () => {
    const staticOptions = [
      { value: "plan-event", label: "Plan Event" },
      { value: "reservation", label: "Make Reservation" },
      { value: "menu", label: "View Menu" },
      { value: "events", label: "View Events" }
    ];

    const eventOptions = events?.map(event => ({
      value: `event:${event.id}`,
      label: `Event: ${event.title}`
    })) || [];

    const menuOptions = menuItems?.map(item => ({
      value: `menu-item:${item.id}`,
      label: `Menu: ${item.name}`
    })) || [];

    return [...staticOptions, ...eventOptions, ...menuOptions];
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Home Page Modals</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={modalViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setModalViewMode('list')}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  List
                </Button>
                <Button
                  variant={modalViewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setModalViewMode('card')}
                  className="flex items-center gap-2"
                >
                  <Grid className="h-4 w-4" />
                  Cards
                </Button>
              </div>
              <Button onClick={() => { setIsAddModalOpen(true); setEditingModal(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Modal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isAddModalOpen && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_button_text">Primary Button Text</Label>
                  <Input
                    id="primary_button_text"
                    value={formData.primary_button_text}
                    onChange={(e) => setFormData({ ...formData, primary_button_text: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="primary_button_action">Primary Button Action</Label>
                  <Select
                    value={formData.primary_button_action}
                    onValueChange={(value) => setFormData({ ...formData, primary_button_action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getActionOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondary_button_text">Secondary Button Text</Label>
                  <Input
                    id="secondary_button_text"
                    value={formData.secondary_button_text}
                    onChange={(e) => setFormData({ ...formData, secondary_button_text: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_button_action">Secondary Button Action</Label>
                  <Select
                    value={formData.secondary_button_action}
                    onValueChange={(value) => setFormData({ ...formData, secondary_button_action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getActionOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingModal ? "Update Modal" : "Create Modal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingModal(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {modalViewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Primary Action</TableHead>
                  <TableHead>Secondary Action</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeModals?.map((modal) => (
                  <TableRow key={modal.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {modal.image_url ? (
                          <img 
                            src={modal.image_url} 
                            alt={modal.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const sibling = target.nextElementSibling as HTMLElement;
                              target.style.display = 'none';
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs" style={{ display: modal.image_url ? 'none' : 'flex' }}>
                          No Image
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{modal.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{modal.description}</TableCell>
                    <TableCell>
                      <Badge variant={modal.is_active ? "default" : "secondary"}>
                        {modal.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{modal.primary_button_action}</TableCell>
                    <TableCell>{modal.secondary_button_action}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(modal)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(modal.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {homeModals?.map((modal) => (
                <Card key={modal.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {modal.image_url ? (
                      <img 
                        src={modal.image_url} 
                        alt={modal.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const sibling = target.nextElementSibling as HTMLElement;
                          target.style.display = 'none';
                          if (sibling) sibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground" style={{ display: modal.image_url ? 'none' : 'flex' }}>
                      No Image
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{modal.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{modal.description}</p>
                    <div className="space-y-2 mb-3">
                      <Badge variant={modal.is_active ? "default" : "secondary"} className="w-full justify-center">
                        {modal.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Primary: {modal.primary_button_action}</div>
                        <div className="truncate">Secondary: {modal.secondary_button_action}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(modal)} className="flex-1 flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(modal.id)} className="flex-1 flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;