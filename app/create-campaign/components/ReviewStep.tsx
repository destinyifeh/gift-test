'use client';

import {Badge} from '@/components/ui/badge';
import {getCurrencySymbol} from '@/lib/constants/currencies';
import {Globe, Lock} from 'lucide-react';

interface ReviewStepProps {
  category: string;
  claimable: {
    giftType: 'money' | 'gift-card';
    amount: string;
    giftId: number | null;
    recipientType: 'self' | 'other';
    recipientEmail: string;
    senderEmail: string;
  };
  standard: {
    title: string;
    goal: string;
    endDate: string;
    currency: string;
  };
  visibility: 'public' | 'private';
  image: string | null;
  contributorsSeeEachOther: boolean;
  allVendorGifts: any[];
}

export function ReviewStep({
  category,
  claimable,
  standard,
  visibility,
  image,
  contributorsSeeEachOther,
  allVendorGifts,
}: ReviewStepProps) {
  const isClaimable = category === 'claimable';
  const selectedGift = allVendorGifts.find(g => g.id === claimable.giftId);
  const claimableGiftValue =
    claimable.giftType === 'money'
      ? `${getCurrencySymbol(standard.currency)}${claimable.amount || '0'}`
      : selectedGift?.name || '—';

  const totalToPay =
    claimable.giftType === 'money'
      ? `${getCurrencySymbol(standard.currency)}${claimable.amount || '0'}`
      : `${getCurrencySymbol(standard.currency)}${Number(selectedGift?.price || 0).toLocaleString()}`;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Review & Launch
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Category</span>
          <Badge variant="secondary">{category || '—'}</Badge>
        </div>

        {isClaimable && (
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total to Pay</span>
              <span className="text-lg font-bold text-primary">
                {totalToPay}
              </span>
            </div>
          </div>
        )}

        {isClaimable ? (
          <div className="space-y-3 mt-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Gift Type</span>
              <span className="text-foreground font-medium capitalize">
                {claimable.giftType}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Value</span>
              <span className="text-foreground font-medium">
                {claimableGiftValue}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Recipient</span>
              <span className="text-foreground font-medium">
                {claimable.recipientEmail || '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Sender Email</span>
              <span className="text-foreground font-medium">
                {claimable.senderEmail || '—'}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Title</span>
              <span className="text-foreground font-medium">
                {standard.title || '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Goal</span>
              <span className="text-foreground font-medium">
                {standard.goal ? `$${standard.goal}` : 'No goal'}
              </span>
            </div>
          </div>
        )}

        {standard.endDate && !isClaimable && (
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">End Date</span>
            <span className="text-foreground font-medium">
              {standard.endDate}
            </span>
          </div>
        )}

        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-muted-foreground">Visibility</span>
          <span className="text-foreground font-medium flex items-center gap-1">
            {visibility === 'public' ? (
              <Globe className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            {visibility === 'public' ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-muted-foreground text-sm">
              Campaign Image
            </span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50">
            <img
              src={image || '/default-campaign.png'}
              alt="Campaign Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {visibility === 'private' && !isClaimable && (
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Contributors</span>
            <span className="text-foreground font-medium text-sm">
              {contributorsSeeEachOther
                ? 'Can see each other'
                : 'Cannot see each other'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
