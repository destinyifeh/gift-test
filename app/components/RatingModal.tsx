'use client';

import { useState } from 'react';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useRating } from '@/hooks/use-rating';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
}

export function RatingModal({ open, onOpenChange, vendorId, vendorName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const { submitVendorRating, isSubmitting } = useRating();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    submitVendorRating({
      vendorId,
      rating,
      comment: comment.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-[400px] p-8 rounded-[2.5rem] border-none shadow-2xl bg-white">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)] leading-tight">
              Rate {vendorName}
            </h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium opacity-60">
              How was your experience with this vendor?
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors",
                    (hoveredRating || rating) >= star
                      ? "text-[var(--v2-primary)] fill-[var(--v2-primary)]"
                      : "text-[var(--v2-surface-container-high)]"
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <textarea
              placeholder="Tell us more about your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full h-32 p-4 rounded-2xl bg-[var(--v2-surface-container-low)] border-2 border-transparent focus:border-[var(--v2-primary)]/20 focus:bg-white transition-all outline-none text-sm font-medium resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-2xl font-bold text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 h-14 v2-btn-primary rounded-2xl font-black text-lg shadow-xl shadow-[var(--v2-primary)]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
