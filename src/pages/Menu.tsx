import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setMenuItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
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

          {loading ? (
            <div className="text-center py-12">Loading menu...</div>
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="appetizers">Appetizers</TabsTrigger>
                <TabsTrigger value="mains">Main Courses</TabsTrigger>
                <TabsTrigger value="drinks">Signature Drinks</TabsTrigger>
                <TabsTrigger value="desserts">Desserts</TabsTrigger>
              </TabsList>

              {Object.entries(menuData).map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted">
                        <img 
                          src={item.image_url || '/api/placeholder/300/200'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
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