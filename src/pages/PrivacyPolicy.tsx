import { LegalPageLayout } from '@/components/LegalPageLayout';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-collection', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'information-sharing', title: 'Information Sharing' },
    { id: 'data-security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies and Tracking' },
    { id: 'third-party', title: 'Third-Party Services' },
    { id: 'retention', title: 'Data Retention' },
    { id: 'updates', title: 'Policy Updates' },
    { id: 'contact', title: 'Contact Information' }
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How Royal Palace Restaurant & Lounge protects and handles your personal information"
      sections={sections}
    >
      <div className="space-y-8">
        
        <section id="introduction" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
          <p className="text-muted-foreground mb-4">
            Royal Palace Restaurant & Lounge ("we," "our," or "us") is committed to protecting your privacy and personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our restaurant, 
            use our website, or engage with our services.
          </p>
          <p className="text-muted-foreground">
            By using our services, you consent to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our services.
          </p>
        </section>

        <section id="information-collection" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
          <p className="text-muted-foreground mb-4">We may collect the following personal information:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Name, email address, and phone number for reservations</li>
            <li>Billing and payment information for dining and event services</li>
            <li>Dietary restrictions and preferences</li>
            <li>Special occasion information (birthdays, anniversaries, etc.)</li>
            <li>Event planning requirements and guest information</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mb-3">Automatically Collected Information</h3>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>IP address, browser type, and device information</li>
            <li>Website usage patterns and pages visited</li>
            <li>Location data (with your consent)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section id="how-we-use" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">We use your information to:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Process and manage your restaurant reservations</li>
            <li>Provide dining services and accommodate special requests</li>
            <li>Plan and execute private events and celebrations</li>
            <li>Process payments and prevent fraud</li>
            <li>Send reservation confirmations and updates</li>
            <li>Improve our services and customer experience</li>
            <li>Comply with legal obligations and health regulations</li>
            <li>Send promotional materials (with your consent)</li>
          </ul>
        </section>

        <section id="information-sharing" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li><strong>Service Providers:</strong> Third-party vendors who assist with reservations, payments, or website functionality</li>
            <li><strong>Legal Requirements:</strong> When required by law, regulation, or court order</li>
            <li><strong>Business Protection:</strong> To protect our rights, property, or safety, or that of our customers</li>
            <li><strong>Emergency Situations:</strong> To protect someone's health or safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section id="data-security" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Encryption of sensitive data during transmission</li>
            <li>Secure storage of personal information</li>
            <li>Regular security assessments and updates</li>
            <li>Limited access to personal information on a need-to-know basis</li>
            <li>Staff training on data protection procedures</li>
          </ul>
        </section>

        <section id="your-rights" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights</h2>
          <p className="text-muted-foreground mb-4">You have the right to:</p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
            <li><strong>Erasure:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to processing of your personal information</li>
            <li><strong>Restriction:</strong> Request limitation of processing</li>
            <li><strong>Withdrawal:</strong> Withdraw consent for data processing</li>
          </ul>
          <p className="text-muted-foreground">
            To exercise these rights, please contact us using the information provided in the Contact section.
          </p>
        </section>

        <section id="cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Cookies and Tracking</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar tracking technologies to enhance your browsing experience. For detailed information 
            about our cookie practices, please see our <Link to="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
          </p>
        </section>

        <section id="third-party" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Third-Party Services</h2>
          <p className="text-muted-foreground mb-4">
            Our website may contain links to third-party websites or integrate with third-party services. We are not responsible 
            for the privacy practices of these external services. We encourage you to review their privacy policies.
          </p>
        </section>

        <section id="retention" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Data Retention</h2>
          <p className="text-muted-foreground mb-4">
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, 
            comply with legal obligations, resolve disputes, and enforce our agreements. Reservation data is typically 
            retained for 3 years for business and tax purposes.
          </p>
        </section>

        <section id="updates" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Policy Updates</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date. Continued use of our services after 
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-card p-6 rounded-lg border">
            <h4 className="font-semibold text-foreground mb-3">Royal Palace Restaurant & Lounge</h4>
            <p className="text-muted-foreground mb-1">📍 4101 Belt Line Rd, Addison, TX 75001</p>
            <p className="text-muted-foreground mb-1">📞 <a href="tel:+12145565711" className="text-primary hover:underline">(214) 556-5711</a></p>
            <p className="text-muted-foreground">✉️ privacy@royalpalace.com</p>
          </div>
        </section>
      </div>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;