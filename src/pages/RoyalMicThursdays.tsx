import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import SecondaryMenuBar from "@/components/SecondaryMenuBar";
import KickoffEventDrawer from "@/components/KickoffEventDrawer";
import RightSideDrawer from "@/components/RightSideDrawer";
import RoyalMicModal from "@/components/RoyalMicModal";
import FAQAccordion from "@/components/FAQAccordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Trophy, Users, Clock, MapPin, Mic, DollarSign, Star } from "lucide-react";
import { toast } from "sonner";

const RoyalMicThursdays = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    stageName: "",
    performanceType: "",
    phone: "",
    email: "",
    sampleLink: "",
    agreedToTerms: false
  });

  // Secondary menu state
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const [kickoffDrawerOpen, setKickoffDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const [rightDrawerType, setRightDrawerType] = useState<'auditions' | 'events'>('auditions');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'rules' | 'guidelines' | 'contact'>('rules');
  const [faqOpen, setFaqOpen] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      toast.error("Please agree to bring or sell 10+ tickets to secure your performance slot.");
      return;
    }
    toast.success("Registration submitted! We'll contact you soon with performance details.");
    // Reset form
    setFormData({
      fullName: "",
      stageName: "",
      performanceType: "",
      phone: "",
      email: "",
      sampleLink: "",
      agreedToTerms: false
    });
  };

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Secondary menu handlers
  const handleMenuClick = (menuItem: string) => {
    setActiveMenuItem(menuItem);
    
    switch (menuItem) {
      case 'kickoff':
        setKickoffDrawerOpen(true);
        break;
      case 'auditions':
        setRightDrawerType('auditions');
        setRightDrawerOpen(true);
        break;
      case 'events':
        setRightDrawerType('events');
        setRightDrawerOpen(true);
        break;
      case 'rules':
        setModalType('rules');
        setModalOpen(true);
        break;
      case 'guidelines':
        setModalType('guidelines');
        setModalOpen(true);
        break;
      case 'contact':
        setModalType('contact');
        setModalOpen(true);
        break;
      case 'faqs':
        setFaqOpen(!faqOpen);
        break;
    }
  };

  const handleRegisterClick = () => {
    setKickoffDrawerOpen(false);
    setRightDrawerOpen(false);
    setModalOpen(false);
    scrollToForm();
  };

  // Show sticky button after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroBottom = heroSection.offsetHeight;
        setShowStickyButton(window.scrollY >= heroBottom - 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <MobileHeader />
      <div className="pb-20 md:pb-0">
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center text-center">
          <div className="hero-overlay absolute inset-0 z-0"></div>
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(/lovable-uploads/3ab9ebb4-7bb7-48fe-a33e-04fb7711e8ec.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-center mb-6">
              <Crown className="w-16 h-16 text-secondary animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white tracking-tight">
              THE STAGE IS <span className="luxury-text">YOURS</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-secondary">
              Royal Mic Thursdays 👑
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              Compete for <span className="text-secondary font-bold">$1,000 in cash prizes</span> every Thursday at Royal Palace. 
              Showcase your talent. Make your mark.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                variant="luxury" 
                size="xl"
                onClick={scrollToForm}
                className="transform hover:scale-105 transition-all duration-300"
              >
                <Mic className="mr-2" />
                Register to Perform
              </Button>
              <Button 
                variant="ghostGold" 
                size="xl"
                onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-secondary hover:bg-secondary/20"
              >
                Learn More
              </Button>
            </div>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-secondary rounded-full flex justify-center">
              <div className="w-1 h-3 bg-secondary rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Secondary Menu Bar */}
        <SecondaryMenuBar
          onMenuClick={handleMenuClick}
          activeItem={activeMenuItem}
          isVisible={true}
        />

        {/* FAQ Accordion */}
        <FAQAccordion isOpen={faqOpen} onClose={() => setFaqOpen(false)} />

        {/* Mobile Sticky Register Button */}
        {showStickyButton && (
          <div className="fixed bottom-24 left-4 right-4 z-50 md:hidden">
            <Button 
              onClick={scrollToForm}
              className="w-full bg-secondary text-black font-bold py-4 text-lg shadow-2xl hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105"
            >
              <Mic className="mr-2" />
              Register to Perform
            </Button>
          </div>
        )}

        {/* Why Perform Section */}
        <section className="py-24 bg-muted/30" id="details">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 luxury-text">
                Addison's Premier Live Talent Showcase
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join the city's most prestigious weekly competition where talent meets opportunity
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-secondary/20">
                <CardContent className="p-8">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <h3 className="text-2xl font-bold mb-3 text-secondary">$1,000 Weekly Prizes</h3>
                  <p className="text-muted-foreground">
                    Attract top-tier talent with substantial cash rewards every Thursday
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-secondary/20">
                <CardContent className="p-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <h3 className="text-2xl font-bold mb-3 text-secondary">Packed Audience Energy</h3>
                  <p className="text-muted-foreground">
                    Every performer brings 10+ guests, creating an electric atmosphere
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-secondary/20">
                <CardContent className="p-8">
                  <Star className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <h3 className="text-2xl font-bold mb-3 text-secondary">Instant Exposure</h3>
                  <p className="text-muted-foreground">
                    Winners featured across Royal Palace's social media platforms
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-secondary/20">
                <CardContent className="p-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <h3 className="text-2xl font-bold mb-3 text-secondary">Audience-Driven Voting</h3>
                  <p className="text-muted-foreground">
                    The crowd chooses who wears the crown with real-time QR voting
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Performance Categories */}
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold mb-12 mt-5">Performance Categories</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {['R&B Vocalists', 'Neo-Soul Singers', 'Jazz Artists', 'Comedians', 'Poets', 'Instrumentalists'].map((category) => (
                  <span 
                    key={category} 
                    className="bg-gradient-to-r from-secondary to-secondary/80 text-primary px-8 py-4 rounded-full font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-secondary/30"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
              <div className="relative rounded-2xl overflow-hidden elegant-shadow">
                <img 
                  src="/lovable-uploads/1e23e4ca-958c-4d13-80f8-9ed4516de8af.png" 
                  alt="Performer in spotlight"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold">Your Moment to Shine</h3>
                  <p className="text-white/90">Command the stage at Addison's premier venue</p>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden elegant-shadow">
                <img 
                  src="/lovable-uploads/32901699-a539-4588-93cf-e407f8f10857.png" 
                  alt="Enthusiastic crowd"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold">Electric Energy</h3>
                  <p className="text-white/90">Feel the crowd's energy fuel your performance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prize Highlight Section */}
        <section className="py-24 bg-primary">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Weekly Cash Prizes
            </h2>
            <p className="text-xl text-white/80 mb-16">
              Winners are crowned as Royal Mic Champion every week
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-b from-secondary/20 to-secondary/10 border-secondary hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🥇</div>
                  <h3 className="text-3xl font-bold mb-3 text-secondary">First Place</h3>
                  <div className="text-5xl font-bold text-secondary mb-2">$600</div>
                  <p className="text-muted-foreground">Cash Prize</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-b from-muted/20 to-muted/10 border-muted hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🥈</div>
                  <h3 className="text-3xl font-bold mb-3">Second Place</h3>
                  <div className="text-5xl font-bold mb-2">$300</div>
                  <p className="text-muted-foreground">Cash Prize</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-b from-accent/20 to-accent/10 border-accent hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">🥉</div>
                  <h3 className="text-3xl font-bold mb-3">Third Place</h3>
                  <div className="text-5xl font-bold mb-2">$100</div>
                  <p className="text-muted-foreground">Cash Prize</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 p-6 bg-secondary/20 rounded-2xl border border-secondary">
              <p className="text-2xl font-bold text-secondary">
                "Spots fill fast — secure yours now."
              </p>
            </div>
          </div>
        </section>

        {/* Event Details Section */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 luxury-text">
                Event Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card className="hover:shadow-xl transition-shadow duration-300 border-secondary/20">
                <CardContent className="p-8">
                  <Clock className="w-8 h-8 text-secondary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">When</h3>
                  <p className="text-lg text-muted-foreground">Every Thursday</p>
                  <p className="text-xl font-semibold">4:00 PM - 9:00 PM</p>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-xl transition-shadow duration-300 border-secondary/20">
                <CardContent className="p-8">
                  <MapPin className="w-8 h-8 text-secondary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Where</h3>
                  <p className="text-lg text-muted-foreground">Royal Palace</p>
                  <p className="text-xl font-semibold">Addison, TX</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Performer Requirements Section */}
        <section className="py-24 bg-primary">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                How to Secure Your Spot
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-background/10 border-secondary/30 hover:bg-background/20 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary rounded-full p-3 flex-shrink-0">
                      <span className="text-primary font-bold text-xl">🎟️</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Sell or bring 10 tickets minimum</h3>
                      <p className="text-white/80">Each performer must guarantee 10+ audience members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/10 border-secondary/30 hover:bg-background/20 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary rounded-full p-3 flex-shrink-0">
                      <span className="text-primary font-bold text-xl">📝</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Register online to secure your slot</h3>
                      <p className="text-white/80">Complete the registration form below</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/10 border-secondary/30 hover:bg-background/20 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary rounded-full p-3 flex-shrink-0">
                      <span className="text-primary font-bold text-xl">🎤</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Prepare a 3–5 minute act</h3>
                      <p className="text-white/80">Perfect your performance for maximum impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/10 border-secondary/30 hover:bg-background/20 transition-colors duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-secondary rounded-full p-3 flex-shrink-0">
                      <span className="text-primary font-bold text-xl">⏳</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Limited to 12–15 performers per week</h3>
                      <p className="text-white/80">First come, first served basis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="py-24 bg-muted/30" id="registration-form">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-16">
              <Crown className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h2 className="text-5xl md:text-6xl font-bold mb-6 luxury-text">
                Claim Your Spot
              </h2>
              <p className="text-xl text-muted-foreground">
                Ready to compete for the crown? Register now for Royal Mic Thursdays.
              </p>
            </div>
            
            <Card className="elegant-shadow border-secondary/20 hover:shadow-2xl transition-shadow duration-300">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-lg font-semibold">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="stageName" className="text-lg font-semibold">Stage Name</Label>
                      <Input
                        id="stageName"
                        value={formData.stageName}
                        onChange={(e) => setFormData({...formData, stageName: e.target.value})}
                        placeholder="Optional"
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="performanceType" className="text-lg font-semibold">Performance Type *</Label>
                    <Select value={formData.performanceType} onValueChange={(value) => setFormData({...formData, performanceType: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your performance type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="r&b-vocalist">R&B Vocalist</SelectItem>
                        <SelectItem value="neo-soul-singer">Neo-Soul Singer</SelectItem>
                        <SelectItem value="jazz-artist">Jazz Artist</SelectItem>
                        <SelectItem value="comedian">Comedian</SelectItem>
                        <SelectItem value="poet">Poet</SelectItem>
                        <SelectItem value="instrumentalist">Instrumentalist</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-lg font-semibold">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-lg font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sampleLink" className="text-lg font-semibold">Link to Sample Performance</Label>
                    <Input
                      id="sampleLink"
                      type="url"
                      value={formData.sampleLink}
                      onChange={(e) => setFormData({...formData, sampleLink: e.target.value})}
                      placeholder="YouTube, Instagram, SoundCloud, etc. (Optional)"
                      className="h-12"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-3 p-6 bg-secondary/10 rounded-lg border border-secondary/20">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => setFormData({...formData, agreedToTerms: !!checked})}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to bring or sell <strong>10+ tickets</strong> to secure my performance slot at Royal Mic Thursdays. 
                      I understand that failure to meet this requirement may result in forfeiture of my performance spot.
                    </Label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="luxury" 
                    size="xl" 
                    className="w-full transform hover:scale-105 transition-all duration-300"
                    disabled={!formData.agreedToTerms}
                  >
                    <Crown className="mr-2" />
                    Claim Your Spot
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-24 bg-primary text-center">
          <div className="max-w-4xl mx-auto px-6">
            <Crown className="w-20 h-20 text-secondary mx-auto mb-8 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-bold mb-8 text-white">
              This Is Your Moment
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-12 text-secondary">
              Don't Miss It.
            </h3>
            <Button 
              variant="luxury" 
              size="xl"
              onClick={scrollToForm}
              className="transform hover:scale-105 transition-all duration-300 text-xl px-12 py-6"
            >
              <Mic className="mr-3 w-6 h-6" />
              Register Now
            </Button>
          </div>
        </section>
        
        <Footer />
      </div>
      <MobileBottomNav />

      {/* Modals and Drawers */}
      <KickoffEventDrawer
        isOpen={kickoffDrawerOpen}
        onClose={() => setKickoffDrawerOpen(false)}
        onRegister={handleRegisterClick}
      />
      
      <RightSideDrawer
        isOpen={rightDrawerOpen}
        onClose={() => setRightDrawerOpen(false)}
        type={rightDrawerType}
        onBookAudition={handleRegisterClick}
      />
      
      <RoyalMicModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
      />
    </div>
  );
};

export default RoyalMicThursdays;