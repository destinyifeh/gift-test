'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useProfileByShopSlug } from '@/hooks/use-profile';
import { useVendorRating } from '@/hooks/use-rating';
import { useGiftCards } from '@/hooks/use-gift-cards';
import api from '@/lib/api-client';
import { RatingModal } from '../../components/RatingModal';
import { V2ReportModal } from '@/components/modals/V2ReportModal';
import { V2MessageVendorModal } from '@/components/modals/V2MessageVendorModal';
import { useState } from 'react';
import { MapPin, Globe, Mail, Share2, MoreVertical, Verified, Star, CreditCard, Info, ArrowRight, ArrowLeft, Store, Flag } from 'lucide-react';
import { toast } from 'sonner';

function StarRating({ rating, count, onRate }: { rating: number; count: number; onRate?: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-[var(--v2-tertiary-container)]/20 px-3 py-1.5 rounded-full border border-[var(--v2-tertiary)]/10">
        <Star className="w-4 h-4 text-[var(--v2-tertiary)] fill-[var(--v2-tertiary)]" />
        <span className="font-bold text-[var(--v2-on-surface)]">{rating.toFixed(1)}</span>
        <span className="text-[var(--v2-on-surface-variant)] text-xs font-medium opacity-60">
          ({count} {count === 1 ? 'review' : 'reviews'})
        </span>
      </div>
      {onRate && (
        <button 
          onClick={onRate}
          className="text-xs font-bold text-[var(--v2-primary)] hover:underline active:opacity-70 transition-opacity"
        >
          Rate this shop
        </button>
      )}
    </div>
  );
}

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { data: vendor, isLoading: loading } = useProfileByShopSlug(slug);
  const { data: aggregateRating } = useVendorRating(vendor?.id);
  const { data: allGiftCards = [] } = useGiftCards();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const businessName = vendor?.business_name || vendor?.display_name || 'Vendor';
  let acceptedCardIds = vendor?.accepted_gift_cards || []; 

  // Platform Rule: Flex Card is automatically accepted safely.
  const flexCard = allGiftCards.find((c: any) => c.name === 'Flex Card' || c.isFlexCard);
  if (flexCard && !acceptedCardIds.includes(flexCard.id)) {
    acceptedCardIds = [flexCard.id, ...acceptedCardIds];
  }

  // Map IDs to actual card metadata
  const acceptedCardsData = acceptedCardIds.map((id: number) => {
    const card = allGiftCards.find((c: any) => c.id === id);
    if (!card) return null;
    return {
      id: card.id,
      label: card.name,
      slug: card.slug,
      icon: card.category?.toLowerCase() || 'credit_card',
      description: card.description,
      brandColor: card.brandColor || 'var(--v2-primary)',
      imageUrl: card.imageUrl
    };
  }).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[var(--v2-primary)]/20 border-t-[var(--v2-primary)] animate-spin" />
          <p className="text-[var(--v2-on-surface-variant)] font-bold tracking-tight">Loading premium profile...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <span className="v2-icon text-6xl text-[var(--v2-on-surface-variant)]/20 mb-4">storefront</span>
        <h1 className="text-2xl font-black text-[var(--v2-on-surface)] mb-2">Vendor not found</h1>
        <p className="text-[var(--v2-on-surface-variant)] mb-6 text-center max-w-xs">We couldn't find a vendor with that URL identifier.</p>
        <Link href="/" className="px-8 py-4 v2-hero-gradient text-white font-black rounded-2xl shadow-xl shadow-[var(--v2-primary)]/20 active:scale-95 transition-transform">
          Back to Hub
        </Link>
      </div>
    );
  }

  const websiteUrl = vendor?.social_links?.website;
  const ratingValue = aggregateRating?.average || 0;
  const reviewCount = aggregateRating?.count || 0;
  
  const fullAddress = [
    vendor.business_street || vendor.business_address,
    vendor.business_city,
    vendor.business_state,
    vendor.business_country
  ].filter(Boolean).join(', ');

  const handleGetDirections = () => {
    const query = encodeURIComponent(fullAddress || businessName);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${businessName} on Gatherly Gifts`,
      text: `Check out ${businessName}'s storefront on Gatherly Gifts and send a gift card!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleContact = () => {
    setIsMessageModalOpen(true);
  };

  const handleReportShop = () => {
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--v2-background)] pb-32">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--v2-background)]/80 backdrop-blur-xl border-b border-[var(--v2-outline-variant)]/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center group-hover:bg-[var(--v2-primary)]/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors" />
            </div>
            <span className="font-black text-[var(--v2-on-surface)] tracking-tight">Back</span>
          </button>
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center hover:bg-[var(--v2-primary)]/10 transition-colors group"
              title="Share Shop"
            >
              <Share2 className="w-4 h-4 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors" />
            </button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-xl bg-[var(--v2-surface-container)] flex items-center justify-center hover:bg-[var(--v2-primary)]/10 transition-colors group"
            >
              <MoreVertical className="w-4 h-4 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-[var(--v2-outline-variant)]/10 p-2 z-20 animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={() => { handleShare(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--v2-primary)]/5 text-sm font-bold text-[var(--v2-on-surface)] flex items-center gap-3"
                  >
                    <Share2 className="w-4 h-4" /> Share Link
                  </button>
                  <button 
                    onClick={() => { handleReportShop(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-sm font-bold text-red-500 flex items-center gap-3"
                  >
                    <Flag className="w-4 h-4" /> Report Shop
                  </button>
                  <div className="my-1 border-t border-[var(--v2-outline-variant)]/5" />
                  <button 
                    onClick={() => { handleContact(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--v2-primary)]/5 text-sm font-bold text-[var(--v2-on-surface-variant)] flex items-center gap-3"
                  >
                    <Mail className="w-4 h-4" /> Message Us
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="relative h-64 md:h-80 bg-[var(--v2-primary-container)]/10">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--v2-primary)]/5 via-transparent to-[var(--v2-tertiary)]/5" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--v2-primary)_1px,_transparent_1px)] [background-size:24px_24px] overflow-hidden" />
        
        <div className="max-w-7xl mx-auto px-4 h-full relative">
          <div className="absolute -bottom-8 md:-bottom-12 flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 w-full z-20">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] bg-white border-4 md:border-8 border-[var(--v2-background)] shadow-2xl overflow-hidden group relative z-20">
              {vendor.business_logo_url ? (
                <img src={vendor.business_logo_url} alt={businessName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--v2-primary-container)]/30 text-[var(--v2-primary)]">
                  <span className="v2-icon text-5xl">storefront</span>
                </div>
              )}
            </div>
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-black text-[var(--v2-on-surface)] tracking-tighter">
                  {businessName}
                </h1>
                {vendor.is_verified && (
                  <div className="w-8 h-8 rounded-full bg-[var(--v2-primary)] flex items-center justify-center shadow-lg shadow-[var(--v2-primary)]/20">
                    <Verified className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <StarRating 
                  rating={ratingValue} 
                  count={reviewCount} 
                  onRate={() => setIsRatingModalOpen(true)}
                />
                <div className="flex items-center gap-2 text-[var(--v2-on-surface-variant)] text-sm font-bold opacity-70 mt-2">
                  <MapPin className="w-4 h-4 text-[var(--v2-secondary)]" />
                  {vendor.business_city && vendor.business_state 
                    ? `${vendor.business_city}, ${vendor.business_state}` 
                    : (vendor.business_state || vendor.business_country || 'Available Locations')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-16 lg:pt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 lg:mt-0">
        {/* Left Column: Cards & Guide (Col 8) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Accepted Cards */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[var(--v2-primary)]" />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-[var(--v2-on-surface)] tracking-tight uppercase">ACCEPTED CARDS</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {acceptedCardsData.length > 0 ? (
                acceptedCardsData.map((card: any) => (
                  <Link 
                    key={card.id}
                    href={`/gifts/${card.slug}`}
                    className="group rounded-[2.5rem] bg-white border border-[var(--v2-outline-variant)]/10 p-6 shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:shadow-[var(--v2-primary)]/5 hover:-translate-y-1 transition-all flex flex-col gap-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center overflow-hidden">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <span className="v2-icon text-[var(--v2-primary)] text-3xl">credit_card</span>
                        )}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[var(--v2-primary)]/5 text-[var(--v2-primary)] text-[10px] font-black uppercase tracking-widest">
                        ACCEPTED
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors">{card.label}</h3>
                      <p className="text-sm text-[var(--v2-on-surface-variant)] opacity-60 line-clamp-2 font-medium">
                        {card.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-[var(--v2-primary)] mt-2">
                       SEND AS GIFT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full p-16 text-center bg-[var(--v2-surface-container-low)] rounded-[3rem] border-2 border-dashed border-[var(--v2-outline-variant)]/20">
                    <div className="w-16 h-16 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center mx-auto mb-6">
                      <CreditCard className="w-8 h-8 text-[var(--v2-on-surface-variant)] opacity-30" />
                    </div>
                  <h3 className="text-lg font-bold text-[var(--v2-on-surface)] mb-2">No gift cards listed</h3>
                  <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium opacity-60">This vendor hasn't linked any specific gift cards yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Redemption Guide */}
          <section className="rounded-[3rem] p-10 bg-[var(--v2-surface-container-highest)]/30 border border-[var(--v2-outline-variant)]/10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-[var(--v2-secondary)]/10 flex items-center justify-center">
                <Info className="w-6 h-6 text-[var(--v2-secondary)]" />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-[var(--v2-on-surface)] tracking-tight uppercase">HOW TO REDEEM</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                {step: 1, title: 'Get Card', text: `Purchase the compatible gift card accepted at ${businessName}.`, icon: 'shopping_bag'},
                {step: 2, title: 'Visit Shop', text: 'Head to our physical store location linked in the address section.', icon: 'directions_walk'},
                {step: 3, title: 'Checkout', text: 'Present your digital QR code to the cashier at the point of sale.', icon: 'qr_code_2'},
              ].map((item, idx) => (
                <div key={item.step} className="flex flex-col items-center text-center space-y-4 relative">
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-2 z-10">
                    <span className="v2-icon text-[var(--v2-primary)] text-3xl">{item.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-[var(--v2-on-surface)] uppercase text-sm tracking-tight">{item.title}</h4>
                    <p className="text-[var(--v2-on-surface-variant)] text-xs font-medium leading-relaxed opacity-70">{item.text}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-8 left-[70%] w-[60%] h-px bg-gradient-to-r from-[var(--v2-outline-variant)]/20 to-transparent dashed" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Info Card (Col 4) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-[2.5rem] p-8 bg-white border border-[var(--v2-outline-variant)]/10 shadow-xl shadow-black/5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-black v2-headline text-[var(--v2-on-surface)]">About this shop</h2>
              <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium leading-relaxed opacity-80">
                {vendor.bio || `${businessName} is a verified partner on Gifthance, accepting digital cards at their physical locations.`}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-[var(--v2-surface-container-low)] space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--v2-on-surface)]">
                  <MapPin className="w-5 h-5 text-[var(--v2-secondary)]" />
                  <span>Physical Address</span>
                </div>
                <p className="text-[var(--v2-on-surface-variant)] text-xs font-medium pl-8">
                  {fullAddress || 'Contact vendor for specific location details'}
                </p>
                <button 
                  onClick={handleGetDirections}
                  className="w-full mt-2 py-3 rounded-2xl bg-white border border-[var(--v2-outline-variant)]/20 text-xs font-black text-[var(--v2-primary)] hover:bg-[var(--v2-primary)]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  GET DIRECTIONS
                </button>
              </div>

              {websiteUrl && (
                <a 
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-5 rounded-3xl bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-primary)]/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5 text-[var(--v2-primary)]" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-[var(--v2-on-surface-variant)] uppercase tracking-widest opacity-60">Website</p>
                    <p className="font-bold text-[var(--v2-on-surface)] truncate">{websiteUrl}</p>
                  </div>
                </a>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleContact}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] transition-colors group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm">Message Us</span>
                </button>
                <button 
                  onClick={handleReportShop}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors group"
                >
                  <Flag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm">Report</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="bg-[var(--v2-surface-container)] rounded-[2.5rem] p-8 border border-[var(--v2-outline-variant)]/10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-[2rem] bg-white flex items-center justify-center shadow-sm">
                <Verified className="w-8 h-8 text-[var(--v2-primary)]" />
            </div>
            <div>
                <p className="text-xl font-black text-[var(--v2-on-surface)]">Verified</p>
                <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium">Official Gifthance Partner</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* CTA Footer (Mobile Only) */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[var(--v2-background)]/80 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10 md:hidden z-50">
        <button 
          onClick={() => {
            const firstCard = acceptedCardsData[0];
            if (firstCard) window.location.href = `/gifts/${firstCard.slug}`;
          }}
          className="w-full py-5 v2-hero-gradient text-white font-black rounded-2xl shadow-2xl shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
        >
          SEND A GIFT
          <ArrowRight className="w-5 h-5" />
        </button>
      </footer>

      {/* Rating Modal */}
      {vendor?.id && (
        <RatingModal 
          open={isRatingModalOpen}
          onOpenChange={setIsRatingModalOpen}
          vendorId={vendor.id}
          vendorName={businessName}
        />
      )}

      {/* Report Modal */}
      {vendor?.id && (
        <V2ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetId={vendor.id}
          targetType="vendor"
          targetName={businessName}
        />
      )}

      {/* Message Modal */}
      {vendor?.id && (
        <V2MessageVendorModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          vendorId={vendor.id}
          vendorName={businessName}
        />
      )}
    </div>
  );
}
