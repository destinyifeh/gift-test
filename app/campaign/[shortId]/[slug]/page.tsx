'use client';

import Navbar from '@/components/landing/Navbar';
import SendCampaignGiftModal from '@/components/SendCampaignGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Progress} from '@/components/ui/progress';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {useCampaign} from '@/hooks/use-campaigns';
import {useIsMobile} from '@/hooks/use-mobile';
import {fetchCampaignContributions} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {getDaysLeft} from '@/lib/utils/date';
import {generateSlug} from '@/lib/utils/slugs';
import {cn} from '@/lib/utils';
import {useInfiniteQuery} from '@tanstack/react-query';
import {
  Calendar,
  ChevronLeft,
  Clock,
  Gift,
  Globe,
  Heart,
  Loader2,
  Lock,
  Share2,
  Users,
  Flag,
} from 'lucide-react';
import { V2ReportModal } from '@/components/modals/V2ReportModal';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect, use, useState} from 'react';
import {toast} from 'sonner';

export default function CampaignPage({
  params,
}: {
  params: Promise<{shortId: string; slug: string}>;
}) {
  const {shortId, slug: urlSlug} = use(params);
  const router = useRouter();
  const isMobile = useIsMobile();
  const {data: c, isLoading, error} = useCampaign(shortId);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // SEO validation: ensure the URL slug matches the campaign's title slug
  useEffect(() => {
    if (c) {
      const expectedSlug = c.campaign_slug || generateSlug(c.title || '');
      if (urlSlug !== expectedSlug && expectedSlug) {
        router.replace(`/campaign/${shortId}/${expectedSlug}`);
      }
    }
  }, [c, urlSlug, shortId, router]);

  // Paginated contributions for this campaign
  const {
    data: contribPages,
    fetchNextPage: fetchMoreContribs,
    hasNextPage: hasMoreContribs,
    isFetchingNextPage: isFetchingContribs,
  } = useInfiniteQuery({
    queryKey: ['campaign-contributions', shortId],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchCampaignContributions({slug: shortId, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!shortId,
  });

  const paginatedContribs = contribPages?.pages.flatMap(p => p.data || []) || [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({title: c?.title, url});
      } catch {
        navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading campaign...</p>
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold mb-2">Campaign not found</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/campaigns">
          <Button variant="hero">Browse Campaigns</Button>
        </Link>
      </div>
    );
  }

  const progress =
    Number(c.goal_amount) > 0
      ? (Number(c.current_amount) / Number(c.goal_amount)) * 100
      : 0;

  const daysLeft = getDaysLeft(c.end_date);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 pb-32 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Link */}
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-6">
            <ChevronLeft className="w-4 h-4" /> Back to Campaigns
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="md:col-span-3 space-y-4">
              {/* Image */}
              <div className="rounded-xl overflow-hidden bg-muted aspect-video relative border border-border">
                <img
                  src={c.image_url || '/default-campaign.png'}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {c.category}
                </Badge>
                <Badge variant="outline" className="gap-1 capitalize">
                  {c.visibility === 'public' ? (
                    <Globe className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {c.visibility}
                </Badge>
              </div>

              {/* Title & Description */}
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {c.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {c.description || 'No description provided.'}
              </p>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2">
                <span>
                  Created by{' '}
                  <span className="text-foreground font-medium capitalize">
                    {c.profiles?.display_name || c.profiles?.username || 'Organizer'}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Ends {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'No end date'}
                </span>
              </div>

              {/* Mobile Progress Card */}
              <div className="md:hidden">
                <div className={cn('p-4 rounded-xl', 'bg-card border border-border')}>
                  {/* Amount */}
                  <div className="text-center mb-3">
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(c.current_amount, c.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(c.goal_amount) > 0
                        ? `raised of ${formatCurrency(c.goal_amount, c.currency)} goal`
                        : 'raised so far'}
                    </p>
                  </div>

                  {/* Progress */}
                  {Number(c.goal_amount) > 0 && (
                    <Progress value={progress} className="h-2 mb-3" />
                  )}

                  {/* Stats */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {c.contributions?.length || 0} contributors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {daysLeft} days left
                    </span>
                  </div>
                </div>
              </div>

              {/* Contributions Section */}
              <div className={cn('p-4 rounded-xl mt-4', 'bg-card border border-border')}>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Recent Contributions
                </h3>
                <div className="space-y-3">
                  {paginatedContribs.length > 0 ? (
                    <>
                      {paginatedContribs.map((contrib: any) => (
                        <div
                          key={contrib.id}
                          className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {contrib.is_anonymous ? '?' : contrib.donor_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-foreground truncate">
                                {contrib.is_anonymous ? 'Anonymous' : contrib.donor_name}
                              </p>
                              {!contrib.hide_amount && contrib.amount ? (
                                <span className="text-sm font-semibold text-primary shrink-0">
                                  {formatCurrency(contrib.amount, contrib.currency || c.currency)}
                                </span>
                              ) : contrib.hide_amount ? (
                                <span className="text-[10px] text-muted-foreground italic shrink-0">
                                  hidden
                                </span>
                              ) : null}
                            </div>
                            {contrib.message && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                "{contrib.message}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      <InfiniteScroll
                        hasMore={!!hasMoreContribs}
                        isLoading={isFetchingContribs}
                        onLoadMore={fetchMoreContribs}
                      />
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        No contributions yet. Be the first to support this campaign!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block md:col-span-2 space-y-4">
              {/* Progress Card */}
              <div className={cn('p-5 rounded-xl', 'bg-card border border-border shadow-sm')}>
                {/* Amount */}
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(c.current_amount, c.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Number(c.goal_amount) > 0
                      ? `raised of ${formatCurrency(c.goal_amount, c.currency)} goal`
                      : 'raised so far'}
                  </p>
                </div>

                {/* Progress */}
                {Number(c.goal_amount) > 0 && (
                  <Progress value={progress} className="h-2.5 mb-4" />
                )}

                {/* Stats */}
                <div className="flex justify-between text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {c.contributions?.length || 0} contributors
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {daysLeft} days left
                  </span>
                </div>

                {/* Actions */}
                <Button
                  variant="hero"
                  className="w-full h-12 text-base mb-3"
                  onClick={() => setShowGiftModal(true)}>
                  <Gift className="w-5 h-5 mr-2" /> Send a Gift
                </Button>
                <Button variant="outline" className="w-full gap-2 mb-3" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Share Campaign
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50" 
                  onClick={() => setShowReportModal(true)}
                >
                  <Flag className="w-4 h-4" /> Report Campaign
                </Button>
              </div>

              {/* Organizer Card */}
              <div className={cn('p-4 rounded-xl', 'bg-card border border-border')}>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Organized by
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {(c.profiles?.display_name || c.profiles?.username || 'O').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {c.profiles?.display_name || c.profiles?.username || 'Organizer'}
                    </p>
                    {c.profiles?.username && (
                      <p className="text-xs text-muted-foreground">@{c.profiles.username}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      {isMobile && (
        <StickyFooter className="flex gap-3">
          <Button
            variant="hero"
            className="flex-1 h-12"
            onClick={() => setShowGiftModal(true)}>
            <Gift className="w-5 h-5 mr-2" /> Send a Gift
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0 text-muted-foreground hover:text-red-500" onClick={() => setShowReportModal(true)}>
            <Flag className="w-5 h-5" />
          </Button>
        </StickyFooter>
      )}

      <SendCampaignGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        campaignSlug={shortId}
        campaignTitle={c.title}
        creatorName={c.profiles?.display_name || 'Organizer'}
        minAmount={c.min_amount}
        currency={c.currency}
      />
      <V2ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={c.id}
        targetType="campaign"
        targetName={c.title}
      />
    </div>
  );
}
