import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import PerformRegistrationForm from "@/components/PerformRegistrationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Mic, Palette, Users, Calendar, Star } from "lucide-react";

const Perform = () => {
  const performanceTypes = [
    "Musicians", "Singers", "Poets", "Comedians", "Acoustic Performers",
    "Jazz Bands", "R&B Vocalists", "Soul Artists", "Spoken Word Poets",
    "Instrumentalists", "Live Painters", "Storytellers", "Classical Duos",
    "Cultural Dancers", "Lounge DJs", "Saxophonists", "Violinists", "Open Mic Performers"
  ];

  const features = [
    {
      icon: Music,
      title: "Premium Venue",
      description: "Perform in our elegant Royal Palace setting with state-of-the-art sound and lighting"
    },
    {
      icon: Users,
      title: "Engaged Audience",
      description: "Connect with our sophisticated clientele who appreciate quality artistic performances"
    },
    {
      icon: Calendar,
      title: "Regular Opportunities",
      description: "Multiple performance slots available throughout the week for consistent bookings"
    },
    {
      icon: Star,
      title: "Professional Growth",
      description: "Build your reputation and network in an upscale entertainment environment"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      {/* Hero Section - Split Layout */}
      <section className="relative pt-20 md:pt-32 pb-16 overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-90" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-20" />
        
        <div className="relative container mx-auto px-4 h-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <div className="text-white">
              <Badge variant="secondary" className="mb-6 bg-secondary/20 text-white border-secondary/30">
                Now Casting
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">
                Perform at Royal Palace
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Join our roster of talented artists and showcase your craft in Houston's most prestigious entertainment venue
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {performanceTypes.slice(0, 8).map((type, index) => (
                  <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/20">
                    {type}
                  </Badge>
                ))}
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  +10 more
                </Badge>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Learn More About Us
              </Button>
            </div>

            {/* Right Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <PerformRegistrationForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Why Perform With Us?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience the prestige of performing at Royal Palace, where artistry meets luxury
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-0 bg-gradient-to-b from-card to-card/50 hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Types Section */}
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              We're Looking For
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Diverse talented artists across multiple genres and performance styles
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {performanceTypes.map((type, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-primary/5 transition-colors"
                >
                  <span className="text-sm md:text-base font-medium text-foreground">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Perform;