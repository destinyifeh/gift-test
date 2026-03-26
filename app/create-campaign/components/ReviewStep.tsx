'use client';

import {Badge} from '@/components/ui/badge';
import {Globe, Lock} from 'lucide-react';

interface ReviewStepProps {
  category: string;
  standard: {
    title: string;
    goal: string;
    endDate: string;
  };
  visibility: 'public' | 'private';
  image: string | null;
  contributorsSeeEachOther: boolean;
}

export function ReviewStep({
  category,
  standard,
  visibility,
  image,
  contributorsSeeEachOther,
}: ReviewStepProps) {
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

        {standard.endDate && (
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

        {visibility === 'private' && (
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
