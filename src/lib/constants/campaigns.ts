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

export const CAMPAIGN_CATEGORIES = [
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
] as const;

export const CAMPAIGN_CATEGORY_IDS = [
  'all',
  ...CAMPAIGN_CATEGORIES.map(c => c.id),
] as const;

export type CampaignCategory = (typeof CAMPAIGN_CATEGORY_IDS)[number];
