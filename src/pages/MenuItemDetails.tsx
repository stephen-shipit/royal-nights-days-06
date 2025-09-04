import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChefHat, Clock, Users } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];

const MenuItemDetails = () => {
  const { menuItemId } = useParams<{ menuItemId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!menuItemId) {
        setError("No menu item ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch the specific menu item
        const { data: itemData, error: itemError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("id", menuItemId)
          .single();

        if (itemError || !itemData) {
          setError("Menu item not found");
          setLoading(false);
          return;
        }

        setItem(itemData);

        // Fetch related items from the same category
        const { data: relatedData } = await supabase
          .from("menu_items")
          .select("*")
          .eq("category", itemData.category)
          .neq("id", menuItemId)
          .limit(3);

        if (relatedData) {
          setRelatedItems(relatedData);
        }
      } catch (err) {
        setError("Failed to load menu item");
        console.error("Error fetching menu item:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [menuItemId]);

  // Mobile-safe SEO optimization
  useEffect(() => {
    if (!item) return;

    try {
      // Update page title safely
      if (typeof document !== 'undefined' && document.title) {
        document.title = `${item.name} - Royal Palace Lounge Menu`;
      }

      // Update meta description safely
      if (typeof document !== 'undefined') {
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          const safeIngredients = Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '';
          metaDescription.setAttribute('content', 
            `${item.description} Available at Royal Palace Lounge. ${safeIngredients}. Price: ${item.price}`
          );
        }
      }

      // Add structured data with mobile-safe guards
      if (typeof document !== 'undefined' && !isMobile) {
        // Skip structured data on mobile to prevent crashes
        const existingScript = document.getElementById('menu-item-structured-data');
        if (!existingScript) {
          try {
            const structuredData = {
              "@context": "https://schema.org",
              "@type": "MenuItem",
              "name": item.name,
              "description": item.description,
              "offers": {
                "@type": "Offer",
                "price": item.price.replace(/[^0-9.]/g, ''),
                "priceCurrency": "USD"
              },
              "nutrition": {
                "@type": "NutritionInformation",
                "ingredients": Array.isArray(item.ingredients) ? item.ingredients : []
              },
              "menuAddOn": Array.isArray(item.dietary) ? item.dietary : [],
              "image": item.image_url,
              "servedBy": {
                "@type": "Restaurant",
                "name": "Royal Palace Lounge"
              }
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = 'menu-item-structured-data';
            script.text = JSON.stringify(structuredData);
            
            if (document.head) {
              document.head.appendChild(script);
            }
          } catch (structuredDataError) {
            console.warn('Failed to add structured data:', structuredDataError);
          }
        }
      }
    } catch (seoError) {
      console.warn('SEO optimization failed:', seoError);
    }

    // Cleanup function with mobile-safe guards
    return () => {
      try {
        if (typeof document !== 'undefined') {
          document.title = "Royal Palace Lounge";
          
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', 
              "Experience luxury dining and entertainment at Royal Palace Lounge. Premium events, exquisite cuisine, and unforgettable experiences."
            );
          }
          
          const script = document.getElementById('menu-item-structured-data');
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
    };
  }, [item, isMobile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MobileHeader />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Menu Item Not Found</h1>
            <p className="text-muted-foreground mb-8">{error || "The menu item you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate("/menu")} className="flex items-center gap-2 mx-auto">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-primary">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link to="/menu" className="hover:text-primary">Menu</Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{item.name}</li>
            </ol>
          </nav>

          {/* Back Button */}
          <Link to="/menu" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {item.image_url && !imageErrors[item.id] ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading={isMobile ? "lazy" : "eager"}
                  onError={() => {
                    setImageErrors(prev => ({ ...prev, [item.id]: true }));
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ChefHat className="h-24 w-24" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{item.name}</h1>
                <Badge variant="secondary" className="mb-4">{item.category}</Badge>
                <p className="text-xl font-semibold text-primary mb-4">{item.price}</p>
                <p className="text-lg text-muted-foreground">{item.description}</p>
              </div>

              <Separator />

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Ingredients
                  </h2>
                  <p className="text-muted-foreground">{item.ingredients.join(', ')}</p>
                </div>
              )}

              {/* Dietary Information */}
              {item.dietary && item.dietary.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Dietary Information</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.dietary.map((info, index) => (
                      <Badge key={index} variant="outline">{info}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedItems.map((relatedItem) => (
                  <Link 
                    key={relatedItem.id} 
                    to={`/menu/${relatedItem.id}`}
                    className="group"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-muted overflow-hidden">
                        {relatedItem.image_url && !imageErrors[relatedItem.id] ? (
                          <img 
                            src={relatedItem.image_url} 
                            alt={relatedItem.name}
                            className={`w-full h-full object-cover ${!isMobile ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}
                            loading="lazy"
                            onError={() => {
                              setImageErrors(prev => ({ ...prev, [relatedItem.id]: true }));
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ChefHat className="h-12 w-12" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{relatedItem.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{relatedItem.description}</p>
                        <p className="font-semibold text-primary mt-2">{relatedItem.price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default MenuItemDetails;