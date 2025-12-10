import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

const CareerThankYou = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-lg mx-auto border-border">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Application Received!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                Thank you for your interest in joining the Royal Palace team. A member of our staff will review your application and contact you shortly.
              </p>
              
              <p className="text-sm text-muted-foreground mb-8">
                You should receive a confirmation email at the address you provided. If you have any questions, please contact us at{" "}
                <a href="mailto:careers@royalpalacedtx.com" className="text-secondary hover:underline">
                  careers@royalpalacedtx.com
                </a>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/careers">
                  <Button variant="outline">
                    View More Positions
                  </Button>
                </Link>
                <Link to="/">
                  <Button>
                    Return Home
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareerThankYou;
