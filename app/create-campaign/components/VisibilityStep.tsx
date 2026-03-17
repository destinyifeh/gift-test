'use client';

import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {Globe, Lock} from 'lucide-react';

interface VisibilityStepProps {
  visibility: 'public' | 'private';
  setVisibility: (v: 'public' | 'private') => void;
  contributorsSeeEachOther: boolean;
  setContributorsSeeEachOther: (v: boolean) => void;
  category: string;
}

export function VisibilityStep({
  visibility,
  setVisibility,
  contributorsSeeEachOther,
  setContributorsSeeEachOther,
  category,
}: VisibilityStepProps) {
  if (category === 'claimable') return null;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Campaign Visibility
      </h2>
      <div className="space-y-3">
        <button
          onClick={() => setVisibility('public')}
          className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
            visibility === 'public'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}>
          <Globe
            className={`w-6 h-6 mt-0.5 ${
              visibility === 'public' ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
          <div>
            <p className="font-semibold text-foreground">Public Campaign</p>
            <p className="text-sm text-muted-foreground">
              Anyone can see this campaign and contributions
            </p>
          </div>
        </button>
        <button
          onClick={() => setVisibility('private')}
          className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
            visibility === 'private'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}>
          <Lock
            className={`w-6 h-6 mt-0.5 ${
              visibility === 'private'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
          <div>
            <p className="font-semibold text-foreground">Private Campaign</p>
            <p className="text-sm text-muted-foreground">
              Only invited people or link holders can see this campaign
            </p>
          </div>
        </button>
      </div>

      {visibility === 'private' && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
          <p className="font-medium text-foreground text-sm">
            Privacy Settings
          </p>
          <div className="flex items-start gap-3">
            <Checkbox
              id="see-each-other"
              checked={contributorsSeeEachOther}
              onCheckedChange={v => setContributorsSeeEachOther(!!v)}
            />
            <div>
              <Label
                htmlFor="see-each-other"
                className="cursor-pointer font-medium">
                Contributors can see each other
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invite-only social campaign — contributors can see who else
                contributed
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="no-see-each-other"
              checked={!contributorsSeeEachOther}
              onCheckedChange={v => setContributorsSeeEachOther(!v)}
            />
            <div>
              <Label
                htmlFor="no-see-each-other"
                className="cursor-pointer font-medium">
                Contributors cannot see each other
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Strictly private — no one can see who else contributed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
