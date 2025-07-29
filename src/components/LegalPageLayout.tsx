import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface Section {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  sections: Section[];
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  sections,
  children
}) => {
  const [activeSection, setActiveSection] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -70% 0px',
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileHeader />
      
      <div className="pt-20 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {title}
              </h1>
              <p className="text-xl text-primary-foreground/90">
                {subtitle}
              </p>
              <div className="mt-6 text-sm text-primary-foreground/70">
                <p>Royal Palace Restaurant & Lounge</p>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 bg-card rounded-lg p-6 elegant-shadow">
                <h3 className="text-lg font-semibold mb-4 text-foreground">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 hover:bg-primary/10 ${
                        activeSection === section.id
                          ? 'bg-primary/20 text-primary font-medium border-l-4 border-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
                
                {/* Back to Home */}
                <div className="mt-8 pt-6 border-t border-border">
                  <Link
                    to="/"
                    className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                    Back to Home
                  </Link>
                </div>
              </div>
            </aside>

            {/* Mobile Table of Contents */}
            <div className="lg:hidden mb-6">
              <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Menu className="h-4 w-4 mr-2" />
                    Table of Contents
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="py-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Table of Contents
                    </h3>
                    <nav className="space-y-2">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 hover:bg-primary/10 ${
                            activeSection === section.id
                              ? 'bg-primary/20 text-primary font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Content */}
            <main className="flex-1 max-w-none">
              <div className="prose prose-lg max-w-none">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};