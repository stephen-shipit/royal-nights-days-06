import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RoyalMicModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'rules' | 'guidelines' | 'contact';
}

export default function RoyalMicModal({ isOpen, onClose, type }: RoyalMicModalProps) {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', contactForm);
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'rules':
        return (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Rules & Regulations</h2>
            <div className="space-y-6 text-white/80">
              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">🎟️ Ticket Requirements</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Each performer must sell or bring a minimum of 10 tickets</li>
                  <li>• Tickets must be purchased in advance or at the door</li>
                  <li>• Failure to meet ticket minimum forfeits performance slot</li>
                  <li>• No exceptions - this ensures packed audience energy</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">⏱️ Performance Guidelines</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Performance time: 3-5 minutes maximum</li>
                  <li>• Strict time enforcement - music will be cut at 5 minutes</li>
                  <li>• Content must be appropriate for all audiences</li>
                  <li>• No offensive language, hate speech, or inappropriate content</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">🏆 Prize Structure</h3>
                <ul className="space-y-2 ml-4">
                  <li>• 1st Place: $600 cash prize</li>
                  <li>• 2nd Place: $300 cash prize</li>
                  <li>• 3rd Place: $100 cash prize</li>
                  <li>• Winners chosen by live audience voting</li>
                  <li>• Judges' scores may influence final rankings</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">📱 Voting Process</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Audience votes via QR code after all performances</li>
                  <li>• Each ticket holder gets one vote</li>
                  <li>• Voting closes 10 minutes after final performance</li>
                  <li>• Results announced immediately after voting closes</li>
                </ul>
              </section>
            </div>
          </>
        );

      case 'guidelines':
        return (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Performer Guidelines</h2>
            <div className="space-y-6 text-white/80">
              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">📅 Arrival & Check-in</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Arrive by 3:30 PM for sound check and briefing</li>
                  <li>• Check in at the performer registration table</li>
                  <li>• Bring valid ID and confirmation of registration</li>
                  <li>• Late arrivals may forfeit their slot</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">🎵 Technical Setup</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Bring backing tracks on USB drive (MP3 format)</li>
                  <li>• Live instruments welcome (acoustic preferred)</li>
                  <li>• Professional sound system and lighting provided</li>
                  <li>• 2-minute sound check per performer</li>
                  <li>• Technical issues are performer's responsibility</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">📸 Social Media Kit</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Use #RoyalMicThursdays in all posts</li>
                  <li>• Tag @RoyalPalaceDallas in Instagram posts</li>
                  <li>• Share performance clips to boost voting</li>
                  <li>• Professional photos available for winners</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-secondary mb-3">🎭 Performance Tips</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Engage with the audience for better scores</li>
                  <li>• Dress professionally - image matters</li>
                  <li>• Rehearse your 3-5 minute set thoroughly</li>
                  <li>• Bring your energy and personality to the stage</li>
                  <li>• Network with other performers and industry professionals</li>
                </ul>
              </section>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Contact & Support</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-bold text-secondary mb-2">📧 Email</h3>
                <p className="text-white/80">info@royalpalacedallas.com</p>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-bold text-secondary mb-2">📞 Phone</h3>
                <p className="text-white/80">(214) 555-ROYAL</p>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white font-semibold">Name *</Label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white font-semibold">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="subject" className="text-white font-semibold">Subject *</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-white font-semibold">Message *</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="mt-1 bg-white/10 border-white/20 text-white min-h-[100px]"
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-secondary text-black font-bold py-3 hover:bg-secondary/90 transition-colors"
              >
                Send Message
              </Button>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={cn(
          "bg-black border border-secondary/20 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden",
          "transform transition-all duration-300 ease-out"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary/20">
            <div /> {/* Spacer */}
            <button
              onClick={onClose}
              className="text-white hover:text-secondary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
}