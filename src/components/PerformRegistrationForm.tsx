import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const PerformRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const totalSteps = 3;

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["name", "email", "phone"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["performanceType", "experience"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="text-white">Email Address *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-white">Phone Number *</Label>
              <Input
                id="phone"
                {...register("phone")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-300 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="performanceType" className="text-white">Performance Type *</Label>
              <Input
                id="performanceType"
                {...register("performanceType")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="e.g., Jazz Singer, Pianist, Poet"
              />
              {errors.performanceType && (
                <p className="text-red-300 text-sm mt-1">{errors.performanceType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="experience" className="text-white">Experience & Background *</Label>
              <Textarea
                id="experience"
                {...register("experience")}
                className="mt-2 min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="Tell us about your performance experience, training, and notable achievements..."
              />
              {errors.experience && (
                <p className="text-red-300 text-sm mt-1">{errors.experience.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="availability" className="text-white">Availability *</Label>
              <Textarea
                id="availability"
                {...register("availability")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="What days/times are you available?"
              />
              {errors.availability && (
                <p className="text-red-300 text-sm mt-1">{errors.availability.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="socialMedia" className="text-white">Social Media/Portfolio Links</Label>
              <Input
                id="socialMedia"
                {...register("socialMedia")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="Instagram, YouTube, website, etc."
              />
            </div>

            <div>
              <Label htmlFor="additionalInfo" className="text-white">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                {...register("additionalInfo")}
                className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                placeholder="Anything else you'd like us to know?"
              />
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <h4 className="text-white font-medium mb-2">Application Summary:</h4>
              <div className="text-white/80 text-sm space-y-1">
                <p><strong>Name:</strong> {getValues("name")}</p>
                <p><strong>Email:</strong> {getValues("email")}</p>
                <p><strong>Performance Type:</strong> {getValues("performanceType")}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-md border-white/20">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-white">
          Apply to Perform
        </CardTitle>
        <p className="text-white/80 text-sm">
          Step {currentStep} of {totalSteps}
        </p>
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mt-4">
          <div
            className="bg-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PerformRegistrationForm;