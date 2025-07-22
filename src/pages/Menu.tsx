
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url?: string;
  ingredients: string[];
  dietary: string[];
  category: string;
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("appetizers");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  useEffect(() => {
    console.log('Menu component mounted');
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      console.log('Fetching menu items from Supabase...');
      setError(null);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching menu items:', error);
        setError(`Database error: ${error.message}`);
      } else {
        console.log('Menu items fetched successfully:', data?.length || 0, 'items');
        setMenuItems(data || []);
      }
    } catch (error) {
      console.error('Network error fetching menu items:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const menuData = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  console.log('Menu render - loading:', loading, 'error:', error, 'categories:', Object.keys(menuData));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Menu
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience culinary excellence with our carefully crafted Mediterranean-American fusion cuisine
            </p>
          </div>

          {error && (
            <Alert className="mb-8 max-w-2xl mx-auto">
              <AlertDescription>
                {error}
                <button 
                  onClick={fetchMenuItems}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading menu...</p>
            </div>
          ) : Object.keys(menuData).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No menu items found</p>
              <button 
                onClick={fetchMenuItems}
                className="text-primary underline hover:no-underline"
              >
                Refresh
              </button>
            </div>
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <TabsList className="grid w-full sm:w-auto grid-cols-4">
                  <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
                  <TabsTrigger value="mains">Main Courses</TabsTrigger>
                  <TabsTrigger value="drinks">Signature Drinks</TabsTrigger>
                  <TabsTrigger value="desserts">Desserts</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className="flex items-center gap-2"
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-2"
                  >
                    <List className="h-4 w-4" />
                    List
                  </Button>
                </div>
              </div>

              {Object.entries(menuData).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                {viewMode === 'card' ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-muted">
                          <img 
                            src={item.image_url || '/api/placeholder/300/200'} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('Image failed to load for item:', item.name);
                              (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                            }}
                          />
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">{item.name}</CardTitle>
                            <span className="text-lg font-bold text-secondary">{item.price}</span>
                          </div>
                          <p className="text-muted-foreground">{item.description}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium mb-2">Ingredients:</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.ingredients.join(", ")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.dietary.map((diet) => (
                                <Badge key={diet} variant="secondary" className="text-xs">
                                  {diet}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-48 flex-shrink-0">
                              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                <img 
                                  src={item.image_url || '/api/placeholder/300/200'} 
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.log('Image failed to load for item:', item.name);
                                    (e.target as HTMLImageElement).src = '/api/placeholder/300/200';
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                                <span className="text-lg font-bold text-secondary">{item.price}</span>
                              </div>
                              <p className="text-muted-foreground mb-4">{item.description}</p>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium mb-2 text-sm">Ingredients:</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.ingredients.join(", ")}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.dietary.map((diet) => (
                                    <Badge key={diet} variant="secondary" className="text-xs">
                                      {diet}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Menu;
