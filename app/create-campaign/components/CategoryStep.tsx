'use client';

import {
  Briefcase,
  Calendar,
  CreditCard,
  Gamepad2,
  Gift,
  Heart,
  Sun,
  Users,
} from 'lucide-react';

const categories = [
  {
    id: 'personal',
    label: 'Personal Gift',
    icon: Gift,
    desc: 'Birthday, anniversary, or special occasion',
  },
  {
    id: 'group',
    label: 'Group Gift',
    icon: Users,
    desc: 'Pool contributions from friends and family',
  },
  {
    id: 'claimable',
    label: 'Claimable / Prepaid',
    icon: CreditCard,
    desc: 'Send a gift the recipient claims later',
  },
  {
    id: 'appreciation',
    label: 'Appreciation Gifts',
    icon: Heart,
    desc: 'Thank teachers, mentors, coworkers, friends',
  },
  {
    id: 'hobby',
    label: 'Hobby & Interest Gifts',
    icon: Gamepad2,
    desc: 'For gamers, artists, sports fans, music lovers',
  },
  {
    id: 'project',
    label: 'Gift for Projects',
    icon: Briefcase,
    desc: "Support someone's creative or personal project",
  },
  {
    id: 'support',
    label: 'Support & Care Gifts',
    icon: Sun,
    desc: 'Get well soon, encouragement, tough times',
  },
  {
    id: 'holiday',
    label: 'Holiday & Seasonal Gifts',
    icon: Calendar,
    desc: "Christmas, Valentine's Day, Easter, Thanksgiving",
  },
];

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
        {categories.map(c => (
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
