'use client';

import {useState} from 'react';

interface CampaignStoryProps {
  description?: string;
}

export function CampaignStory({description}: CampaignStoryProps) {
  const [expanded, setExpanded] = useState(false);

  // Split description into paragraphs
  const paragraphs = description?.split('\n').filter(p => p.trim()) || [];
  const shortDescription = paragraphs[0] || 'Support this campaign and help make a difference.';

  return (
    <section className="px-2 md:px-0">
      <h2 className="text-xl md:text-2xl font-bold v2-headline mb-4">
        <span className="md:hidden">The Story</span>
        <span className="hidden md:inline">The Campaign Story</span>
      </h2>

      {/* Mobile Story */}
      <div className="md:hidden bg-[var(--v2-surface-container-low)] rounded-xl p-5">
        <p className="text-[var(--v2-on-surface-variant)] leading-relaxed">
          {expanded ? description || shortDescription : shortDescription}
        </p>
        {paragraphs.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-[var(--v2-primary)] font-bold flex items-center gap-1 hover:underline"
          >
            {expanded ? 'Show less' : 'Read full story'}
            <span className="v2-icon text-sm">
              {expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>
        )}
      </div>

      {/* Desktop Story */}
      <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] p-8 md:p-12 rounded-[2rem] space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="text-lg leading-relaxed text-[var(--v2-on-surface-variant)]"
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-lg leading-relaxed text-[var(--v2-on-surface-variant)]">
            {shortDescription}
          </p>
        )}
      </div>
    </section>
  );
}

export function MobileVerifiedCard() {
  return (
    <section className="md:hidden px-2">
      <div className="bg-[var(--v2-surface-container-highest)]/30 border border-[var(--v2-outline-variant)]/10 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--v2-primary)]/10 flex items-center justify-center text-[var(--v2-primary)]">
          <span className="v2-icon text-3xl">verified_user</span>
        </div>
        <div>
          <h3 className="v2-headline font-bold text-[var(--v2-on-surface)]">
            Campaign Verified
          </h3>
          <p className="text-sm text-[var(--v2-on-surface-variant)]">
            By Gifthance Trust & Safety Team
          </p>
        </div>
      </div>
    </section>
  );
}
