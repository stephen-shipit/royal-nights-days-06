import { useState, useEffect, useRef } from "react";
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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users, Calendar, Image, Utensils, MapPin, Layers, Grid, List, Mail, Eye, Settings, FileText, Check } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { BulkImageUpload } from "@/components/BulkImageUpload";
import AdminHeader from "@/components/AdminHeader";
import AdminFooter from "@/components/AdminFooter";
import NotificationSettings from "@/components/NotificationSettings";
import UserManagement from "@/components/UserManagement";
import FormDataManagement from "@/components/FormDataManagement";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check admin permissions and temporary password status
  const checkUserAccess = async (userId: string) => {
    try {
      // Add timeout to RPC calls
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication check timeout')), 5000)
      );

      const [{ data: isAdmin, error: adminError }, { data: hasTemp, error: tempError }] = await Promise.race([
        Promise.all([
          supabase.rpc('is_admin', { user_id: userId }),
          supabase.rpc('has_temporary_password', { user_id: userId })
        ]),
        timeoutPromise
      ]) as [any, any];

      if (adminError || tempError) {
        console.error('RPC errors:', { adminError, tempError });
        throw new Error('Failed to check user permissions');
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast({
          title: "Access Denied",
          description: "You don't have admin permissions",
          variant: "destructive"
        });
        setIsAuthenticated(false);
        return;
      }

      // If user has temporary password, they need to change it first
      if (hasTemp) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error checking user access:', error);
      
      // On timeout or error, fall back to basic session check
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('Auth check timeout, allowing access with session only');
        setIsAuthenticated(true);
      } else {
        await supabase.auth.signOut();
        toast({
          title: "Authentication Error", 
          description: "Unable to verify permissions",
          variant: "destructive"
        });
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoading(true);
        
        if (event === 'SIGNED_OUT' || !session) {
          setIsAuthenticated(false);
          setIsLoading(false);
        } else if (session?.user) {
          await checkUserAccess(session.user.id);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await checkUserAccess(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminAuth 
        onAuthSuccess={(skipCheck) => {
          if (skipCheck) {
            // Password was just changed, skip authentication check
            setIsAuthenticated(true);
            setIsLoading(false);
          } else {
            // Normal login, let auth state change listener handle the access check
            setIsLoading(true);
          }
        }} 
      />
    );
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({ 
          title: "Logout Error", 
          description: error.message, 
          variant: "destructive" 
        });
        // Force logout state even if Supabase logout fails
        setIsAuthenticated(false);
      }
      // Don't manually set state here - auth listener will handle it
    } catch (error) {
      console.error('Logout error:', error);
      toast({ 
        title: "Logout Error", 
        description: "An unexpected error occurred during logout", 
        variant: "destructive" 
      });
      // Force logout state on unexpected errors
      setIsAuthenticated(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader onLogout={handleLogout} />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your restaurant's content and reservations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
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
              <TabsTrigger value="forms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Form Data
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
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

            <TabsContent value="forms">
              <FormDataManagement />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="settings">
              <NotificationSettings />
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [reservationType, setReservationType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeReservationTab, setActiveReservationTab] = useState('recent');

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_reservations")
        .select(`
          *,
          events:event_id (
            id,
            title,
            date,
            time
          ),
          venue_tables:table_id (
            id,
            table_number,
            max_guests,
            location
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ["admin-events-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, date")
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, status, previousStatus }: { id: string, status: string, previousStatus?: string }) => {
      const { data, error } = await supabase.from("table_reservations").update({ status }).eq("id", id).select();
      if (error) throw error;
      return { data, previousStatus, newStatus: status, reservationId: id };
    },
    onSuccess: async ({ data, previousStatus, newStatus, reservationId }) => {
      // If status changed from pending to confirmed, send confirmation email
      if (previousStatus !== 'confirmed' && newStatus === 'confirmed') {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
            body: { 
              reservationId: reservationId,
              sessionId: null,
              emailType: 'confirmed' // Indicate this is a confirmation email
            }
          });

          if (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        } catch (emailError) {
          console.error('Error invoking confirmation email function:', emailError);
        }
      }
      
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
    // Find the current reservation to get its previous status
    const currentReservation = filteredReservations?.find(r => r.id === id);
    const previousStatus = currentReservation?.status;
    
    updateReservationMutation.mutate({ id, status, previousStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reservation?")) {
      deleteReservationMutation.mutate(id);
    }
  };

  // Filter reservations based on search and filters
  const filteredReservations = reservations?.filter((reservation) => {
    const matchesSearch = !searchTerm || 
      reservation.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.guest_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    // For event filter, handle null event_id for dining reservations
    const matchesEvent = eventFilter === 'all' || 
      (reservation.reservation_type === 'dining' && eventFilter === 'dining') ||
      (reservation.reservation_type !== 'dining' && reservation.event_id === eventFilter);
      
    const matchesType = reservationType === 'all' || reservation.reservation_type === reservationType;
    
    // For date filter, use event date for nightlife, created date for dining
    const reservationDate = reservation.reservation_type === 'dining' 
      ? reservation.created_at?.split('T')[0] 
      : reservation.events?.date;
    const matchesDate = !dateFilter || reservationDate === dateFilter;
    
    return matchesSearch && matchesStatus && matchesEvent && matchesType && matchesDate;
  });

  // Separate reservations by type
  const diningReservations = filteredReservations?.filter(r => r.reservation_type === 'dining') || [];
  const nightlifeReservations = filteredReservations?.filter(r => r.reservation_type === 'nightlife') || [];

  if (isLoading) return <div>Loading...</div>;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter reservations for today
  const todaysReservations = reservations?.filter((reservation) => {
    if (!reservation.events?.date) return false;
    return reservation.events.date === today;
  }) || [];

  // Get reservations by category
  const getReservationsByCategory = (category: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return filteredReservations?.filter((reservation) => {
      // For nightlife reservations, use event date
      // For dining reservations, we need to determine the reservation date
      const reservationDate = reservation.reservation_type === 'nightlife' 
        ? reservation.events?.date 
        : reservation.created_at?.split('T')[0]; // For dining, we might need a different field
      
      const createdDate = reservation.created_at?.split('T')[0];
      
      // Skip if no valid date
      if (!reservationDate) return false;
      
      switch (category) {
        case 'recent':
          return createdDate >= sevenDaysAgo;
        case 'today':
          return reservationDate === todayStr;
        case 'upcoming':
          return reservationDate > todayStr;
        case 'past':
          return reservationDate < todayStr;
        default:
          return true;
      }
    }) || [];
  };

  const renderReservationsTable = (reservationsList: any[]) => (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest Name</TableHead>
            <TableHead>Event/Date</TableHead>
            <TableHead>Guests</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservationsList.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-medium">{reservation.guest_name}</TableCell>
              <TableCell>
                {reservation.reservation_type === 'nightlife' ? (
                  <div>
                    <div className="font-medium">{reservation.events?.title || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">
                      {reservation.events?.date ? formatDate(reservation.events.date) : 'N/A'}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">Regular Dining</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(reservation.created_at?.split('T')[0] || '')}
                    </div>
                  </div>
                )}
              </TableCell>
              <TableCell>{reservation.guest_count}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant={reservation.reservation_type === 'dining' ? 'default' : 'secondary'}>
                    {reservation.reservation_type === 'dining' ? '🍽️ Dining' : '🍸 Nightlife'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {reservation.reservation_type === 'dining' ? '3pm-9pm' : '9pm-5am'}
                  </div>
                </div>
              </TableCell>
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
               <TableCell>
                 {reservation.reservation_type === 'dining' ? (
                   'No Charge'
                 ) : (
                   `$${((reservation.total_price || 0) / 100).toFixed(2)}`
                 )}
               </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(reservation)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(reservation.guest_email);
                    toast({ title: "Email copied to clipboard" });
                  }}>
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(reservation.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {reservationsList.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reservations found</p>
        </div>
      )}
    </Card>
  );

  // Format date for display (MM/DD/YYYY)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reservations Management</h2>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date-filter">Date</Label>
            <Input
              id="date-filter"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="type-filter">Reservation Type</Label>
            <Select value={reservationType} onValueChange={setReservationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dining">Dining</SelectItem>
                <SelectItem value="nightlife">Nightlife</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="event-filter">Event</Label>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title} - {formatDate(event.date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setStatusFilter('all');
                setEventFilter('all');
                setReservationType('all');
                setIsDrawerOpen(false);
                setSelectedReservation(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Reservations Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Reservations</div>
          <div className="text-2xl font-bold">{filteredReservations?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Dining</div>
          <div className="text-2xl font-bold text-blue-600">{diningReservations.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Nightlife</div>
          <div className="text-2xl font-bold text-purple-600">{nightlifeReservations.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredReservations?.filter(r => r.status === 'confirmed').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {filteredReservations?.filter(r => r.status === 'pending').length || 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Revenue (Nightlife Only)</div>
          <div className="text-2xl font-bold text-primary">
            ${(filteredReservations?.filter(r => r.reservation_type === 'nightlife').reduce((sum, r) => sum + (r.total_price || 0), 0) / 100).toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Reservation Tabs */}
      <Tabs value={activeReservationTab} onValueChange={setActiveReservationTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recent ({getReservationsByCategory('recent').length})
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today ({getReservationsByCategory('today').length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming ({getReservationsByCategory('upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Past ({getReservationsByCategory('past').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recently Added Reservations</h3>
            <p className="text-sm text-muted-foreground">Added in the last 7 days</p>
          </div>
          {renderReservationsTable(getReservationsByCategory('recent'))}
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today's Reservations</h3>
            <div className="text-sm text-muted-foreground">
              {formatDate(today)} • {getReservationsByCategory('today').length} reservations
            </div>
          </div>
          {renderReservationsTable(getReservationsByCategory('today'))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming Reservations</h3>
            <p className="text-sm text-muted-foreground">Future reservations</p>
          </div>
          {renderReservationsTable(getReservationsByCategory('upcoming'))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Past Reservations</h3>
            <p className="text-sm text-muted-foreground">Completed reservations</p>
          </div>
          {renderReservationsTable(getReservationsByCategory('past'))}
        </TabsContent>
      </Tabs>

      {/* Reservation Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Reservation Details</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <div className="p-6 overflow-y-auto">
            {selectedReservation && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                        <p className="text-sm">{selectedReservation.guest_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{selectedReservation.guest_email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-sm">{selectedReservation.guest_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Number of Guests</Label>
                        <p className="text-sm">{selectedReservation.guest_count}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Reservation Details</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <p className="text-sm">
                          <Badge variant={selectedReservation.reservation_type === 'dining' ? 'default' : 'secondary'}>
                            {selectedReservation.reservation_type === 'dining' ? '🍽️ Dining' : '🍸 Nightlife'}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <p className="text-sm">
                          <Badge variant={
                            selectedReservation.status === 'confirmed' ? 'default' : 
                            selectedReservation.status === 'pending' ? 'secondary' : 
                            selectedReservation.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {selectedReservation.status}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Time Slot</Label>
                        <p className="text-sm">{selectedReservation.time_slot || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                        <p className="text-sm">
                          {formatDate(selectedReservation.created_at?.split('T')[0] || '')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReservation.reservation_type === 'nightlife' && selectedReservation.events && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Event Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Event Title</Label>
                        <p className="text-sm">{selectedReservation.events.title}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                        <p className="text-sm">{formatDate(selectedReservation.events.date)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                        <p className="text-sm">{selectedReservation.events.time}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReservation.venue_tables && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Table Information</h3>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Table Number</Label>
                        <p className="text-sm">Table {selectedReservation.venue_tables.table_number}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Max Capacity</Label>
                        <p className="text-sm">{selectedReservation.venue_tables.max_guests} guests</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                        <p className="text-sm">{selectedReservation.venue_tables.location || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                 {selectedReservation.reservation_type === 'nightlife' && (
                   <div>
                     <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                     <div className="space-y-3">
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                         <p className="text-sm">
                           <Badge variant={selectedReservation.payment_status === 'completed' ? 'default' : 'secondary'}>
                             {selectedReservation.payment_status || 'pending'}
                           </Badge>
                         </p>
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                         <p className="text-sm font-semibold">${selectedReservation.total_price || 0}</p>
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">Stripe Session</Label>
                         <p className="text-sm">{selectedReservation.stripe_session_id || 'N/A'}</p>
                       </div>
                       {selectedReservation.birthday_package && (
                         <div>
                           <Label className="text-sm font-medium text-muted-foreground">Birthday Package</Label>
                           <p className="text-sm">
                             <Badge variant="outline">🎂 Birthday Package Added</Badge>
                           </p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}

                {selectedReservation.special_requests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{selectedReservation.special_requests}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Special Requests Modal */}
      {filteredReservations?.some(r => r.special_requests) && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Special Requests</h3>
          <div className="space-y-2">
            {filteredReservations
              .filter(r => r.special_requests)
              .map((reservation) => (
                 <div key={reservation.id} className="p-3 bg-muted rounded-lg">
                   <div className="font-medium">
                     {reservation.guest_name} - {reservation.reservation_type === 'dining' ? 'Dinner Reservation' : reservation.events?.title}
                   </div>
                   <div className="text-sm text-muted-foreground mt-1">{reservation.special_requests}</div>
                 </div>
              ))}
          </div>
        </Card>
      )}
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

  const handleToggleSoldOut = async (eventId: string, currentSoldOut: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ sold_out: !currentSoldOut })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Event marked as ${!currentSoldOut ? 'sold out' : 'available'}`,
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event status",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      price: formData.get("price") as string,
      category: formData.get("category") as string,
      price_range: formData.get("price_range") as string,
      host: formData.get("host") as string,
      dj: formData.get("dj") as string,
      tickets_url: formData.get("tickets_url") as string,
      featured: formData.get("featured") === "on",
      sold_out: formData.get("sold_out") === "on",
      booking_percentage: parseInt(formData.get("booking_percentage") as string) || 0,
      block_table_reservations: formData.get("block_table_reservations") === "on",
      external_reservation_url: formData.get("external_reservation_url") as string,
      block_message: formData.get("block_message") as string,
      image_url: imageUrl,
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
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" defaultValue={editingEvent?.category || ""} required />
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
                <div>
                  <Label htmlFor="tickets_url">Tickets URL</Label>
                  <Input id="tickets_url" name="tickets_url" type="url" defaultValue={editingEvent?.tickets_url || ""} placeholder="https://example.com/tickets" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  defaultChecked={editingEvent?.featured || false}
                />
                <Label htmlFor="featured">Featured Event</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sold_out"
                  name="sold_out"
                  defaultChecked={editingEvent?.sold_out || false}
                />
                <Label htmlFor="sold_out">Mark as Sold Out</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="partial_booking"
                  name="partial_booking"
                  defaultChecked={(editingEvent?.booking_percentage || 0) > 0}
                  onChange={(e) => {
                    const percentageDiv = document.getElementById('booking_percentage_container');
                    if (percentageDiv) {
                      percentageDiv.style.display = e.target.checked ? 'block' : 'none';
                    }
                  }}
                />
                <Label htmlFor="partial_booking">Mark as Partially Booked</Label>
              </div>

              <div 
                id="booking_percentage_container"
                style={{ display: (editingEvent?.booking_percentage || 0) > 0 ? 'block' : 'none' }}
              >
                <Label htmlFor="booking_percentage">Booking Percentage</Label>
                <Select name="booking_percentage" defaultValue={String(editingEvent?.booking_percentage || 0)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select percentage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="40">40%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="60">60%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="80">80%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Set what percentage of tables appear unavailable (randomly selected)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="block_table_reservations"
                  name="block_table_reservations"
                  defaultChecked={editingEvent?.block_table_reservations || false}
                  onChange={(e) => {
                    const externalUrlDiv = document.getElementById('external_url_container');
                    const blockMessageDiv = document.getElementById('block_message_container');
                    if (externalUrlDiv && blockMessageDiv) {
                      externalUrlDiv.style.display = e.target.checked ? 'block' : 'none';
                      blockMessageDiv.style.display = e.target.checked ? 'block' : 'none';
                    }
                  }}
                />
                <Label htmlFor="block_table_reservations">Block Table Reservations</Label>
              </div>

              <div 
                id="external_url_container"
                style={{ display: editingEvent?.block_table_reservations ? 'block' : 'none' }}
              >
                <Label htmlFor="external_reservation_url">External Reservation URL</Label>
                <Input 
                  id="external_reservation_url" 
                  name="external_reservation_url" 
                  type="url" 
                  defaultValue={editingEvent?.external_reservation_url || ""} 
                  placeholder="https://example.com/book-table" 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL where users will be redirected for reservations
                </p>
              </div>

              <div 
                id="block_message_container"
                style={{ display: editingEvent?.block_table_reservations ? 'block' : 'none' }}
              >
                <Label htmlFor="block_message">Block Message</Label>
                <Textarea 
                  id="block_message" 
                  name="block_message" 
                  defaultValue={editingEvent?.block_message || "This is a special event, for table reservations please purchase here"}
                  placeholder="Custom message to show when table reservations are blocked"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Message displayed to users when table reservations are blocked
                </p>
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
                  <p><strong>Status:</strong> <span className={event.sold_out ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>{event.sold_out ? 'Sold Out' : 'Available'}</span></p>
                  {event.block_table_reservations && (
                    <p><strong>Table Reservations:</strong> <span className="text-orange-600 font-medium">Blocked</span></p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={event.sold_out ? "destructive" : "outline"}
                    onClick={() => handleToggleSoldOut(event.id, event.sold_out)}
                  >
                    {event.sold_out ? "Sold Out" : "Available"}
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

// Inline Price Edit Component
const InlinePriceEdit = ({ table, onUpdate }: { table: any, onUpdate: (id: string, price: number) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPrice, setTempPrice] = useState(table.reservation_price?.toString() || '0');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to cancel edit
  useEffect(() => {
    if (!isEditing) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempPrice(table.reservation_price?.toString() || '0');
  };

  const handleSave = async () => {
    const price = parseInt(tempPrice) || 0;
    if (price < 0) {
      setTempPrice(table.reservation_price?.toString() || '0');
      return;
    }
    
    setIsLoading(true);
    setIsEditing(false); // Optimistically close edit mode
    
    try {
      await onUpdate(table.id, price);
    } catch (error) {
      // On error, revert and allow re-editing
      setIsEditing(true);
      setTempPrice(table.reservation_price?.toString() || '0');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempPrice(table.reservation_price?.toString() || '0');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div ref={containerRef} className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          value={tempPrice}
          onChange={(e) => setTempPrice(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 h-8 text-sm"
          autoFocus
          disabled={isLoading}
        />
        <Button
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur from canceling
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 w-8 p-0 hover:bg-green-100"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600" />
          ) : (
            <Check className="h-3 w-3 text-green-600" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded transition-colors select-none"
      title="Double-click to edit price"
    >
      ${table.reservation_price || 0}
    </span>
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

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string, price: number }) => {
      const { data, error } = await supabase.from("venue_tables").update({ reservation_price: price }).eq("id", id).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Price updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["venue-tables"] });
    },
    onError: (error) => {
      toast({ title: "Error updating price", description: error.message, variant: "destructive" });
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

  const handlePriceUpdate = async (id: string, price: number) => {
    await updatePriceMutation.mutateAsync({ id, price });
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
                  <Select name="location" defaultValue={editingTable?.location || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Right Red Vip">Right Red Vip</SelectItem>
                      <SelectItem value="Left Green Vip">Left Green Vip</SelectItem>
                      <SelectItem value="Floor Seating">Floor Seating</SelectItem>
                    </SelectContent>
                  </Select>
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
                <TableCell>{(table as any).location || "Not specified"}</TableCell>
                <TableCell>
                  <InlinePriceEdit table={table} onUpdate={handlePriceUpdate} />
                </TableCell>
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
