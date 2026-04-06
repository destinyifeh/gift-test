'use client';

import {use, useMemo} from 'react';
import {useCampaign, useCampaignContributions} from '@/hooks/use-campaigns';

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
  V2ContributionsModal,
} from './components';
import {useState} from 'react';
import {V2ReportModal} from '@/components/modals/V2ReportModal';
import V2SendCampaignGiftModal from '../../../components/V2SendCampaignGiftModal';

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
  return contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
}

export default function CampaignDetailsPage({params}: PageProps) {
  const {shortId} = use(params);

  const {data: campaign, isLoading, isError, error} = useCampaign(shortId);
  const {
    data: contributionsData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useCampaignContributions(shortId);
  
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showContributionsModal, setShowContributionsModal] = useState(false);

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
      <CampaignDetailMobileNav title={campaign.title} onShare={handleShare} onReport={() => setShowReportModal(true)} />

      {/* Main Content */}
      <main className="pt-16 md:pt-24 pb-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Status Message Banner */}
          {campaign.status !== 'active' && (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <span className="v2-icon text-2xl">info</span>
              </div>
              <div>
                <h4 className="text-lg font-black v2-headline text-amber-900 leading-tight">
                  This campaign is currently {campaign.status === 'paused' ? 'Paused' : 'Inactive'}
                </h4>
                <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                  {campaign.status_reason || (campaign.status === 'paused' 
                    ? "The organizer has temporarily paused new contributions. You can still view the story and existing contributions."
                    : "This campaign is not currently accepting support.")}
                </p>
              </div>
            </div>
          )}
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
                onViewAll={() => setShowContributionsModal(true)}
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
               onReport={() => setShowReportModal(true)}
               onSendGift={() => setShowGiftModal(true)}
             />
           </div>
         </div>
       </main>
 
       {/* Desktop Footer */}
       <CampaignDetailFooter />
 
       {/* Mobile Sticky Bottom Action */}
       <MobileStickyAction 
         campaignShortId={campaign.campaign_short_id} 
         onSendGift={() => setShowGiftModal(true)}
       />
 
       <V2SendCampaignGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        campaignSlug={shortId}
        campaignTitle={campaign.title || ''}
        creatorName={campaign.profiles?.display_name || ''}
        minAmount={campaign.min_amount}
        currency={campaign.currency}
        status={campaign.status}
        statusReason={campaign.status_reason}
      />
 
       <V2ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={campaign.id}
        targetType="campaign"
        targetName={campaign.title}
      />

       <V2ContributionsModal
        open={showContributionsModal}
        onOpenChange={setShowContributionsModal}
        contributions={contributionsData?.pages.flatMap(page => page.data) || []}
        currency={campaign.currency || 'NGN'}
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}
