import {Input} from '@/components/ui/input';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {VisuallyHidden} from '@/components/ui/visually-hidden';
import api from '@/lib/api-client';
import {useQuery} from '@tanstack/react-query';
import {Compass, MapPin, Search, Store} from 'lucide-react';
import {useEffect, useState} from 'react';

interface Vendor {
  id: string;
  shopName: string;
  shopDescription: string;
  shopStreet: string;
  shopCity: string;
  shopState: string;
  shopCountry: string;
  shopLogoUrl: string;
  shopSlug: string;
}

interface VendorDiscoveryProps {
  giftCardId: number;
  country?: string;
  title?: string;
  variant?: 'carousel' | 'list';
}

export function V2VendorDiscovery({
  giftCardId,
  country,
  title = 'Where to use your gift ',
  variant = 'carousel',
}: VendorDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    city: string;
    region: string;
  } | null>(null);

  // Detect user location via IP (with caching)
  useEffect(() => {
    const CACHE_KEY = 'gifthance_user_location';
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const {data, timestamp} = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setUserLocation(data);
          return;
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city) {
          const locationData = {city: data.city, region: data.region};
          setUserLocation(locationData);
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: locationData,
              timestamp: Date.now(),
            }),
          );
        }
      })
      .catch(() => {
        console.warn(
          'Geolocation detection failed, falling back to global list.',
        );
      });
  }, []);

  const {data: vendors = [], isLoading} = useQuery({
    queryKey: ['accepted-vendors', giftCardId, country],
    queryFn: async () => {
      const params: any = {};
      if (country) params.country = country;

      const response = await api.get(`/vendor/accepted-vendors/${giftCardId}`, {
        params,
      });
      return response.data as Vendor[];
    },
    enabled: !!giftCardId,
  });

  // Prioritize vendors in user's city
  const sortedVendors = [...vendors].sort((a, b) => {
    if (!userLocation) return 0;
    const aInCity =
      a.shopCity?.toLowerCase() === userLocation.city?.toLowerCase();
    const bInCity =
      b.shopCity?.toLowerCase() === userLocation.city?.toLowerCase();
    if (aInCity && !bInCity) return -1;
    if (!aInCity && bInCity) return 1;
    return 0;
  });

  const filteredVendors = sortedVendors.filter(vendor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      vendor.shopName?.toLowerCase().includes(searchLower) ||
      vendor.shopCity?.toLowerCase().includes(searchLower) ||
      vendor.shopState?.toLowerCase().includes(searchLower)
    );
  });

  const displayTitle = userLocation
    ? `Vendors near ${userLocation.city}, ${userLocation.region}`
    : title;

  if (variant === 'list') {
    return (
      <>
        <div className="space-y-5">
          {/* Section Header */}
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--v2-primary-container)]/10 flex items-center justify-center border border-[var(--v2-primary)]/10">
              <Compass className="w-5 h-5 text-[var(--v2-primary)]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-lg font-black v2-headline text-[var(--v2-on-surface)] leading-none">
                {title}
              </h3>
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest opacity-60">
                {userLocation ? `Accepted near ${userLocation.city}` : 'Available locations'}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className="h-20 animate-pulse bg-[var(--v2-surface-container-low)] rounded-2xl border border-[var(--v2-outline-variant)]/10"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVendors.length > 0 ? (
                <div className="space-y-3">
                  {filteredVendors.slice(0, 3).map(vendor => (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        const query = encodeURIComponent(`${vendor.shopName} ${vendor.shopCity} ${vendor.shopState}`);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                      className="p-3.5 rounded-2xl bg-[var(--v2-surface-container-low)]/50 border border-[var(--v2-outline-variant)]/20 hover:border-[var(--v2-primary)]/30 hover:bg-[var(--v2-surface-container-low)] transition-all flex items-center gap-4 group cursor-pointer shadow-sm active:scale-[0.98]">
                      {/* Mini Logo */}
                      <div className="w-11 h-11 rounded-xl bg-[var(--v2-surface-container-lowest)] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[var(--v2-outline-variant)]/10 group-hover:scale-105 transition-transform">
                        {vendor.shopLogoUrl ? (
                          <img
                            src={vendor.shopLogoUrl}
                            alt={vendor.shopName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-5 h-5 text-[var(--v2-on-surface-variant)]/40" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[var(--v2-on-surface)] truncate group-hover:text-[var(--v2-primary)] transition-colors">
                          {vendor.shopName}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--v2-on-surface-variant)] mt-0.5">
                          <MapPin className="w-3 h-3 text-[var(--v2-secondary)]" />
                          <span className="truncate opacity-80">
                            {vendor.shopCity}, {vendor.shopState}
                          </span>
                        </div>
                      </div>

                      <div className="v2-icon text-[var(--v2-on-surface-variant)] opacity-50 group-hover:opacity-100 transition-opacity pr-1">
                        chevron_right
                      </div>
                    </div>
                  ))}

                  {vendors.length > 0 && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full h-11 rounded-xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10 text-xs font-bold text-[var(--v2-primary)] hover:bg-[var(--v2-primary-container)]/10 transition-colors flex items-center justify-center gap-2 mt-2">
                      <Compass className="w-4 h-4" />
                      {vendors.length > 3 ? `Explore ${vendors.length - 3} more vendors` : 'View all nearby vendors'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8 px-4 rounded-2xl bg-[var(--v2-surface-container-low)]/30 border border-dashed border-[var(--v2-outline-variant)]/30 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6 text-[var(--v2-on-surface-variant)]/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--v2-on-surface)]">
                      No nearby vendors yet
                    </p>
                    <p className="text-[10px] text-[var(--v2-on-surface-variant)] opacity-70 max-w-[200px]">
                      We're expanding rapidly. Check back soon for more locations!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ResponsiveModal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ResponsiveModalContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl sm:rounded-3xl bg-[var(--v2-surface)] max-h-[85vh] flex flex-col">
            <VisuallyHidden>
              <ResponsiveModalTitle>Nearby Vendors</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                View all vendors where you can use this gift card
              </ResponsiveModalDescription>
            </VisuallyHidden>

            <div className="p-6 border-b border-[var(--v2-outline-variant)]/20 bg-[var(--v2-primary-container)]/5">
              <h3 className="text-xl font-black v2-headline text-[var(--v2-on-surface)] mb-4">
                Nearby Vendors
              </h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--v2-on-surface-variant)]" />
                <Input
                  placeholder="Search city or shop name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-12 pl-11 rounded-xl bg-[var(--v2-surface-container-low)] border-none focus-visible:ring-2 focus-visible:ring-[var(--v2-primary)] font-medium shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
              {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        const query = encodeURIComponent(`${vendor.shopName} ${vendor.shopCity} ${vendor.shopState}`);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                      className="p-4 rounded-2xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/40 hover:border-[var(--v2-primary)]/50 transition-all flex flex-col gap-3 group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-[var(--v2-primary)]/5">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-[var(--v2-surface-container-low)] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[var(--v2-outline-variant)]/20 group-hover:scale-105 transition-transform">
                        {vendor.shopLogoUrl ? (
                          <img
                            src={vendor.shopLogoUrl}
                            alt={vendor.shopName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Store className="w-6 h-6 text-[var(--v2-on-surface-variant)]/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--v2-on-surface)] truncate group-hover:text-[var(--v2-primary)] transition-colors">
                          {vendor.shopName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--v2-on-secondary-container)] mt-1 px-2 py-0.5 rounded-full bg-[var(--v2-secondary-container)] w-fit uppercase tracking-wider">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {vendor.shopCity}, {vendor.shopState}
                          </span>
                        </div>
                      </div>
                    </div>
                    {vendor.shopDescription && (
                      <p className="text-xs text-[var(--v2-on-surface-variant)]/70 line-clamp-2 leading-relaxed pl-1">
                        {vendor.shopDescription}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[var(--v2-on-surface-variant)]/20" />
                  </div>
                  <p className="font-bold text-[var(--v2-on-surface-variant)]">
                    No matching vendors found
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--v2-surface-container)]/30 text-center border-t border-[var(--v2-outline-variant)]/10">
              <p className="text-[9px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-[0.3em]">
                Powered by Gifthance
              </p>
            </div>
          </ResponsiveModalContent>
        </ResponsiveModal>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)]">
          {displayTitle}
        </h3>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)] w-4 h-4" />
          <input
            type="text"
            placeholder="Search by city or state..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--v2-on-surface)] focus:ring-1 ring-[var(--v2-primary)] transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-5 overflow-x-auto pb-6 scroll-smooth px-1">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="min-w-[300px] h-36 animate-pulse bg-[var(--v2-surface-container-low)] rounded-3xl"
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-5 overflow-x-auto pb-6 scroll-smooth px-1">
          {filteredVendors.length > 0 ? (
            filteredVendors.map(vendor => (
              <div
                key={vendor.id}
                className="min-w-[300px] md:min-w-[340px] p-5 bg-[var(--v2-surface-container-lowest)] rounded-3xl border border-[var(--v2-outline-variant)]/40 hover:border-[var(--v2-primary)]/50 transition-all flex flex-col gap-4 group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-[var(--v2-primary)]/10 hover:-translate-y-1">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--v2-surface-container-low)] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[var(--v2-outline-variant)]/20 group-hover:scale-105 transition-transform">
                    {vendor.shopLogoUrl ? (
                      <img
                        src={vendor.shopLogoUrl}
                        alt={vendor.shopName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="w-7 h-7 text-[var(--v2-on-surface-variant)]/30" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--v2-on-surface)] truncate group-hover:text-[var(--v2-primary)] transition-colors text-base">
                      {vendor.shopName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--v2-on-secondary-container)] mt-1 bg-[var(--v2-secondary-container)] w-fit px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">
                        {vendor.shopCity}, {vendor.shopState}
                      </span>
                    </div>
                  </div>
                </div>

                {vendor.shopDescription && (
                  <p className="text-xs text-[var(--v2-on-surface-variant)]/80 line-clamp-2 leading-relaxed pl-1">
                    {vendor.shopDescription}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="w-full py-10 flex flex-col items-center justify-center text-center bg-[var(--v2-surface-container-low)]/30 rounded-2xl border border-dashed border-[var(--v2-outline-variant)]/50">
              <Search className="w-8 h-8 text-[var(--v2-on-surface-variant)]/30 mb-2" />
              <p className="text-sm font-medium text-[var(--v2-on-surface-variant)]">
                No vendors found in this location
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
