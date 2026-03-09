import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CategoriesSection from "@/components/landing/CategoriesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturedCampaigns from "@/components/landing/FeaturedCampaigns";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <FeaturedCampaigns />
      <IntegrationsSection />
      <TestimonialsSection />
      <CTASection />
      <NewsletterSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;
