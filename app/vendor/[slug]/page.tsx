'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProfileByShopSlug } from '@/hooks/use-profile';

function StarRating({rating, count}: {rating: number; count: number}) {
  return (
    <div className="flex items-center gap-1.5 bg-[var(--v2-tertiary-container)]/20 px-3 py-1 rounded-full">
      <span
        className="v2-icon text-[var(--v2-tertiary)] text-lg"
        style={{fontVariationSettings: "'FILL' 1"}}
      >
        star
      </span>
      <span className="font-bold text-[var(--v2-on-surface)]">{rating.toFixed(1)}</span>
      <span className="text-[var(--v2-on-surface-variant)] text-sm">
        ({count} {count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: vendor, isLoading: loading } = useProfileByShopSlug(slug);

  const businessName = vendor?.business_name || vendor?.display_name || 'Vendor';
  const acceptedCards = vendor?.accepted_gift_cards || []; // Changed from vendor_accepted_gift_cards to match use-profile mapping

  const cardLabels: Record<string, {label: string; icon: string; description: string}> = {
    food: {label: 'Food Card', icon: 'restaurant', description: 'Redeemable for food & dining'},
    flex: {label: 'Flex Card', icon: 'credit_card', description: 'Universal prepaid gift card'},
    fashion: {label: 'Fashion Card', icon: 'checkroom', description: 'Redeemable for fashion items'},
    tech: {label: 'Tech Card', icon: 'devices', description: 'Redeemable for tech & gadgets'},
    beauty: {label: 'Beauty Card', icon: 'spa', description: 'Redeemable for beauty services'},
    entertainment: {label: 'Entertainment Card', icon: 'movie', description: 'Redeemable for entertainment'},
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">progress_activity</span>
          <p className="text-[var(--v2-on-surface-variant)] font-medium">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20 mb-4">storefront</span>
        <h1 className="text-2xl font-bold text-[var(--v2-on-surface)] mb-2">Vendor not found</h1>
        <p className="text-[var(--v2-on-surface-variant)] mb-6 text-center">We couldn't find a vendor with that slug.</p>
        <Link href="/" className="px-6 py-3 v2-hero-gradient text-white font-bold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  // Ratings are currently not in schema, using placeholders or calculating if logic exists
  const ratingValue = 4.8; 
  const reviewCount = 124;

  const websiteUrl = vendor?.social_links?.website;

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--v2-background)]/80 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
            <span className="font-bold text-[var(--v2-on-surface)]">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="v2-icon-button">share</button>
            <button className="v2-icon-button">more_vert</button>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative h-48 md:h-64 bg-[var(--v2-surface-container)]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--v2-background)]/60" />
        <div className="max-w-7xl mx-auto px-4 h-full relative">
          <div className="absolute -bottom-12 flex flex-col md:flex-row items-end gap-6 w-full">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-[var(--v2-surface)] border-4 border-[var(--v2-background)] shadow-xl overflow-hidden">
              {vendor.business_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vendor.business_logo_url} alt={businessName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)]">
                  <span className="v2-icon text-4xl">storefront</span>
                </div>
              )}
            </div>
            <div className="pb-2 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-[var(--v2-on-surface)]">
                  {businessName}
                </h1>
                <span className="v2-icon text-[var(--v2-primary)] text-xl" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <StarRating rating={ratingValue} count={reviewCount} />
                <div className="flex items-center gap-1.5 text-[var(--v2-on-surface-variant)] text-sm font-medium">
                  <span className="v2-icon text-base">location_on</span>
                  {vendor.business_address || vendor.country || 'Global'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="v2-card p-6 bg-[var(--v2-surface-container-low)]">
            <h2 className="text-lg font-bold text-[var(--v2-on-surface)] mb-4">About</h2>
            <p className="text-[var(--v2-on-surface-variant)] leading-relaxed mb-6">
              {vendor.bio || 'This vendor has not provided a biography yet.'}
            </p>
            
            <div className="space-y-4">
              {websiteUrl && (
                <a 
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-surface)] hover:bg-[var(--v2-primary-container)]/10 transition-colors group"
                >
                  <span className="v2-icon text-[var(--v2-primary)] group-hover:scale-110 transition-transform">language</span>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-[var(--v2-on-surface-variant)]">Website</p>
                    <p className="font-medium text-[var(--v2-on-surface)] truncate">{websiteUrl}</p>
                  </div>
                  <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">open_in_new</span>
                </a>
              )}
              
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[var(--v2-outline-variant)] hover:bg-[var(--v2-surface-container-high)]">
                  <span className="v2-icon text-[var(--v2-on-surface)]">mail</span>
                  <span className="font-bold text-sm">Contact</span>
                </button>
                <button className="v2-icon-button border border-[var(--v2-outline-variant)]">ios_share</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Accepted Cards & Redemptions */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="v2-icon text-[var(--v2-primary)]">payments</span>
              <h2 className="text-2xl font-black text-[var(--v2-on-surface)] uppercase tracking-tight">Accepted Gift Cards</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acceptedCards.length > 0 ? (
                acceptedCards.map((cardType: string) => {
                  const info = cardLabels[cardType as keyof typeof cardLabels] || {
                    label: `${cardType.charAt(0).toUpperCase() + cardType.slice(1)} Card`,
                    icon: 'credit_card',
                    description: 'Custom merchant gift card'
                  };
                  
                  return (
                    <div key={cardType} className="v2-card p-5 bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)] hover:border-[var(--v2-primary)]/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary-container)]/20 flex items-center justify-center">
                          <span className="v2-icon text-[var(--v2-primary)]">{info.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[var(--v2-on-surface)]">{info.label}</h3>
                          <p className="text-sm text-[var(--v2-on-surface-variant)] mb-4">{info.description}</p>
                          <Link 
                            href={`/gifts/${cardType}-card`}
                            className="text-sm font-bold text-[var(--v2-primary)] hover:underline flex items-center gap-1"
                          >
                            Send as a gift <span className="v2-icon text-xs">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-12 text-center bg-[var(--v2-surface-container-low)] rounded-3xl border border-dashed border-[var(--v2-outline-variant)]">
                  <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/40 mb-3">credit_card_off</span>
                  <p className="text-[var(--v2-on-surface-variant)] font-medium">No gift cards listed yet</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="v2-icon text-[var(--v2-primary)]">info</span>
              <h2 className="text-2xl font-black text-[var(--v2-on-surface)] uppercase tracking-tight">How to Redeem</h2>
            </div>
            
            <div className="space-y-4">
              {[
                {step: 1, title: 'Purchase or Receive a Card', text: `Get a compatible gift card that ${businessName} accepts.`},
                {step: 2, title: 'Visit our Location', text: 'Head to our physical store or visit our website to shop.'},
                {step: 3, title: 'Present your QR Code', text: 'Show your digital card QR code or enter the code at checkout.'},
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--v2-primary)] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--v2-on-surface)]">{item.title}</h4>
                    <p className="text-[var(--v2-on-surface-variant)] text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* CTA Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--v2-background)]/80 backdrop-blur-xl border-t border-[var(--v2-outline-variant)] md:hidden">
        <button className="w-full py-4 v2-hero-gradient text-white font-black rounded-2xl shadow-lg shadow-[var(--v2-primary)]/20 active:scale-[0.98] transition-transform">
          SEND A GIFT
        </button>
      </footer>
    </div>
  );
}
