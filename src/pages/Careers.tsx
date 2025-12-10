import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Careers = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["active-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatEmploymentType = (type: string) => {
    const types: Record<string, string> = {
      "full-time": "Full-Time",
      "part-time": "Part-Time",
      "gig": "Gig",
      "contractor": "Contractor",
    };
    return types[type] || type;
  };

  const getEmploymentBadgeVariant = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      "full-time": "default",
      "part-time": "secondary",
      "gig": "outline",
      "contractor": "outline",
    };
    return variants[type] || "default";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 to-primary" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              Careers & Gigs at Royal Palace
            </h1>
            <p className="text-xl text-primary-foreground/80">
              We're always looking for exceptional people to join our team. Explore our open positions and become part of the Royal Palace family.
            </p>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Open Positions</h2>
            <p className="text-muted-foreground">Find your perfect role and apply today.</p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobs && jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="border-border hover:border-secondary/50 transition-colors group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-xl text-foreground group-hover:text-secondary transition-colors">
                        {job.title}
                      </CardTitle>
                      <Badge variant={getEmploymentBadgeVariant(job.employment_type)}>
                        {formatEmploymentType(job.employment_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {job.short_description}
                    </p>
                    {job.compensation && (
                      <p className="text-sm text-secondary mb-4 font-medium">
                        {job.compensation}
                      </p>
                    )}
                    <Link to={`/careers/${job.id}`}>
                      <Button className="w-full group/btn">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border max-w-lg mx-auto">
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Open Positions</h3>
                <p className="text-muted-foreground mb-4">
                  We don't have any open positions at the moment, but check back soon!
                </p>
                <p className="text-sm text-muted-foreground">
                  You can also reach out to us at{" "}
                  <a href="mailto:careers@royalpalacedtx.com" className="text-secondary hover:underline">
                    careers@royalpalacedtx.com
                  </a>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Join Royal Palace?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of a team that values excellence, creativity, and exceptional hospitality.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Growth Opportunities</h3>
              <p className="text-muted-foreground text-sm">
                Advance your career with training and development programs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Flexible Schedules</h3>
              <p className="text-muted-foreground text-sm">
                Work-life balance with flexible scheduling options.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Great Location</h3>
              <p className="text-muted-foreground text-sm">
                Work in the heart of Addison, TX's vibrant dining scene.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
