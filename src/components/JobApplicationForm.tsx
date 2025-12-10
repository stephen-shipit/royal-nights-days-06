import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Upload, Check, Loader2 } from "lucide-react";

const applicationSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  city_state: z.string().min(2, "Please enter your city and state"),
  experience_summary: z.string().min(20, "Please provide more detail about your experience"),
  availability: z.string().min(5, "Please describe your availability"),
  late_night_ok: z.boolean(),
  start_date: z.string().min(1, "Please select a start date"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationFormProps {
  job: {
    id: string;
    title: string;
  };
  onSuccess: () => void;
}

const JobApplicationForm = ({ job, onSuccess }: JobApplicationFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      late_night_ok: false,
    },
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const validateStep = async (step: number) => {
    const fieldsToValidate: Record<number, (keyof ApplicationFormData)[]> = {
      1: ["full_name", "email", "phone", "city_state"],
      2: ["experience_summary"],
      3: ["availability", "start_date"],
    };

    if (step === 4) return true;
    return await trigger(fieldsToValidate[step]);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("admin-uploads")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("admin-uploads")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      let resumeUrl = null;
      let coverLetterUrl = null;

      if (resumeFile) {
        resumeUrl = await uploadFile(resumeFile, "resumes");
      }

      if (coverLetterFile) {
        coverLetterUrl = await uploadFile(coverLetterFile, "cover-letters");
      }

      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        city_state: data.city_state,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        experience_summary: data.experience_summary,
        availability: data.availability,
        late_night_ok: data.late_night_ok,
        start_date: data.start_date,
      });

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke("send-job-application-email", {
          body: {
            applicantName: data.full_name,
            applicantEmail: data.email,
            jobTitle: job.title,
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      toast({
        title: "Application Submitted!",
        description: "Thank you for applying. We'll be in touch soon.",
      });

      navigate("/careers/thank-you");
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = watch();

  const availabilityOptions = [
    "Weekdays (Mon-Fri)",
    "Weekends (Sat-Sun)",
    "Evenings (5PM-12AM)",
    "Late Nights (10PM-5AM)",
    "Flexible / Open Availability",
  ];

  return (
    <Card className="max-w-2xl mx-auto border-border">
      <CardHeader>
        <CardTitle className="text-2xl">Apply for {job.title}</CardTitle>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                  {errors.full_name && (
                    <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city_state">City & State *</Label>
                  <Input
                    id="city_state"
                    {...register("city_state")}
                    placeholder="Dallas, TX"
                    className="mt-1"
                  />
                  {errors.city_state && (
                    <p className="text-sm text-destructive mt-1">{errors.city_state.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Work Experience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Work Experience</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label>Resume (PDF, DOCX)</Label>
                  <div className="mt-1">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-secondary/50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {resumeFile ? resumeFile.name : "Click to upload resume"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Cover Letter (Optional)</Label>
                  <div className="mt-1">
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-secondary/50 transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          {coverLetterFile ? coverLetterFile.name : "Click to upload cover letter"}
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCoverLetterFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience_summary">Describe Your Relevant Experience *</Label>
                  <Textarea
                    id="experience_summary"
                    {...register("experience_summary")}
                    placeholder="Tell us about your past work experience relevant to this role..."
                    className="mt-1 min-h-[150px]"
                  />
                  {errors.experience_summary && (
                    <p className="text-sm text-destructive mt-1">{errors.experience_summary.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Availability & Logistics</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label>Your Availability *</Label>
                  <div className="mt-2 space-y-2">
                    {availabilityOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox
                          id={option}
                          checked={watchedValues.availability?.includes(option)}
                          onCheckedChange={(checked) => {
                            const current = watchedValues.availability || "";
                            const items = current.split(", ").filter(Boolean);
                            if (checked) {
                              items.push(option);
                            } else {
                              const index = items.indexOf(option);
                              if (index > -1) items.splice(index, 1);
                            }
                            setValue("availability", items.join(", "));
                          }}
                        />
                        <label htmlFor={option} className="text-sm cursor-pointer">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.availability && (
                    <p className="text-sm text-destructive mt-1">{errors.availability.message}</p>
                  )}
                </div>

                <div>
                  <Label>Are you willing to work late-night shifts? *</Label>
                  <RadioGroup
                    className="mt-2"
                    value={watchedValues.late_night_ok ? "yes" : "no"}
                    onValueChange={(value) => setValue("late_night_ok", value === "yes")}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="late-yes" />
                      <label htmlFor="late-yes" className="text-sm cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="late-no" />
                      <label htmlFor="late-no" className="text-sm cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="start_date">Earliest Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...register("start_date")}
                    className="mt-1"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Review Your Application</h3>
              
              <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-foreground">{watchedValues.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-foreground">{watchedValues.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-foreground">{watchedValues.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">City & State</p>
                  <p className="text-foreground">{watchedValues.city_state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resume</p>
                  <p className="text-foreground">{resumeFile?.name || "Not uploaded"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cover Letter</p>
                  <p className="text-foreground">{coverLetterFile?.name || "Not uploaded"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-foreground whitespace-pre-wrap">{watchedValues.experience_summary}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Availability</p>
                  <p className="text-foreground">{watchedValues.availability}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Late Night Shifts</p>
                  <p className="text-foreground">{watchedValues.late_night_ok ? "Yes" : "No"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Earliest Start Date</p>
                  <p className="text-foreground">{watchedValues.start_date}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                By submitting this application, you confirm that all information provided is accurate.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default JobApplicationForm;
