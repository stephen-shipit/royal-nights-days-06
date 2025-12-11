
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Reservations from "./pages/Reservations";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";
import CareerThankYou from "./pages/CareerThankYou";
import Menu from "./pages/Menu";
import MenuItemDetails from "./pages/MenuItemDetails";
import Gallery from "./pages/Gallery";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import PlanEvent from "./pages/PlanEvent";
import Perform from "./pages/Perform";
import RoyalMicThursdays from "./pages/RoyalMicThursdays";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import AdminTableLayout from "./pages/AdminTableLayout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import VIPMemberships from "./pages/VIPMemberships";
import VIPMembershipDetails from "./pages/VIPMembershipDetails";
import VIPPurchase from "./pages/VIPPurchase";
import VIPCard from "./pages/VIPCard";
import VIPPaymentSuccess from "./pages/VIPPaymentSuccess";
import VIPScanner from "./pages/VIPScanner";
import VIPMemberLogin from "./pages/VIPMemberLogin";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Component to log route changes
const RouteLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
    console.log('Current location object:', location);
  }, [location]);
  
  return null;
};

const App = () => {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <BrowserRouter>
            <ScrollToTop />
            <RouteLogger />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/reservations" element={<Reservations />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/menu/:menuItemId" element={<MenuItemDetails />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<EventDetails />} />
              <Route path="/plan-event" element={<PlanEvent />} />
              <Route path="/perform" element={<Perform />} />
              <Route path="/royal-mic-thursdays" element={<RoyalMicThursdays />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/thank-you" element={<CareerThankYou />} />
              <Route path="/careers/:jobId" element={<CareerDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/table-layout" element={<AdminTableLayout />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="/vip-memberships" element={<VIPMemberships />} />
              <Route path="/vip-memberships/:levelId" element={<VIPMembershipDetails />} />
              <Route path="/vip-purchase/:levelId" element={<VIPPurchase />} />
              <Route path="/vip-card/:token" element={<VIPCard />} />
              <Route path="/vip-payment-success" element={<VIPPaymentSuccess />} />
              <Route path="/vip-scanner" element={<VIPScanner />} />
              <Route path="/vip-login" element={<VIPMemberLogin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
