import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Music, Mic, Palette, Users, Calendar, Star } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  performanceType: z.string().min(1, "Please select a performance type"),
  experience: z.string().min(10, "Please describe your experience"),
  availability: z.string().min(1, "Please specify your availability"),
  socialMedia: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const Perform = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Here you would submit to your backend/Supabase
      console.log("Form submitted:", data);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll be in touch soon.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

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
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary opacity-90" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-20" />
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge variant="secondary" className="mb-6 bg-secondary/20 text-white border-secondary/30">
              Now Casting
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">
              Perform at Royal Palace
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Join our roster of talented artists and showcase your craft in Houston's most prestigious entertainment venue
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {performanceTypes.slice(0, 8).map((type, index) => (
                <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/20">
                  {type}
                </Badge>
              ))}
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                +10 more
              </Badge>
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

      {/* Registration Form Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-gradient-to-b from-card to-card/80">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                  Apply to Perform
                </CardTitle>
                <p className="text-muted-foreground mt-4">
                  Fill out the form below and we'll get back to you within 48 hours
                </p>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="mt-2"
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        className="mt-2"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        className="mt-2"
                        placeholder="(555) 123-4567"
                      />
                      {errors.phone && (
                        <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="performanceType">Performance Type *</Label>
                      <Input
                        id="performanceType"
                        {...register("performanceType")}
                        className="mt-2"
                        placeholder="e.g., Jazz Singer, Pianist, Poet"
                      />
                      {errors.performanceType && (
                        <p className="text-destructive text-sm mt-1">{errors.performanceType.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience & Background *</Label>
                    <Textarea
                      id="experience"
                      {...register("experience")}
                      className="mt-2 min-h-[100px]"
                      placeholder="Tell us about your performance experience, training, and notable achievements..."
                    />
                    {errors.experience && (
                      <p className="text-destructive text-sm mt-1">{errors.experience.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability *</Label>
                    <Textarea
                      id="availability"
                      {...register("availability")}
                      className="mt-2"
                      placeholder="What days/times are you available? Any scheduling constraints?"
                    />
                    {errors.availability && (
                      <p className="text-destructive text-sm mt-1">{errors.availability.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="socialMedia">Social Media/Portfolio Links</Label>
                    <Input
                      id="socialMedia"
                      {...register("socialMedia")}
                      className="mt-2"
                      placeholder="Instagram, YouTube, website, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea
                      id="additionalInfo"
                      {...register("additionalInfo")}
                      className="mt-2"
                      placeholder="Anything else you'd like us to know?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Perform;