import CategoriesSection from '@/components/landing/CategoriesSection';
import CTASection from '@/components/landing/CTASection';
import FAQSection from '@/components/landing/FAQSection';
import FeaturedCampaigns from '@/components/landing/FeaturedCampaigns';
import Footer from '@/components/landing/Footer';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import IntegrationsSection from '@/components/landing/IntegrationsSection';
import Navbar from '@/components/landing/Navbar';
import NewsletterSection from '@/components/landing/NewsletterSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';

export default function Home() {
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
}
