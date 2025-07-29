import { LegalPageLayout } from '@/components/LegalPageLayout';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'description', title: 'Description of Services' },
    { id: 'reservations', title: 'Reservations and Bookings' },
    { id: 'payment', title: 'Payment and Pricing' },
    { id: 'cancellation', title: 'Cancellation and Refund Policy' },
    { id: 'conduct', title: 'Customer Conduct' },
    { id: 'liability', title: 'Limitation of Liability' },
    { id: 'property', title: 'Intellectual Property' },
    { id: 'privacy', title: 'Privacy and Data Protection' },
    { id: 'force-majeure', title: 'Force Majeure' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'modifications', title: 'Modifications to Terms' },
    { id: 'contact', title: 'Contact Information' }
  ];

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Legal terms and conditions for dining and services at Royal Palace Restaurant & Lounge"
      sections={sections}
    >
      <div className="space-y-8">
        
        <section id="acceptance" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            Welcome to Royal Palace Restaurant & Lounge. These Terms of Service ("Terms") govern your use of our restaurant 
            services, website, and facilities. By making a reservation, dining with us, or using our services, you agree to be 
            bound by these Terms.
          </p>
          <p className="text-muted-foreground">
            If you do not agree to these Terms, please do not use our services. We reserve the right to refuse service to anyone 
            for any reason at any time.
          </p>
        </section>

        <section id="description" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Services</h2>
          <p className="text-muted-foreground mb-4">
            Royal Palace Restaurant & Lounge provides fine dining and entertainment services, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Restaurant dining services (Wednesday - Sunday, 3:00 PM - 9:00 PM)</li>
            <li>Nightlife and lounge services (Wednesday - Sunday, 9:00 PM - 5:00 AM)</li>
            <li>Private event hosting and catering</li>
            <li>Special occasion celebrations</li>
            <li>Live entertainment and music performances</li>
            <li>Online reservation system and customer support</li>
          </ul>
        </section>

        <section id="reservations" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Reservations and Bookings</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Reservation Requirements</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Reservations must be made by individuals 18 years or older</li>
            <li>Valid contact information is required for all reservations</li>
            <li>Special dietary requirements should be communicated at time of booking</li>
            <li>Large party reservations (8+ guests) require advance notice</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3">Reservation Policies</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Reservations are held for 15 minutes past the scheduled time</li>
            <li>Late arrivals may result in reduced dining time or cancellation</li>
            <li>We reserve the right to modify seating arrangements based on availability</li>
            <li>Special requests cannot be guaranteed but will be accommodated when possible</li>
          </ul>
        </section>

        <section id="payment" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Payment and Pricing</h2>
          <p className="text-muted-foreground mb-4">
            All prices are subject to change without notice. Payment terms include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Payment is due at the time of service unless otherwise arranged</li>
            <li>We accept major credit cards, debit cards, and cash</li>
            <li>Private events may require deposits and signed contracts</li>
            <li>Gratuity is not included in listed prices unless specified</li>
            <li>All prices include applicable taxes unless otherwise noted</li>
            <li>Credit card chargebacks may result in service restrictions</li>
          </ul>
        </section>

        <section id="cancellation" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Cancellation and Refund Policy</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Regular Dining Reservations</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Cancellations must be made at least 2 hours in advance</li>
            <li>No-shows may be subject to cancellation fees for future reservations</li>
            <li>Same-day cancellations may be subject to restrictions</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3">Private Events</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Cancellations 30+ days in advance: Full refund minus processing fees</li>
            <li>Cancellations 14-29 days in advance: 50% refund</li>
            <li>Cancellations less than 14 days: No refund</li>
            <li>Force majeure events may be subject to different terms</li>
          </ul>
        </section>

        <section id="conduct" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Customer Conduct</h2>
          <p className="text-muted-foreground mb-4">
            To ensure a pleasant experience for all guests, we require that all customers:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Behave respectfully toward staff and other guests</li>
            <li>Follow our dress code and establishment policies</li>
            <li>Consume alcohol responsibly and in accordance with the law</li>
            <li>Refrain from disruptive behavior, harassment, or discrimination</li>
            <li>Comply with health and safety regulations</li>
            <li>Respect our property and equipment</li>
          </ul>
          <p className="text-muted-foreground">
            We reserve the right to refuse service or remove customers who violate these standards.
          </p>
        </section>

        <section id="liability" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            Royal Palace Restaurant & Lounge's liability is limited as follows:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>We are not liable for personal injury except where caused by our negligence</li>
            <li>We are not responsible for lost, stolen, or damaged personal property</li>
            <li>Our liability for any claim is limited to the amount paid for services</li>
            <li>We are not liable for indirect, consequential, or punitive damages</li>
            <li>Food allergies and dietary restrictions are the customer's responsibility to communicate</li>
          </ul>
        </section>

        <section id="property" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content, trademarks, logos, and intellectual property related to Royal Palace Restaurant & Lounge are owned by us 
            or our licensors. Customers may not:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Use our name, logo, or branding without written permission</li>
            <li>Reproduce, distribute, or create derivative works of our content</li>
            <li>Record or photograph on our premises without permission</li>
            <li>Use our recipes, procedures, or proprietary information</li>
          </ul>
        </section>

        <section id="privacy" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Privacy and Data Protection</h2>
          <p className="text-muted-foreground mb-4">
            Your privacy is important to us. Our collection and use of personal information is governed by our 
            <Link to="/privacy-policy" className="text-primary hover:underline"> Privacy Policy</Link>, which is incorporated 
            into these Terms by reference.
          </p>
        </section>

        <section id="force-majeure" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Force Majeure</h2>
          <p className="text-muted-foreground mb-4">
            We are not liable for failure to perform our obligations due to circumstances beyond our reasonable control, including:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Natural disasters, severe weather, or acts of God</li>
            <li>Government regulations, health emergencies, or pandemic restrictions</li>
            <li>Labor disputes, strikes, or supplier failures</li>
            <li>Equipment failures or utility outages</li>
            <li>Terrorism, war, or civil unrest</li>
          </ul>
        </section>

        <section id="governing-law" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
          <p className="text-muted-foreground mb-4">
            These Terms are governed by the laws of the State of Texas. Any disputes will be resolved in the courts of 
            Dallas County, Texas. If any provision of these Terms is found to be unenforceable, the remaining provisions 
            will continue in full force and effect.
          </p>
        </section>

        <section id="modifications" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">12. Modifications to Terms</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. 
            Continued use of our services after changes constitutes acceptance of the modified Terms. We encourage you to review 
            these Terms periodically.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-card p-6 rounded-lg border">
            <h4 className="font-semibold text-foreground mb-3">Royal Palace Restaurant & Lounge</h4>
            <p className="text-muted-foreground mb-1">📍 4101 Belt Line Rd, Addison, TX 75001</p>
            <p className="text-muted-foreground mb-1">📞 <a href="tel:+12145565711" className="text-primary hover:underline">(214) 556-5711</a></p>
            <p className="text-muted-foreground">✉️ legal@royalpalace.com</p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default TermsOfService;