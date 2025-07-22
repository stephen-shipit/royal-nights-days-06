import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const PlanEvent = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    console.log('PlanEvent component mounted');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Event Inquiry Submitted",
      description: "We'll contact you within 24 hours to discuss your event details.",
    });
    // Navigate back to reservations or home after submission
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Plan Your Event
              </h1>
              <p className="text-lg text-muted-foreground">
                Host an unforgettable private event at our venue
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Private Event Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Enter your name" required />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Enter your phone" required />
                      </div>
                      <div>
                        <Label htmlFor="event-type">Event Type</Label>
                        <Select>
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
                        <Label htmlFor="guest-count">Expected Guest Count</Label>
                        <Input id="guest-count" type="number" placeholder="Number of guests" min="1" required />
                      </div>
                      <div>
                        <Label htmlFor="budget">Estimated Budget</Label>
                        <Select>
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
                        <Label htmlFor="duration">Event Duration</Label>
                        <Select>
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
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Preferred Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      <div>
                        <Label htmlFor="catering">Catering Requirements</Label>
                        <Select>
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
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-details">Event Details & Vision</Label>
                    <Textarea
                      id="event-details"
                      placeholder="Please describe your event vision, theme, atmosphere you're looking for, and any other important details..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate("/reservations")}
                      className="flex-1"
                    >
                      Back to Reservations
                    </Button>
                    <Button type="submit" className="flex-1">
                      Submit Event Inquiry
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PlanEvent;