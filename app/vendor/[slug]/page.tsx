'use client';

import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import api from '@/lib/api-client';

interface VendorProfile {
  id: number;
  display_name: string;
  shop_name?: string;
  bio?: string;
  avatar_url?: string;
  shop_logo_url?: string;
  shop_address?: string;
  vendor_accepted_gift_cards?: string[];
  shop_url?: string;
  social_links?: Record<string, string>;
  country?: string;
  rating?: number;
  review_count?: number;
}

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
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendor() {
      try {
        const res = await api.get(`/users/vendor/${slug}`);
        setVendor(res.data);
      } catch {
        // Use fallback mock data if API fails
        setVendor({
          id: 0,
          display_name: slug?.replace(/-/g, ' ') || 'Vendor',
          shop_name: slug?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Vendor',
          bio: 'Welcome to our business! We accept gift card redemptions for our products and services.',
          vendor_accepted_gift_cards: ['food', 'flex'],
          shop_address: '',
          country: 'Nigeria',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchVendor();
  }, [slug]);

  const businessName = vendor?.shop_name || vendor?.display_name || 'Vendor';
  const acceptedCards = vendor?.vendor_accepted_gift_cards || [];

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

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/"
              className="text-xl md:text-2xl font-black text-[var(--v2-on-surface)] tracking-tight v2-headline"
            >
              Gifthance
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="/gifts" className="v2-headline font-bold text-lg text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] transition-colors">
                Gifts
              </Link>
              <Link href="/dashboard" className="v2-headline font-bold text-lg text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/gifts" className="p-2 rounded-full hover:bg-[var(--v2-surface-container-low)] transition-colors active:scale-95">
              <span className="v2-icon text-[var(--v2-primary)]">redeem</span>
            </Link>
            <Link href="/dashboard" className="p-2 rounded-full hover:bg-[var(--v2-surface-container-low)] transition-colors active:scale-95">
              <span className="v2-icon text-[var(--v2-primary)]">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-24 pb-24 md:pb-12 max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 md:mb-8 text-[var(--v2-on-surface-variant)] text-xs md:text-sm font-medium">
          <Link href="/" className="hover:text-[var(--v2-primary)]">Home</Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <Link href="/vendors" className="hover:text-[var(--v2-primary)]">Vendors</Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <span className="text-[var(--v2-on-surface)] truncate max-w-[180px]">{businessName}</span>
        </nav>

        {/* Hero Profile */}
        <section className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden mb-6 md:mb-10" style={{background: 'linear-gradient(135deg, var(--v2-primary), var(--v2-primary-container))'}}>
          <div className="absolute -right-20 -top-20 w-48 md:w-80 h-48 md:h-80 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute -left-10 -bottom-10 w-40 md:w-64 h-40 md:h-64 bg-white/5 rounded-full blur-[60px]" />
          <div className="relative z-10 p-6 md:p-12">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* Avatar */}
              <div className="w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-white/15 backdrop-blur-md flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/20">
                {vendor?.shop_logo_url || vendor?.avatar_url ? (
                  <img src={vendor.shop_logo_url || vendor.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-6xl font-black text-white/80 capitalize">
                    {businessName.charAt(0)}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-5xl font-black v2-headline tracking-tight text-white">
                    {businessName}
                  </h1>
                  <span className="bg-white/20 backdrop-blur text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Verified Vendor
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-3 md:mb-4">
                  <StarRating rating={vendor?.rating || 0} count={vendor?.review_count || 0} />
                  {vendor?.shop_address && (
                    <div className="flex items-center gap-2 text-white/70">
                      <span className="v2-icon text-lg">location_on</span>
                      <span className="text-sm font-medium">{vendor.shop_address}</span>
                    </div>
                  )}
                </div>

                {vendor?.bio && (
                  <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-2xl mb-4 md:mb-6">
                    {vendor.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {acceptedCards.map(card => {
                    const info = cardLabels[card] || {label: card, icon: 'card_giftcard'};
                    return (
                      <span key={card} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        <span className="v2-icon text-sm" style={{fontVariationSettings: "'FILL' 1"}}>{info.icon}</span>
                        {info.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {/* Accepted Gift Cards */}
            <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-40 h-40 bg-[var(--v2-primary)]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="w-9 md:w-10 h-9 md:h-10 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-primary)] text-lg" style={{fontVariationSettings: "'FILL' 1"}}>credit_card</span>
                  </div>
                  <h2 className="text-lg md:text-xl v2-headline font-bold text-[var(--v2-on-surface)]">
                    Accepted Gift Cards
                  </h2>
                </div>

                {acceptedCards.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {acceptedCards.map(card => {
                      const info = cardLabels[card] || {label: card, icon: 'card_giftcard', description: 'Redeemable gift card'};
                      return (
                        <div key={card} className="flex items-center gap-4 p-4 md:p-5 bg-[var(--v2-surface-container-low)] rounded-xl md:rounded-2xl group hover:shadow-lg transition-all">
                          <div className="w-12 h-12 rounded-xl bg-[var(--v2-primary)]/10 flex items-center justify-center shrink-0">
                            <span className="v2-icon text-[var(--v2-primary)] text-xl" style={{fontVariationSettings: "'FILL' 1"}}>{info.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[var(--v2-on-surface)] text-sm md:text-base">{info.label}</p>
                            <p className="text-xs text-[var(--v2-on-surface-variant)]">{info.description}</p>
                          </div>
                          <span className="v2-icon text-emerald-500 ml-auto shrink-0" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]/30 mb-3 block">credit_card_off</span>
                    <p className="text-[var(--v2-on-surface-variant)]">No gift cards accepted yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
              <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[var(--v2-secondary)]/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <div className="w-9 md:w-10 h-9 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <span className="v2-icon text-emerald-600 text-lg" style={{fontVariationSettings: "'FILL' 1"}}>info</span>
                  </div>
                  <h2 className="text-lg md:text-xl v2-headline font-bold text-[var(--v2-on-surface)]">
                    How to Redeem
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  {[
                    {step: '1', icon: 'card_giftcard', title: 'Get a Gift Card', desc: 'Receive a Gifthance gift card from someone special'},
                    {step: '2', icon: 'storefront', title: 'Visit This Vendor', desc: 'Show your gift card code or QR to the vendor'},
                    {step: '3', icon: 'verified', title: 'Redeem & Enjoy', desc: 'Vendor verifies and redeems the value instantly'},
                  ].map(item => (
                    <div key={item.step} className="text-center p-4 md:p-5">
                      <div className="w-12 h-12 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center mx-auto mb-3">
                        <span className="v2-icon text-[var(--v2-primary)] text-xl" style={{fontVariationSettings: "'FILL' 1"}}>{item.icon}</span>
                      </div>
                      <h3 className="font-bold text-sm text-[var(--v2-on-surface)] mb-1">{item.title}</h3>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            {/* Business Details */}
            <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[var(--v2-primary)]/5 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h3 className="v2-headline font-bold text-base md:text-xl text-[var(--v2-on-surface)] mb-4 md:mb-6">
                  Business Details
                </h3>
                <div className="space-y-4">
                  {vendor?.shop_address && (
                    <div className="flex items-start gap-3">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)] text-lg mt-0.5">location_on</span>
                      <div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Address</p>
                        <p className="text-sm font-bold text-[var(--v2-on-surface)]">{vendor.shop_address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="v2-icon text-[var(--v2-on-surface-variant)] text-lg mt-0.5">credit_card</span>
                    <div>
                      <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Accepted Cards</p>
                      <p className="text-sm font-bold text-[var(--v2-on-surface)]">{acceptedCards.length} card type{acceptedCards.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {vendor?.country && (
                    <div className="flex items-start gap-3">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)] text-lg mt-0.5">public</span>
                      <div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Country</p>
                        <p className="text-sm font-bold text-[var(--v2-on-surface)]">{vendor.country}</p>
                      </div>
                    </div>
                  )}

                  {vendor?.shop_url && (
                    <div className="flex items-start gap-3">
                      <span className="v2-icon text-[var(--v2-on-surface-variant)] text-lg mt-0.5">language</span>
                      <div>
                        <p className="text-xs text-[var(--v2-on-surface-variant)] font-medium">Website</p>
                        <a href={vendor.shop_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[var(--v2-primary)] hover:underline">
                          {vendor.shop_url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="relative rounded-2xl md:rounded-[2rem] p-5 md:p-8 overflow-hidden" style={{background: 'linear-gradient(135deg, var(--v2-primary), var(--v2-primary-container))'}}>
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
                  <span className="v2-icon text-white text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>card_giftcard</span>
                </div>
                <h3 className="text-lg font-bold text-white v2-headline mb-2">Send a Gift Card</h3>
                <p className="text-white/60 text-sm mb-5">
                  Gift someone special a card they can redeem at this vendor.
                </p>
                <Link
                  href="/gifts"
                  className="block w-full py-3.5 bg-white text-[var(--v2-primary)] font-bold rounded-xl text-sm hover:bg-white/90 transition-colors active:scale-[0.98]"
                >
                  Browse Gift Cards
                </Link>
              </div>
            </div>

            {/* Social Links */}
            {vendor?.social_links && Object.keys(vendor.social_links).length > 0 && (
              <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl md:rounded-[2rem] p-5 md:p-8">
                <h3 className="v2-headline font-bold text-base text-[var(--v2-on-surface)] mb-4">Connect</h3>
                <div className="flex gap-3">
                  {Object.entries(vendor.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-white transition-all"
                    >
                      <span className="v2-icon text-lg">public</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--v2-surface-container-lowest)] py-10 md:pt-16 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/" className="text-xl font-black text-[var(--v2-on-surface)] tracking-tight v2-headline">
              Gifthance
            </Link>
            <p className="text-[var(--v2-on-surface-variant)] text-xs font-medium">
              © 2026 Gifthance. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
              <Link href="/privacy" className="hover:text-[var(--v2-primary)]">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--v2-primary)]">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
