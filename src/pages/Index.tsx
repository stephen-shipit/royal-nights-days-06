import Header from "@/components/Header";
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
      <HeroSection />
      <AboutSection />
      <AtmosphereSection />
      <EventsSection />
      <HoursSection />
      <Footer />
    </div>
  );
};

export default Index;
