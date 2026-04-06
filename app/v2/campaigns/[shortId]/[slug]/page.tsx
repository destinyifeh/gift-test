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

function getExpiryWarning(endDate?: string | null): string | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs <= 1) return "Ending in less than an hour";
  if (diffHrs <= 2) return "Ending in 2 hours";
  if (diffHrs <= 24) return `Ending in ${Math.floor(diffHrs)} hours`;
  return null;
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
  const goal = campaign?.goal_amount || 0;
  const currency = campaign?.currency || 'NGN';
  const contributorsCount = campaign?.contributions?.length || 0;
  const daysLeft = useMemo(() => getDaysLeft(campaign?.end_date), [campaign?.end_date]);
  const expiryWarning = useMemo(() => getExpiryWarning(campaign?.end_date), [campaign?.end_date]);
  const isGoalReached = goal > 0 && raised >= goal;
  const isExpired = campaign?.end_date && new Date(campaign.end_date) < new Date();
  const effectiveStatus = isExpired ? 'completed' : (campaign?.status || 'active');

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
          {effectiveStatus !== 'active' && (
            <div className={`mb-8 p-6 border rounded-[2rem] flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 ${
              effectiveStatus === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                effectiveStatus === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <span className="v2-icon text-2xl">{effectiveStatus === 'completed' ? 'check_circle' : 'info'}</span>
              </div>
              <div>
                <h4 className={`text-lg font-black v2-headline leading-tight ${
                  effectiveStatus === 'completed' ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  {effectiveStatus === 'completed' 
                    ? 'Campaign Completed' 
                    : `Campaign ${effectiveStatus === 'paused' ? 'Paused' : 'Inactive'}`}
                </h4>
                <p className={`text-sm mt-1 leading-relaxed ${
                  effectiveStatus === 'completed' ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {effectiveStatus === 'completed' 
                    ? "This campaign has reached its goal or has been closed."
                    : campaign.paused_by === 'admin'
                      ? "This campaign is temporarily unavailable. Contributions have been paused by the platform for review."
                      : campaign.paused_by === 'owner' || campaign.status === 'paused'
                        ? "This campaign is temporarily paused. The organizer has paused contributions for now."
                        : campaign.status_reason || "This campaign is not currently accepting support."}
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
                goal={campaign.goal_amount}
                currency={campaign.currency}
                contributorsCount={contributorsCount}
                daysLeft={daysLeft}
                isGoalReached={isGoalReached}
                expiryWarning={expiryWarning}
              />

              {/* Title and Meta - Desktop */}
              <div className="flex flex-col gap-2">
                {isGoalReached && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest animate-pulse">
                    <span className="v2-icon text-lg">celebration</span>
                    Goal reached!
                  </div>
                )}
                <CampaignTitleSection
                  title={campaign.title}
                  category={campaign.category}
                  isVerified={campaign.visibility === 'public'}
                />
              </div>

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
               status={effectiveStatus}
               isGoalReached={isGoalReached}
               expiryWarning={expiryWarning}
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
         status={effectiveStatus}
       />
 
       <V2SendCampaignGiftModal
        open={showGiftModal}
        onOpenChange={setShowGiftModal}
        campaignSlug={shortId}
        campaignTitle={campaign.title || ''}
        creatorName={campaign.profiles?.display_name || ''}
        minAmount={campaign.min_amount}
        currency={campaign.currency}
        status={effectiveStatus}
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
