import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";

const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reservationType, setReservationType] = useState("dining");

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Reservation Submitted",
      description: "We'll contact you shortly to confirm your reservation.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Make a Reservation
              </h1>
              <p className="text-lg text-muted-foreground">
                Book your table for an unforgettable dining or nightlife experience
              </p>
            </div>

            <Tabs value={reservationType} onValueChange={setReservationType} className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dining">Restaurant (3PM - 9PM)</TabsTrigger>
                <TabsTrigger value="nightlife">Nightlife (9PM - 5AM)</TabsTrigger>
              </TabsList>

              <TabsContent value="dining">
                <Card>
                  <CardHeader>
                    <CardTitle>Restaurant Reservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReservation} className="space-y-6">
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
                            <Label htmlFor="guests">Number of Guests</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select guest count" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                    {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="time">Preferred Time</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="15:00">3:00 PM</SelectItem>
                                <SelectItem value="15:30">3:30 PM</SelectItem>
                                <SelectItem value="16:00">4:00 PM</SelectItem>
                                <SelectItem value="16:30">4:30 PM</SelectItem>
                                <SelectItem value="17:00">5:00 PM</SelectItem>
                                <SelectItem value="17:30">5:30 PM</SelectItem>
                                <SelectItem value="18:00">6:00 PM</SelectItem>
                                <SelectItem value="18:30">6:30 PM</SelectItem>
                                <SelectItem value="19:00">7:00 PM</SelectItem>
                                <SelectItem value="19:30">7:30 PM</SelectItem>
                                <SelectItem value="20:00">8:00 PM</SelectItem>
                                <SelectItem value="20:30">8:30 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Select Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" variant="luxury">
                        Reserve Table
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="nightlife">
                <Card>
                  <CardHeader>
                    <CardTitle>Nightlife Reservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleReservation} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="night-name">Full Name</Label>
                            <Input id="night-name" placeholder="Enter your name" required />
                          </div>
                          <div>
                            <Label htmlFor="night-email">Email</Label>
                            <Input id="night-email" type="email" placeholder="Enter your email" required />
                          </div>
                          <div>
                            <Label htmlFor="night-phone">Phone Number</Label>
                            <Input id="night-phone" type="tel" placeholder="Enter your phone" required />
                          </div>
                          <div>
                            <Label htmlFor="party-size">Party Size</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select party size" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 15 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1)}>
                                    {i + 1} {i === 0 ? 'Person' : 'People'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="table-type">Table Preference</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select table type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="regular">Regular Table</SelectItem>
                                <SelectItem value="vip">VIP Section</SelectItem>
                                <SelectItem value="booth">Premium Booth</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Select Date</Label>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" variant="royal">
                        Reserve Night Table
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;