'use client';

import {use, useMemo} from 'react';
import {useCampaign} from '@/hooks/use-campaigns';

import {
  CampaignDetailDesktopNav,
  CampaignDetailMobileNav,
  CampaignHeroImage,
  MobileProgressCard,
  CampaignTitleSection,
  CampaignStory,
  MobileVerifiedCard,
  CampaignContributions,
  CampaignSidebar,
  MobileStickyAction,
  CampaignDetailFooter,
  CampaignDetailLoading,
  CampaignDetailError,
} from './components';

interface PageProps {
  params: Promise<{shortId: string; slug: string}>;
}

function getDaysLeft(endDate?: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getRaisedAmount(contributions?: {amount?: number}[]): number {
  if (!contributions || contributions.length === 0) return 0;
  return contributions.reduce((sum, c) => sum + ((c.amount || 0) / 100), 0);
}

export default function CampaignDetailsPage({params}: PageProps) {
  const {shortId} = use(params);

  const {data: campaign, isLoading, isError, error} = useCampaign(shortId);

  // Calculate derived values
  const raised = useMemo(() => getRaisedAmount(campaign?.contributions), [campaign?.contributions]);
  const goal = campaign?.goal_amount || 100000;
  const currency = campaign?.currency || 'NGN';
  const contributorsCount = campaign?.contributions?.length || 0;
  const daysLeft = getDaysLeft(campaign?.end_date);

  // Share handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = campaign?.title || 'Campaign';

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Support "${shareTitle}" on Gifthance`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (err) {
        // Clipboard not available
      }
    }
  };

  if (isLoading) {
    return <CampaignDetailLoading />;
  }

  if (isError || !campaign) {
    return <CampaignDetailError error={error?.message} />;
  }

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Navigation */}
      <CampaignDetailDesktopNav />
      <CampaignDetailMobileNav title={campaign.title} onShare={handleShare} />

      {/* Main Content */}
      <main className="pt-16 md:pt-24 pb-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Hero & Story Content (Left Column) */}
            <div className="lg:col-span-8 space-y-6 md:space-y-10">
              {/* Hero Image */}
              <CampaignHeroImage
                imageUrl={campaign.image_url}
                title={campaign.title}
              />

              {/* Mobile Floating Progress Card */}
              <MobileProgressCard
                raised={raised}
                goal={goal}
                currency={currency}
                contributorsCount={contributorsCount}
                daysLeft={daysLeft}
              />

              {/* Title and Meta - Desktop */}
              <CampaignTitleSection
                title={campaign.title}
                category={campaign.category}
                isVerified={campaign.visibility === 'public'}
              />

              {/* Story Section */}
              <CampaignStory description={campaign.description} />

              {/* Recent Contributions */}
              <CampaignContributions
                contributions={campaign.contributions || []}
                currency={currency}
              />

              {/* Mobile Verified Card */}
              {campaign.visibility === 'public' && <MobileVerifiedCard />}
            </div>

            {/* Funding Sidebar (Right Column) - Desktop Only */}
            <CampaignSidebar
              raised={raised}
              goal={goal}
              currency={currency}
              contributorsCount={contributorsCount}
              daysLeft={daysLeft}
              organizerName={campaign.profiles?.display_name || campaign.profiles?.username}
              organizerAvatar={campaign.profiles?.avatar_url}
              campaignShortId={campaign.campaign_short_id}
              onShare={handleShare}
            />
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <CampaignDetailFooter />

      {/* Mobile Sticky Bottom Action */}
      <MobileStickyAction campaignShortId={campaign.campaign_short_id} />
    </div>
  );
}
