'use client';

import {Badge} from '@/components/ui/badge';
import {CreditCard, Globe, Lock} from 'lucide-react';

interface ReviewStepProps {
  category: string;
  claimable: {
    giftType: 'money' | 'gift-card';
    amount: string;
    giftId: number | null;
    recipientType: 'self' | 'other';
    recipientEmail: string;
  };
  standard: {
    title: string;
    goal: string;
    endDate: string;
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
  const claimableGiftValue =
    claimable.giftType === 'money'
      ? `$${claimable.amount || '0'}`
      : allVendorGifts.find(g => g.id === claimable.giftId)?.name || '—';

  const totalToPay =
    claimable.giftType === 'money'
      ? `$${claimable.amount || '0'}`
      : `$${allVendorGifts.find(g => g.id === claimable.giftId)?.price || '0'}`;

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
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <CreditCard className="w-4 h-4" /> Payment Required
            </div>
            <p className="text-xs text-muted-foreground">
              You will be redirected to our secure payment partner to complete
              this {claimable.giftType} purchase.
            </p>
            <div className="flex justify-between items-center pt-2 border-t border-primary/10">
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
              <span className="text-muted-foreground">For</span>
              <span className="text-foreground font-medium">
                {claimable.recipientType === 'self'
                  ? 'Myself'
                  : claimable.recipientEmail || '—'}
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

        {image && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-muted-foreground text-sm">
                Campaign Image
              </span>
              <Badge variant="outline" className="text-[10px]">
                Optional
              </Badge>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50">
              <img
                src={image}
                alt="Campaign Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

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
