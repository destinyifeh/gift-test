'use client';

import {CAMPAIGN_CATEGORIES} from '@/lib/constants/campaigns';

interface CategoryStepProps {
  selectedCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryStep({selectedCategory, onSelect}: CategoryStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Select Gift Type
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPAIGN_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedCategory === c.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}>
            <c.icon
              className={`w-6 h-6 mb-2 ${
                selectedCategory === c.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            />
            <p className="font-semibold text-foreground">{c.label}</p>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
