import { LegalPageLayout } from '@/components/LegalPageLayout';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'what-are-cookies', title: 'What Are Cookies' },
    { id: 'types-of-cookies', title: 'Types of Cookies We Use' },
    { id: 'essential-cookies', title: 'Essential Cookies' },
    { id: 'analytics-cookies', title: 'Analytics Cookies' },
    { id: 'functional-cookies', title: 'Functional Cookies' },
    { id: 'marketing-cookies', title: 'Marketing Cookies' },
    { id: 'third-party-cookies', title: 'Third-Party Cookies' },
    { id: 'managing-cookies', title: 'Managing Your Cookie Preferences' },
    { id: 'browser-settings', title: 'Browser Settings' },
    { id: 'updates', title: 'Policy Updates' },
    { id: 'contact', title: 'Contact Information' }
  ];

  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="How Royal Palace Restaurant & Lounge uses cookies and similar technologies on our website"
      sections={sections}
    >
      <div className="space-y-8">
        
        <section id="introduction" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
          <p className="text-muted-foreground mb-4">
            This Cookie Policy explains how Royal Palace Restaurant & Lounge ("we," "our," or "us") uses cookies and similar 
            technologies when you visit our website. This policy should be read alongside our 
            <Link to="/privacy-policy" className="text-primary hover:underline"> Privacy Policy</Link>.
          </p>
          <p className="text-muted-foreground">
            By continuing to use our website, you consent to our use of cookies as described in this policy.
          </p>
        </section>

        <section id="what-are-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. What Are Cookies</h2>
          <p className="text-muted-foreground mb-4">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. 
            They help websites recognize your device and remember information about your visit, such as your preferences and actions.
          </p>
          <p className="text-muted-foreground">
            Cookies can be "session cookies" (deleted when you close your browser) or "persistent cookies" (remain on your device 
            for a set period or until you delete them).
          </p>
        </section>

        <section id="types-of-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Types of Cookies We Use</h2>
          <p className="text-muted-foreground mb-4">
            We use different types of cookies for various purposes:
          </p>
          <div className="bg-card p-6 rounded-lg border mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">🔒 Essential Cookies</h4>
                <p className="text-sm text-muted-foreground">Required for basic website functionality</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">📊 Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground">Help us understand website usage</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">⚙️ Functional Cookies</h4>
                <p className="text-sm text-muted-foreground">Remember your preferences</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">📢 Marketing Cookies</h4>
                <p className="text-sm text-muted-foreground">Deliver relevant advertisements</p>
              </div>
            </div>
          </div>
        </section>

        <section id="essential-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Essential Cookies</h2>
          <p className="text-muted-foreground mb-4">
            These cookies are necessary for our website to function properly and cannot be disabled. They include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Authentication cookies to keep you logged in</li>
            <li>Security cookies to protect against fraud</li>
            <li>Session cookies to maintain your reservation process</li>
            <li>Load balancing cookies to ensure website performance</li>
            <li>Cookie consent preferences</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Legal basis:</strong> Legitimate interest in providing our website services.
          </p>
        </section>

        <section id="analytics-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Analytics Cookies</h2>
          <p className="text-muted-foreground mb-4">
            We use analytics cookies to understand how visitors use our website. This helps us improve our services. 
            These cookies collect information such as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Number of visitors and page views</li>
            <li>How long visitors spend on our site</li>
            <li>Which pages are most popular</li>
            <li>Where visitors come from (referral sources)</li>
            <li>Device and browser information</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            <strong>Third-party services:</strong> Google Analytics, Adobe Analytics
          </p>
          <p className="text-muted-foreground">
            <strong>Legal basis:</strong> Your consent or legitimate interest in improving our services.
          </p>
        </section>

        <section id="functional-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Functional Cookies</h2>
          <p className="text-muted-foreground mb-4">
            These cookies enable enhanced functionality and personalization, such as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Remembering your language preference</li>
            <li>Storing your dietary restrictions for future visits</li>
            <li>Maintaining your reservation preferences</li>
            <li>Customizing content based on your location</li>
            <li>Remembering items in your event planning wishlist</li>
          </ul>
          <p className="text-muted-foreground">
            <strong>Legal basis:</strong> Your consent or legitimate interest in providing personalized services.
          </p>
        </section>

        <section id="marketing-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Marketing Cookies</h2>
          <p className="text-muted-foreground mb-4">
            With your consent, we use marketing cookies to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Show you relevant advertisements on other websites</li>
            <li>Measure the effectiveness of our advertising campaigns</li>
            <li>Personalize marketing content based on your interests</li>
            <li>Prevent you from seeing the same ads repeatedly</li>
            <li>Track conversions from our marketing efforts</li>
          </ul>
          <p className="text-muted-foreground mb-4">
            <strong>Third-party services:</strong> Facebook Pixel, Google Ads, Instagram Advertising
          </p>
          <p className="text-muted-foreground">
            <strong>Legal basis:</strong> Your explicit consent.
          </p>
        </section>

        <section id="third-party-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Third-Party Cookies</h2>
          <p className="text-muted-foreground mb-4">
            Some cookies are set by third-party services that appear on our website:
          </p>
          
          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Google Services</h4>
              <p className="text-muted-foreground text-sm mb-2">Analytics, Maps, reCAPTCHA</p>
              <a href="https://policies.google.com/privacy" className="text-primary text-sm hover:underline" target="_blank" rel="noopener noreferrer">
                View Google's Privacy Policy
              </a>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Social Media Platforms</h4>
              <p className="text-muted-foreground text-sm mb-2">Facebook, Instagram, Twitter widgets</p>
              <p className="text-muted-foreground text-sm">Please check their respective privacy policies</p>
            </div>

            <div className="bg-card p-4 rounded-lg border">
              <h4 className="font-semibold text-foreground mb-2">Payment Processors</h4>
              <p className="text-muted-foreground text-sm">Stripe, PayPal for secure payment processing</p>
            </div>
          </div>
        </section>

        <section id="managing-cookies" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Managing Your Cookie Preferences</h2>
          <p className="text-muted-foreground mb-4">
            You can manage your cookie preferences in several ways:
          </p>
          
          <h3 className="text-xl font-semibold text-foreground mb-3">Cookie Consent Banner</h3>
          <p className="text-muted-foreground mb-4">
            When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept.
          </p>

          <h3 className="text-xl font-semibold text-foreground mb-3">Cookie Preference Center</h3>
          <p className="text-muted-foreground mb-4">
            You can update your preferences at any time by clicking the "Cookie Settings" link in our website footer.
          </p>
        </section>

        <section id="browser-settings" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Browser Settings</h2>
          <p className="text-muted-foreground mb-4">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-1">
            <li>Block all cookies</li>
            <li>Allow only first-party cookies</li>
            <li>Delete existing cookies</li>
            <li>Set up notifications when cookies are being sent</li>
          </ul>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-amber-800 text-sm">
              <strong>⚠️ Important:</strong> Disabling essential cookies may prevent parts of our website from working properly, 
              including the reservation system and payment processing.
            </p>
          </div>
        </section>

        <section id="updates" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Policy Updates</h2>
          <p className="text-muted-foreground mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
            We will notify you of significant changes by updating the "Last updated" date at the top of this policy.
          </p>
        </section>

        <section id="contact" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            If you have questions about our use of cookies, please contact us:
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

export default CookiePolicy;