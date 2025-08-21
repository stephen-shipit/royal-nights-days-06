import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SecondaryMenuBarProps {
  onMenuClick: (menuItem: string) => void;
  activeItem: string;
  isVisible: boolean;
}

const menuItems = [
  { id: 'kickoff', label: 'Kickoff Event' },
  { id: 'auditions', label: 'Audition Dates' },
  { id: 'events', label: 'Event Dates' },
  { id: 'rules', label: 'Rules & Regulations' },
  { id: 'guidelines', label: 'Performer Guidelines' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'contact', label: 'Contact & Support' }
];

export default function SecondaryMenuBar({ onMenuClick, activeItem, isVisible }: SecondaryMenuBarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroBottom = heroSection.offsetHeight;
        setIsSticky(window.scrollY >= heroBottom - 60);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "bg-black border-b border-secondary/20 transition-all duration-300 ease-in-out z-40",
        isSticky ? "fixed top-0 left-0 right-0 shadow-lg" : "relative"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center justify-center overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-1 md:space-x-4 px-4 py-0">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onMenuClick(item.id)}
                className={cn(
                  "relative px-3 md:px-6 py-4 text-sm md:text-base font-bold text-white hover:text-secondary transition-colors duration-300 whitespace-nowrap",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:transition-all after:duration-300",
                  activeItem === item.id 
                    ? "text-secondary after:bg-secondary after:shadow-[0_0_10px_rgba(255,215,0,0.6)]" 
                    : "after:bg-transparent hover:after:bg-secondary/50"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}