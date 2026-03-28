'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Input} from '@/components/ui/input';
import {Progress} from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {usePublicCampaigns} from '@/hooks/use-campaigns';
import {CAMPAIGN_CATEGORY_IDS} from '@/lib/constants/campaigns';
import {formatCurrency} from '@/lib/utils/currency';
import {getDaysLeft} from '@/lib/utils/date';
import {generateSlug} from '@/lib/utils/slugs';
import {cn} from '@/lib/utils';
import {AnimatePresence, motion} from 'framer-motion';
import {Clock, Globe, Loader2, Plus, Search, SlidersHorizontal, Users, X} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

export default function CampaignsPage() {
  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    usePublicCampaigns();

  const campaigns = data?.pages.flatMap(page => page.data || []) || [];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = (campaigns || []).filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (category !== 'all' && c.category !== category) return false;
    return true;
  });

  const hasActiveFilter = category !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-24 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center py-6 md:py-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground mb-2">
              Public <span className="text-gradient">Campaigns</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Browse and contribute to gift campaigns from the community.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 md:mx-0 md:px-0 border-b md:border-none border-border mb-4">
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
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
                {hasActiveFilter && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-2">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40 h-11">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_CATEGORY_IDS.map(c => (
                      <SelectItem key={c} value={c}>
                        {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasActiveFilter && (
                  <Button variant="ghost" size="sm" onClick={() => setCategory('all')} className="text-muted-foreground">
                    Clear
                  </Button>
                )}
              </div>

              {/* Create Button */}
              <Link href="/create-campaign" className="hidden sm:block">
                <Button variant="hero" className="h-11">
                  <Plus className="w-4 h-4 mr-1" /> Create
                </Button>
              </Link>
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
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_CATEGORY_IDS.map(c => (
                          <SelectItem key={c} value={c}>
                            {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasActiveFilter && (
                      <Button variant="ghost" size="sm" onClick={() => setCategory('all')} className="w-full text-muted-foreground">
                        <X className="w-3 h-3 mr-1" /> Clear Filter
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'campaign' : 'campaigns'} found
            </p>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : (
            /* Campaign Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{opacity: 0, y: 10}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: i * 0.03}}>
                  <Link href={`/campaign/${c.campaign_short_id}/${c.campaign_slug || generateSlug(c.title)}`}>
                    <div
                      className={cn(
                        'rounded-xl overflow-hidden h-full',
                        'bg-card border border-border',
                        'hover:border-primary/30 hover:shadow-lg',
                        'transition-all duration-200',
                      )}>
                      {/* Image */}
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img
                          src={c.image_url || '/default-campaign.png'}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <Badge variant="secondary" className="text-[10px] capitalize">
                            {c.category}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="absolute top-2 right-2 text-[10px] bg-background/80 backdrop-blur-sm gap-1">
                          <Globe className="w-3 h-3" /> public
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                          {c.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {c.description || 'No description provided.'}
                        </p>

                        {/* Progress */}
                        {Number(c.goal_amount) > 0 ? (
                          <>
                            <Progress
                              value={(Number(c.current_amount) / Number(c.goal_amount)) * 100}
                              className="h-1.5 mb-2"
                            />
                            <div className="flex justify-between text-xs mb-3">
                              <span className="font-semibold text-foreground">
                                {formatCurrency(c.current_amount, c.currency)}
                                <span className="font-normal text-muted-foreground">
                                  {' '}of {formatCurrency(c.goal_amount, c.currency)}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round((Number(c.current_amount) / Number(c.goal_amount)) * 100)}%
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="mb-3">
                            <span className="text-sm font-semibold text-foreground">
                              {formatCurrency(c.current_amount, c.currency)}
                            </span>
                            <span className="text-xs text-muted-foreground"> raised</span>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {c.contributions?.length || 0} contributors
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getDaysLeft(c.end_date)} days left
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 capitalize">
                          by {c.profiles?.display_name || c.profiles?.username || 'Organizer'}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Infinite Scroll */}
          {!isLoading && campaigns.length > 0 && (
            <InfiniteScroll
              hasMore={!!hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          )}

          {/* Empty State */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No campaigns found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || hasActiveFilter
                  ? 'Try adjusting your filters or search terms.'
                  : 'Be the first to create a campaign!'}
              </p>
              {(search || hasActiveFilter) ? (
                <Button variant="outline" onClick={() => { setSearch(''); setCategory('all'); }}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/create-campaign">
                  <Button variant="hero">
                    <Plus className="w-4 h-4 mr-1" /> Create Campaign
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 sm:hidden z-40">
        <Link href="/create-campaign">
          <Button variant="hero" size="lg" className="rounded-full w-14 h-14 shadow-lg">
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
