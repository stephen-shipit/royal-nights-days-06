import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Phone, Mail } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ThankYou component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            
            {/* Success Icon */}
            <div className="mb-8">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
            </div>

            {/* Main Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-royal-dark mb-6">
              Thank You!
            </h1>
            
            <div className="text-lg text-gray-600 mb-8 space-y-4">
              <p>
                Your private event inquiry has been successfully submitted.
              </p>
              <p>
                Our event planning team will review your request and contact you within 
                <strong className="text-royal-dark"> 24 hours</strong> to discuss your event details 
                and create the perfect experience for your special occasion.
              </p>
            </div>

            {/* What's Next Card */}
            <Card className="bg-gray-50 mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-royal-dark mb-4">
                  What happens next?
                </h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-royal-dark mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Initial Consultation</p>
                      <p className="text-sm text-gray-600">
                        Our team will call you to discuss your vision and requirements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-royal-dark mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Custom Proposal</p>
                      <p className="text-sm text-gray-600">
                        We'll create a tailored proposal with menu options and pricing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-royal-dark mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Event Coordination</p>
                      <p className="text-sm text-gray-600">
                        Our dedicated coordinator will handle all the details
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="bg-royal-dark text-white rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Questions? Contact us directly</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>events@royalpalace.com</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/")}
                className="px-8 py-3"
              >
                Return to Homepage
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/gallery")}
                className="px-8 py-3"
              >
                View Our Gallery
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ThankYou;