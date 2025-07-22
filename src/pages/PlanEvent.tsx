import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount: string;
  budget: string;
  duration: string;
  selectedDate: Date | undefined;
  catering: string;
  specialRequirements: string;
  eventDetails: string;
}

const PlanEvent = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    guestCount: "",
    budget: "",
    duration: "",
    selectedDate: new Date(),
    catering: "",
    specialRequirements: "",
    eventDetails: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PlanEvent component mounted');
  }, []);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.phone);
      case 2:
        return !!(formData.eventType && formData.guestCount && formData.selectedDate);
      case 3:
        return !!(formData.budget && formData.duration);
      case 4:
        return !!formData.eventDetails;
      default:
        return true;
    }
  };

  const canProceed = validateStep(currentStep);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, navigating to thank-you page...');
    console.log('Form data:', formData);
    
    toast({
      title: "Event Inquiry Submitted",
      description: "We'll contact you within 24 hours to discuss your event details.",
    });
    
    // Add a small delay to ensure toast is shown before navigation
    setTimeout(() => {
      console.log('Navigating to /thank-you');
      navigate("/thank-you");
    }, 500);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Information";
      case 2: return "Event Details";
      case 3: return "Requirements";
      case 4: return "Review & Submit";
      default: return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="event-type">Event Type *</Label>
              <Select value={formData.eventType} onValueChange={(value) => updateFormData("eventType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday Party</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="wedding">Wedding Reception</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="graduation">Graduation Party</SelectItem>
                  <SelectItem value="holiday">Holiday Party</SelectItem>
                  <SelectItem value="product-launch">Product Launch</SelectItem>
                  <SelectItem value="networking">Networking Event</SelectItem>
                  <SelectItem value="fundraiser">Fundraiser</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guest-count">Expected Guest Count *</Label>
              <Input
                id="guest-count"
                type="number"
                placeholder="Number of guests"
                min="1"
                value={formData.guestCount}
                onChange={(e) => updateFormData("guestCount", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Preferred Date *</Label>
              <Calendar
                mode="single"
                selected={formData.selectedDate}
                onSelect={(date) => updateFormData("selectedDate", date)}
                className="rounded-md border bg-white"
                disabled={(date) => date < new Date()}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="budget">Estimated Budget *</Label>
              <Select value={formData.budget} onValueChange={(value) => updateFormData("budget", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                  <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                  <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                  <SelectItem value="25000-50000">$25,000 - $50,000</SelectItem>
                  <SelectItem value="50000+">$50,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="duration">Event Duration *</Label>
              <Select value={formData.duration} onValueChange={(value) => updateFormData("duration", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-hours">2 Hours</SelectItem>
                  <SelectItem value="3-hours">3 Hours</SelectItem>
                  <SelectItem value="4-hours">4 Hours</SelectItem>
                  <SelectItem value="6-hours">6 Hours</SelectItem>
                  <SelectItem value="8-hours">8 Hours</SelectItem>
                  <SelectItem value="full-day">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="catering">Catering Requirements</Label>
              <Select value={formData.catering} onValueChange={(value) => updateFormData("catering", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select catering option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-service">Full Service Catering</SelectItem>
                  <SelectItem value="appetizers">Appetizers Only</SelectItem>
                  <SelectItem value="bar-service">Bar Service Only</SelectItem>
                  <SelectItem value="custom">Custom Menu</SelectItem>
                  <SelectItem value="external">External Catering</SelectItem>
                  <SelectItem value="none">No Catering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="special-requirements">Special Requirements</Label>
              <Textarea
                id="special-requirements"
                placeholder="Audio/visual equipment, decorations, special dietary needs, entertainment, etc."
                className="min-h-[100px] bg-white"
                value={formData.specialRequirements}
                onChange={(e) => updateFormData("specialRequirements", e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {formData.name}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                </div>
                
                <h3 className="font-semibold text-lg pt-4">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {formData.eventType}</p>
                  <p><strong>Guests:</strong> {formData.guestCount}</p>
                  <p><strong>Date:</strong> {formData.selectedDate?.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Requirements</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Budget:</strong> {formData.budget}</p>
                  <p><strong>Duration:</strong> {formData.duration}</p>
                  <p><strong>Catering:</strong> {formData.catering || "Not specified"}</p>
                </div>
                
                {formData.specialRequirements && (
                  <>
                    <h3 className="font-semibold text-lg pt-4">Special Requirements</h3>
                    <p className="text-sm">{formData.specialRequirements}</p>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="event-details">Event Details & Vision *</Label>
              <Textarea
                id="event-details"
                placeholder="Please describe your event vision, theme, atmosphere you're looking for, and any other important details..."
                className="min-h-[120px] bg-white"
                value={formData.eventDetails}
                onChange={(e) => updateFormData("eventDetails", e.target.value)}
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <MobileHeader />
      
      <div className="pt-20 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-royal-dark mb-4">
                Plan Your Event
              </h1>
              <p className="text-lg text-gray-600">
                Host an unforgettable private event at our venue
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Step indicators */}
              <div className="flex justify-between mt-4">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step < currentStep
                          ? "bg-green-500 text-white"
                          : step === currentStep
                          ? "bg-royal-dark text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step < currentStep ? <Check className="w-4 h-4" /> : step}
                    </div>
                    <span className="text-xs mt-1 text-gray-500">{getStepTitle(step)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-royal-dark">{getStepTitle(currentStep)}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
                  {renderStep()}
                  
                  <div className="flex gap-4 mt-8">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex-1"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    
                    {currentStep === 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/reservations")}
                        className="flex-1"
                      >
                        Back to Reservations
                      </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceed}
                        className="flex-1"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!canProceed}
                        className="flex-1"
                      >
                        Submit Event Inquiry
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default PlanEvent;
