'use client';

import Navbar from '@/components/landing/Navbar';
import SendCampaignGiftModal from '@/components/SendCampaignGiftModal';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Progress} from '@/components/ui/progress';
import {useCampaign} from '@/hooks/use-campaigns';
import {fetchCampaignContributions} from '@/lib/server/actions/analytics';
import {formatCurrency} from '@/lib/utils/currency';
import {getDaysLeft} from '@/lib/utils/date';
import {useInfiniteQuery} from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Gift,
  Globe,
  Heart,
  Loader2,
  Lock,
  Share2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {use, useState} from 'react';

// Removed mockContributions as we now use real data

export default function CampaignPage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = use(params);
  const {data: c, isLoading, error} = useCampaign(slug);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Paginated contributions for this campaign
  const {
    data: contribPages,
    fetchNextPage: fetchMoreContribs,
    hasNextPage: hasMoreContribs,
    isFetchingNextPage: isFetchingContribs,
  } = useInfiniteQuery({
    queryKey: ['campaign-contributions', slug],
    initialPageParam: 0,
    queryFn: ({pageParam = 0}) => fetchCampaignContributions({slug, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    enabled: !!slug,
  });

  const paginatedContribs =
    contribPages?.pages.flatMap(p => p.data || []) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-xl font-medium">Loading campaign...</p>
      </div>
    );
  }

  if (error || !c) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 font-display">
          Campaign not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The campaign you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/campaigns">
          <Button variant="default">Browse Campaigns</Button>
        </Link>
      </div>
    );
  }

  const progress =
    Number(c.goal_amount) > 0
      ? (Number(c.current_amount) / Number(c.goal_amount)) * 100
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-3">
              <div className="rounded-2xl overflow-hidden bg-muted aspect-video mb-6 flex items-center justify-center relative border border-border">
                <img
                  src={c.image_url || '/default-campaign.png'}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-3">
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
              <h1 className="text-3xl font-bold font-display text-foreground mb-3">
                {c.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {c.description || 'No description provided.'}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>
                  Created by{' '}
                  <span className="text-foreground font-medium capitalize">
                    {c.profiles?.display_name ||
                      c.profiles?.username ||
                      'Organizer'}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Ends on{' '}
                  {c.end_date
                    ? new Date(c.end_date).toLocaleDateString()
                    : 'No end date'}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Card className="border-border shadow-elevated">
                <CardContent className="p-6">
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
                  {Number(c.goal_amount) > 0 && (
                    <Progress value={progress} className="h-3 mb-4" />
                  )}
                  {
                    Number(c.goal_amount) === 0 && (
                      <div className="h-3 mb-4" />
                    ) /* Spacer if no progress */
                  }
                  <div className="flex justify-between text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />{' '}
                      {c.contributions?.length || 0} contributors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {getDaysLeft(c.end_date)}{' '}
                      days left
                    </span>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full h-12 text-base mb-3"
                    onClick={() => setShowGiftModal(true)}>
                    <Gift className="w-5 h-5 mr-2" /> Send a Gift
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" /> Share Campaign
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" /> Recent
                    Contributions
                  </h3>
                  <div className="space-y-3">
                    {paginatedContribs.length > 0 ? (
                      <>
                        {paginatedContribs.map((contrib: any) => (
                          <div
                            key={contrib.id}
                            className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-muted text-xs">
                                {contrib.is_anonymous
                                  ? '?'
                                  : contrib.donor_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground">
                                  {contrib.is_anonymous
                                    ? 'Anonymous'
                                    : contrib.donor_name}
                                </p>
                                {!contrib.hide_amount && contrib.amount && (
                                  <span className="text-sm font-semibold text-primary">
                                    {formatCurrency(
                                      contrib.amount,
                                      contrib.currency || c.currency,
                                    )}
                                  </span>
                                )}
                                {contrib.hide_amount && (
                                  <span className="text-xs text-muted-foreground italic">
                                    hidden
                                  </span>
                                )}
                              </div>
                              {contrib.message && (
                                <p className="text-xs text-muted-foreground mt-0.5 break-words">
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
                          No contributions yet. Be the first to support this
                          campaign!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SendCampaignGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        campaignSlug={slug}
        campaignTitle={c.title}
        creatorName={c.profiles?.display_name || 'Organizer'}
        minAmount={c.min_amount}
        currency={c.currency}
      />
    </div>
  );
}
