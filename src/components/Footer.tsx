import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <img 
                  src="/lovable-uploads/b1de9097-e588-47f5-b0ac-d02227d99623.png" 
                  alt="Royal Palace Logo" 
                  className="w-16 h-16 object-contain" 
                />
              </div>
              <h3 className="text-2xl font-bold">ROYAL PALACE</h3>
              <p className="text-secondary">Restaurant & Lounge</p>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              A fusion of Mediterranean & American flavors in an atmosphere of refined elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Reservations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  4101 Belt Line Rd<br />
                  Addison, TX 75001
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                <a 
                  href="tel:+12145565711" 
                  className="text-primary-foreground/80 hover:text-secondary transition-colors"
                >
                  (214) 556-5711
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Hours</h4>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-secondary">Restaurant</span>
                </div>
                <p className="text-primary-foreground/80">Wed - Sun: 3:00 PM - 9:00 PM</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-secondary">Nightlife</span>
                </div>
                <p className="text-primary-foreground/80">Wed - Sun: 9:00 PM - 5:00 AM</p>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-secondary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              © 2024 Royal Palace Restaurant & Lounge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;