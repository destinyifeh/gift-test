'use client';

import {DesktopCampaignCard, MobileCampaignCard, type Campaign} from './CampaignCard';

interface CampaignGridProps {
  campaigns: Campaign[];
}

export function DesktopCampaignGrid({campaigns}: CampaignGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {campaigns.map((campaign) => (
        <DesktopCampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}

export function MobileCampaignGrid({campaigns}: CampaignGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {campaigns.map((campaign) => (
        <MobileCampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
