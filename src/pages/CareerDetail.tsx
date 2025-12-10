import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Briefcase, DollarSign } from "lucide-react";
import JobApplicationForm from "@/components/JobApplicationForm";

const CareerDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [showApplication, setShowApplication] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .eq("status", "active")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This position may no longer be available or doesn't exist.
          </p>
          <Link to="/careers">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (showApplication) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => setShowApplication(false)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Details
          </Button>
          <JobApplicationForm job={job} onSuccess={() => setShowApplication(false)} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <Link to="/careers">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Careers
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary">
                  {formatEmploymentType(job.employment_type)}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{job.title}</h1>
              <p className="text-xl text-muted-foreground">{job.short_description}</p>
            </div>

            <Card className="border-border">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">About the Role</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.full_description}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Requirements</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Position Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Employment Type</p>
                        <p className="text-sm text-muted-foreground">
                          {formatEmploymentType(job.employment_type)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Location</p>
                        <p className="text-sm text-muted-foreground">{job.location}</p>
                      </div>
                    </div>
                    {job.compensation && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="h-5 w-5 text-secondary mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Compensation</p>
                          <p className="text-sm text-muted-foreground">{job.compensation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => setShowApplication(true)}
                  >
                    Apply Now
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Application takes about 5-10 minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerDetail;
