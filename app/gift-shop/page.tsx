'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {VendorRating} from '@/components/VendorRating';
import {useFavorites} from '@/hooks/use-favorites';
import {useVendorProducts} from '@/hooks/use-vendor';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {useUserStore} from '@/lib/store/useUserStore';
import {cn} from '@/lib/utils';
import {AnimatePresence, motion} from 'framer-motion';
import {Filter, Heart, Loader2, Search, ShoppingBag, SlidersHorizontal, X} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';

const categories = ['all', 'birthday', 'spa', 'fashion', 'food'];

export default function GiftShopPage() {
  const {data: gifts = [], isLoading: loading} = useVendorProducts();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [giftType, setGiftType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const {favorites: favList, toggleFavorite} = useFavorites();
  const user = useUserStore(state => state.user);

  const favIds = favList.map(f => String(f.id));

  const handleFavoriteClick = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }
    toggleFavorite(productId);
  };

  const filtered = gifts.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (category !== 'all' && g.category !== category) return false;
    if (giftType !== 'all' && g.type !== giftType) return false;
    if (priceRange === 'under-25' && g.price >= 25) return false;
    if (priceRange === '25-50' && (g.price < 25 || g.price > 50)) return false;
    if (priceRange === '50-100' && (g.price < 50 || g.price > 100))
      return false;
    if (priceRange === 'over-100' && g.price <= 100) return false;
    return true;
  });

  const activeFiltersCount = [category, priceRange, giftType].filter(f => f !== 'all').length;

  const clearFilters = () => {
    setCategory('all');
    setPriceRange('all');
    setGiftType('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-24 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center py-6 md:py-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground mb-2">
              Gift <span className="text-gradient">Shop</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Browse curated gifts from top vendors. Find the perfect gift for any occasion.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-border mb-4">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search gifts..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-0 focus-visible:ring-1"
                />
              </div>

              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="md:hidden h-11 w-11 shrink-0 relative"
                onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-32 h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>
                        {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-32 h-11">
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-25">Under $25</SelectItem>
                    <SelectItem value="25-50">$25 - $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="over-100">Over $100</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={giftType} onValueChange={setGiftType}>
                  <SelectTrigger className="w-32 h-11">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{height: 0, opacity: 0}}
                  animate={{height: 'auto', opacity: 1}}
                  exit={{height: 0, opacity: 0}}
                  transition={{duration: 0.2}}
                  className="md:hidden overflow-hidden">
                  <div className="pt-3 pb-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c} value={c}>
                              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Price" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prices</SelectItem>
                          <SelectItem value="under-25">Under $25</SelectItem>
                          <SelectItem value="25-50">$25 - $50</SelectItem>
                          <SelectItem value="50-100">$50 - $100</SelectItem>
                          <SelectItem value="over-100">Over $100</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={giftType} onValueChange={setGiftType}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="physical">Physical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-muted-foreground">
                        <X className="w-3 h-3 mr-1" /> Clear Filters
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          {!loading && (
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'gift' : 'gifts'} found
            </p>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((gift, i) => (
                <motion.div
                  key={gift.id}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: i * 0.03}}>
                  <Link
                    href={`/gift-shop/${gift.profiles?.shop_slug || 'unknown'}/${gift.slug || gift.id}`}
                    className="block group">
                    <div
                      className={cn(
                        'rounded-xl overflow-hidden',
                        'bg-card border border-border',
                        'hover:border-primary/30 hover:shadow-lg',
                        'transition-all duration-200',
                      )}>
                      {/* Image */}
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        {gift.image_url ? (
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl text-muted-foreground/20">
                            🎁
                          </div>
                        )}
                        {/* Favorite Button */}
                        <button
                          onClick={e => handleFavoriteClick(e, gift.id)}
                          className={cn(
                            'absolute top-2 right-2 w-8 h-8 rounded-full',
                            'flex items-center justify-center',
                            'bg-background/90 backdrop-blur-sm shadow-sm',
                            'hover:scale-110 active:scale-95 transition-transform',
                          )}>
                          <Heart
                            className={cn(
                              'w-4 h-4',
                              favIds.includes(String(gift.id))
                                ? 'fill-destructive text-destructive'
                                : 'text-muted-foreground',
                            )}
                          />
                        </button>
                        {/* Type Badge */}
                        <Badge
                          variant="outline"
                          className="absolute bottom-2 left-2 text-[10px] bg-background/90 backdrop-blur-sm">
                          {gift.type}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                          {gift.category}
                        </p>
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1 mb-1">
                          {gift.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 capitalize line-clamp-1">
                          {gift.profiles?.shop_name || gift.profiles?.display_name || 'Vendor'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-primary">
                            {getCurrencySymbol(getCurrencyByCountry(gift.profiles?.country))}
                            {gift.price.toLocaleString()}
                          </span>
                          <VendorRating
                            vendorId={gift.vendor_id}
                            className="text-[10px] text-accent"
                            iconClassName="w-3 h-3"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No gifts found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your filters or search terms.
              </p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
