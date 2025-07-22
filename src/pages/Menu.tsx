import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const menuData = {
  appetizers: [
    {
      id: "grilled-octopus",
      name: "Mediterranean Grilled Octopus",
      description: "Tender octopus with olive oil, lemon, and herbs",
      price: "$28",
      image: "/api/placeholder/300/200",
      ingredients: ["Octopus", "Olive Oil", "Lemon", "Herbs"],
      dietary: ["Gluten-Free"]
    },
    {
      id: "truffle-arancini",
      name: "Truffle Arancini",
      description: "Crispy risotto balls with black truffle and parmesan",
      price: "$18",
      image: "/api/placeholder/300/200",
      ingredients: ["Arborio Rice", "Black Truffle", "Parmesan", "Herbs"],
      dietary: ["Vegetarian"]
    },
    {
      id: "tuna-tartare",
      name: "Yellowfin Tuna Tartare",
      description: "Fresh tuna with avocado, cucumber, and citrus",
      price: "$24",
      image: "/api/placeholder/300/200",
      ingredients: ["Yellowfin Tuna", "Avocado", "Cucumber", "Citrus"],
      dietary: ["Gluten-Free", "Dairy-Free"]
    }
  ],
  mains: [
    {
      id: "ribeye-steak",
      name: "Dry-Aged Ribeye",
      description: "28-day aged ribeye with seasonal vegetables",
      price: "$65",
      image: "/api/placeholder/300/200",
      ingredients: ["Ribeye Steak", "Seasonal Vegetables", "Herbs"],
      dietary: ["Gluten-Free"]
    },
    {
      id: "sea-bass",
      name: "Mediterranean Sea Bass",
      description: "Pan-seared with tomatoes, olives, and capers",
      price: "$42",
      image: "/api/placeholder/300/200",
      ingredients: ["Sea Bass", "Tomatoes", "Olives", "Capers"],
      dietary: ["Gluten-Free", "Dairy-Free"]
    },
    {
      id: "lamb-rack",
      name: "Herb-Crusted Lamb Rack",
      description: "French rack with rosemary and garlic",
      price: "$58",
      image: "/api/placeholder/300/200",
      ingredients: ["Lamb Rack", "Rosemary", "Garlic", "Herbs"],
      dietary: ["Gluten-Free"]
    }
  ],
  drinks: [
    {
      id: "royal-martini",
      name: "Royal Palace Martini",
      description: "Premium vodka with gold flakes",
      price: "$22",
      image: "/api/placeholder/300/200",
      ingredients: ["Premium Vodka", "Dry Vermouth", "Gold Flakes"],
      dietary: ["Gluten-Free"]
    },
    {
      id: "champagne-cocktail",
      name: "Golden Champagne Cocktail",
      description: "Dom Pérignon with elderflower and gold",
      price: "$35",
      image: "/api/placeholder/300/200",
      ingredients: ["Dom Pérignon", "Elderflower", "Gold Leaf"],
      dietary: ["Gluten-Free"]
    }
  ],
  desserts: [
    {
      id: "chocolate-soufflé",
      name: "Dark Chocolate Soufflé",
      description: "Rich chocolate with vanilla ice cream",
      price: "$16",
      image: "/api/placeholder/300/200",
      ingredients: ["Dark Chocolate", "Vanilla Ice Cream", "Berries"],
      dietary: ["Vegetarian"]
    }
  ]
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("appetizers");

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
                          src={item.image} 
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
        </div>
      </div>
    </div>
  );
};

export default Menu;