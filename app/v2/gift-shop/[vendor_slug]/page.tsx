'use client';

import Link from 'next/link';
import {use} from 'react';
import {useAuth} from '@/hooks/use-auth';
import {useProfileByShopSlug} from '@/hooks/use-profile';
import {useVendorProducts} from '@/hooks/use-vendor';
import {formatCurrency} from '@/lib/utils/currency';
import {useState} from 'react';
import {V2ReportModal} from '@/components/modals/V2ReportModal';

// Helper to get primary image
function getPrimaryImage(product: any): string | null {
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || null;
}

export default function V2VendorShopPage({
  params,
}: {
  params: Promise<{vendor_slug: string}>;
}) {
  const {vendor_slug} = use(params);

  // Centralized auth
  const {isLoggedIn} = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);

  // TanStack Query: Fetch vendor by shop_slug
  const {data: vendor, isLoading: vendorLoading} = useProfileByShopSlug(vendor_slug);

  // TanStack Query: Fetch vendor's products
  const {data: products = [], isLoading: productsLoading} = useVendorProducts(vendor?.id);

  const loading = vendorLoading || productsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin mb-3">progress_activity</span>
        <p className="text-sm text-[var(--v2-on-surface-variant)]">Loading vendor...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center mb-4">
          <span className="v2-icon text-4xl text-[var(--v2-on-surface-variant)]">storefront</span>
        </div>
        <h1 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">Vendor not found</h1>
        <p className="text-sm text-[var(--v2-on-surface-variant)] mb-6 text-center">
          This vendor doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/v2/gift-shop"
          className="px-6 py-3 v2-hero-gradient text-[var(--v2-on-primary)] font-bold rounded-xl"
        >
          Back to Gift Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link
              href="/v2"
              className="text-2xl font-black text-[var(--v2-primary)] tracking-tight v2-headline"
            >
              Gifthance
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              <Link
                href="/v2/gift-shop"
                className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 v2-headline font-bold text-sm"
              >
                Gift Shop
              </Link>
              <Link
                href="/v2/campaigns"
                className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] v2-headline font-bold text-sm transition-colors"
              >
                Campaigns
              </Link>
              <Link
                href="/v2/send-gift"
                className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)] v2-headline font-bold text-sm transition-colors"
              >
                Send Gift
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/v2/dashboard" className="p-2 text-[var(--v2-primary)]">
                <span className="v2-icon">account_circle</span>
              </Link>
            ) : (
              <Link href="/v2/login" className="text-[var(--v2-primary)] font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm font-medium">
          <Link href="/v2" className="hover:text-[var(--v2-primary)]">
            Home
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <Link href="/v2/gift-shop" className="hover:text-[var(--v2-primary)]">
            Gift Shop
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <span className="text-[var(--v2-on-surface)] capitalize">{vendor.shop_name || vendor.display_name}</span>
        </nav>

        {/* Vendor Profile Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Header Layout */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center text-center md:items-start md:text-left">
              {/* Vendor Logo */}
              <div className="w-28 h-28 rounded-3xl bg-[var(--v2-surface-container-low)] flex items-center justify-center shadow-[0_20px_40px_rgba(73,38,4,0.04)] overflow-hidden">
                {vendor.shop_logo_url ? (
                  <img src={vendor.shop_logo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="v2-icon text-[var(--v2-primary)] text-5xl"
                    style={{fontVariationSettings: "'FILL' 1"}}
                  >
                    storefront
                  </span>
                )}
              </div>

              {/* Vendor Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row flex-wrap items-center md:items-baseline gap-3 md:gap-4 mb-3">
                  <h1 className="text-3xl md:text-5xl font-black v2-headline tracking-tighter text-[var(--v2-on-surface)] capitalize">
                    {vendor.shop_name || vendor.display_name || 'Vendor Shop'}
                  </h1>
                  <div className="flex items-center gap-2">
                    {vendor.roles?.includes('vendor') && (
                      <span className="bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                        Verified Vendor
                      </span>
                    )}
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="flex items-center gap-1.5 p-1.5 px-3 bg-[var(--v2-surface-container)] rounded-full text-[var(--v2-on-surface-variant)] hover:text-red-600 transition-colors active:scale-95 shadow-sm"
                    >
                      <span className="v2-icon text-lg">flag</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Report</span>
                    </button>
                  </div>
                </div>

                {vendor.shop_address && (
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--v2-on-surface-variant)] mb-4">
                    <span className="v2-icon text-lg">location_on</span>
                    <span className="text-sm font-semibold">{vendor.shop_address}</span>
                  </div>
                )}

                <p className="text-base md:text-lg text-[var(--v2-on-surface-variant)] leading-relaxed max-w-2xl mx-auto md:mx-0">
                  {vendor.shop_description || vendor.bio || 'This vendor has not added a description yet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Stats */}
          <div className="lg:col-span-4 bg-[var(--v2-surface-container-lowest)] p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(73,38,4,0.04)] space-y-6">
            <h3 className="v2-headline font-bold text-xl text-[var(--v2-on-surface)]">
              Shop Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--v2-on-surface-variant)] font-medium">
                  Products
                </span>
                <span className="text-[var(--v2-on-surface)] font-bold">
                  {products.length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--v2-on-surface-variant)] font-medium">Status</span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
                Gift Products ({products.length})
              </h2>
              <div className="h-1.5 w-24 v2-hero-gradient rounded-full"></div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]/30 mb-4 block">inventory_2</span>
              <h3 className="text-xl font-bold text-[var(--v2-on-surface)] mb-2">No products yet</h3>
              <p className="text-[var(--v2-on-surface-variant)]">This vendor hasn&apos;t added any products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/v2/gift-shop/${vendor_slug}/${product.slug || product.id}`}
                  className="group bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(73,38,4,0.04)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(73,38,4,0.1)] hover:-translate-y-2"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--v2-surface-container)]">
                    {getPrimaryImage(product) ? (
                      <img
                        src={getPrimaryImage(product)!}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--v2-surface-container-high)] to-[var(--v2-surface-container)]">
                        <span
                          className="v2-icon text-8xl text-[var(--v2-outline-variant)]"
                          style={{fontVariationSettings: "'FILL' 1"}}
                        >
                          redeem
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-6 left-6 flex gap-2">
                      {product.type && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[var(--v2-on-surface)]">
                          {product.type}
                        </span>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)] mb-2 capitalize">
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest">
                            #{product.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[var(--v2-primary)]">
                          {formatCurrency(product.price, 'NGN')}
                        </p>
                      </div>
                    </div>

                    <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6 line-clamp-2">
                      {product.description || 'No description available.'}
                    </p>

                    <button className="w-full v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-transform duration-300 active:scale-[0.95]">
                      <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                        card_giftcard
                      </span>
                      Send as Gift
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <V2ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={vendor.id}
        targetType="vendor"
        targetName={vendor.shop_name || vendor.display_name}
      />
    </div>
  );
}
