import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const galleryData = {
  venue: [
    {
      id: 1,
      src: "/api/placeholder/400/300",
      alt: "Main dining room",
      category: "Interior"
    },
    {
      id: 2,
      src: "/api/placeholder/400/300",
      alt: "VIP lounge area",
      category: "VIP"
    },
    {
      id: 3,
      src: "/api/placeholder/400/300",
      alt: "Bar area",
      category: "Bar"
    },
    {
      id: 4,
      src: "/api/placeholder/400/300",
      alt: "Outdoor terrace",
      category: "Exterior"
    }
  ],
  food: [
    {
      id: 5,
      src: "/api/placeholder/400/300",
      alt: "Grilled octopus appetizer",
      category: "Appetizers"
    },
    {
      id: 6,
      src: "/api/placeholder/400/300",
      alt: "Ribeye steak dinner",
      category: "Mains"
    },
    {
      id: 7,
      src: "/api/placeholder/400/300",
      alt: "Chocolate soufflé dessert",
      category: "Desserts"
    },
    {
      id: 8,
      src: "/api/placeholder/400/300",
      alt: "Signature cocktails",
      category: "Drinks"
    }
  ],
  events: [
    {
      id: 9,
      src: "/api/placeholder/400/300",
      alt: "Live DJ performance",
      category: "Entertainment"
    },
    {
      id: 10,
      src: "/api/placeholder/400/300",
      alt: "Private party celebration",
      category: "Private Events"
    },
    {
      id: 11,
      src: "/api/placeholder/400/300",
      alt: "Corporate event setup",
      category: "Corporate"
    },
    {
      id: 12,
      src: "/api/placeholder/400/300",
      alt: "Wedding reception",
      category: "Weddings"
    }
  ],
  atmosphere: [
    {
      id: 13,
      src: "/api/placeholder/400/300",
      alt: "Evening ambiance",
      category: "Nightlife"
    },
    {
      id: 14,
      src: "/api/placeholder/400/300",
      alt: "Elegant lighting",
      category: "Ambiance"
    },
    {
      id: 15,
      src: "/api/placeholder/400/300",
      alt: "Guests enjoying dinner",
      category: "Dining"
    },
    {
      id: 16,
      src: "/api/placeholder/400/300",
      alt: "Rooftop view",
      category: "Views"
    }
  ]
};

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("venue");
  const [selectedImage, setSelectedImage] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Gallery
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take a visual journey through our elegant spaces, exquisite cuisine, and memorable events
            </p>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default Gallery;