
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: string;
  gallery_type: string;
};

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("venue");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Gallery component mounted');
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      console.log('Fetching gallery items from Supabase...');
      setError(null);
      
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('gallery_type', { ascending: true });
      
      if (error) {
        console.error('Supabase error fetching gallery items:', error);
        setError(`Database error: ${error.message}`);
      } else {
        console.log('Gallery items fetched successfully:', data?.length || 0, 'items');
        setGalleryItems(data || []);
      }
    } catch (error) {
      console.error('Network error fetching gallery items:', error);
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const galleryData = galleryItems.reduce((acc, item) => {
    if (!acc[item.gallery_type]) {
      acc[item.gallery_type] = [];
    }
    acc[item.gallery_type].push(item);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

  console.log('Gallery render - loading:', loading, 'error:', error, 'types:', Object.keys(galleryData));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      <div className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a visual journey through our elegant spaces, exquisite cuisine, and memorable events
            </p>
          </div>

          {error && (
            <Alert className="mb-8 max-w-2xl mx-auto">
              <AlertDescription>
                {error}
                <button 
                  onClick={fetchGalleryItems}
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
              <p>Loading gallery...</p>
            </div>
          ) : Object.keys(galleryData).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No gallery items found</p>
              <button 
                onClick={fetchGalleryItems}
                className="text-primary underline hover:no-underline"
              >
                Refresh
              </button>
            </div>
          ) : (
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="food">Food</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="atmosphere">Atmosphere</TabsTrigger>
              </TabsList>

              {Object.entries(galleryData).map(([category, images]) => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {images.map((image) => (
                    <Dialog key={image.id}>
                      <DialogTrigger asChild>
                        <Card className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all">
                          <div className="aspect-square relative">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.log('Image failed to load:', image.src);
                                (e.target as HTMLImageElement).src = '/api/placeholder/400/400';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                              <div className="absolute bottom-2 left-2 right-2">
                                <Badge variant="secondary" className="text-xs">
                                  {image.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <div className="aspect-video">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-xl font-semibold mb-2">{image.alt}</h3>
                          <Badge variant="outline">{image.category}</Badge>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Gallery;
