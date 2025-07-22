import Header from "@/components/Header";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import AtmosphereSection from "@/components/AtmosphereSection";
import HoursSection from "@/components/HoursSection";
import EventsSection from "@/components/EventsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <MobileHeader />
      <div className="pb-20 md:pb-0">
        <HeroSection />
        <AboutSection />
        <AtmosphereSection />
        <EventsSection />
        <HoursSection />
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Index;
