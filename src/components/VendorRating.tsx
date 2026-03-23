'use client';

import {useVendorRatingStats} from '@/hooks/use-vendor';
import {Star} from 'lucide-react';
import {memo} from 'react';

function VendorRatingComponent({
  vendorId,
  className = '',
  iconClassName = '',
}: {
  vendorId?: string;
  className?: string;
  iconClassName?: string;
}) {
  const {data: ratingStats} = useVendorRatingStats(vendorId);

  if (!ratingStats || ratingStats.count === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className={`fill-accent text-accent ${iconClassName}`} />
      <span>{ratingStats.average.toFixed(1)}</span>
    </div>
  );
}

export const VendorRating = memo(VendorRatingComponent);
