'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {createClient} from '@/lib/server/supabase/client';

// Mock campaign data
const campaigns = [
  {
    slug: 'happy-birthday-madama-kiki',
    title: 'Happy birthday madama kiki',
    description:
      "Let's make this 60th milestone unforgettable with the professional culinary set she's always dreamed of...",
    category: 'Public',
    image: '/images/campaign-birthday.jpg',
    raised: 2000,
    goal: 40000,
    currency: 'GH₵',
    daysLeft: 10,
    organizer: {name: 'Araba Mensah', initials: 'AM'},
    contributors: 8,
  },
  {
    slug: 'graduation-fund-for-kofi',
    title: 'Graduation Fund for Kofi',
    description:
      'Helping our brightest student secure his laptop for his engineering journey ahead at the university.',
    category: 'Community',
    image: '/images/campaign-graduation.jpg',
    raised: 360000,
    goal: 500000,
    currency: 'GH₵',
    daysLeft: 3,
    organizer: {name: 'John Appiah', initials: 'JA'},
    contributors: 24,
  },
  {
    slug: 'sisters-dream-guitar',
    title: "Sister's Dream Guitar",
    description:
      "My sister has been playing the same worn-out guitar for 10 years. Let's get her that Taylor acoustic.",
    category: 'Personal',
    image: '/images/campaign-guitar.jpg',
    raised: 54000,
    goal: 120000,
    currency: 'GH₵',
    daysLeft: 15,
    organizer: {name: 'Efua Yeboah', initials: 'EY'},
    contributors: 12,
  },
];

const mobileCampaigns = [
  {
    slug: 'empowering-future-scholars',
    title: 'Empowering Future Scholars',
    category: 'EDUCATION',
    image: '/images/campaign-education.jpg',
    raised: 2050000,
    goal: 2500000,
    currency: '$',
    daysLeft: 12,
    donors: 412,
  },
  {
    slug: 'greening-urban-canvas',
    title: 'Greening the Urban Canvas',
    category: 'ENVIRONMENT',
    image: '/images/campaign-garden.jpg',
    raised: 540000,
    goal: 1200000,
    currency: '$',
    daysLeft: 24,
    donors: 128,
  },
  {
    slug: 'winter-food-warmth-drive',
    title: 'Winter Food & Warmth Drive',
    category: 'RELIEF',
    image: '/images/campaign-relief.jpg',
    raised: 810000,
    goal: 850000,
    currency: '$',
    daysLeft: 3,
    donors: 305,
  },
];

const categories = [
  'All',
  'Personal',
  'Group',
  'Corporate',
  'Education',
  'Relief',
];

function formatCurrency(amount: number, currency: string) {
  return `${currency}${(amount / 100).toLocaleString()}`;
}

function formatCurrencyShort(amount: number, currency: string) {
  if (amount >= 100000) {
    return `${currency}${(amount / 100000).toFixed(1)}k`;
  }
  return `${currency}${(amount / 100).toLocaleString()}`;
}

function CampaignCard({campaign}: {campaign: (typeof campaigns)[0]}) {
  const progress = Math.round((campaign.raised / campaign.goal) * 100);

  return (
    <Link href={`/v2/campaigns/${campaign.slug}`}>
      <article className="bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="relative h-64 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
              campaign
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-[var(--v2-primary)]">
              {campaign.category}
            </span>
          </div>
        </div>
        <div className="p-8">
          <h3 className="text-2xl font-bold v2-headline mb-3 text-[var(--v2-on-surface)] group-hover:text-[var(--v2-primary)] transition-colors">
            {campaign.title}
          </h3>
          <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 mb-6 text-sm leading-relaxed italic font-medium">
            {campaign.description}
          </p>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[var(--v2-primary)]">{progress}% raised</span>
              <span className="text-[var(--v2-on-surface-variant)]">
                Goal: {formatCurrency(campaign.goal, campaign.currency)}
              </span>
            </div>
            <div className="h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
              <div
                className="h-full v2-gradient-primary rounded-full"
                style={{width: `${progress}%`}}
              />
            </div>
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--v2-surface-container)]">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                  Raised
                </span>
                <span className="text-lg font-black text-[var(--v2-on-surface)]">
                  {formatCurrency(campaign.raised, campaign.currency)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-tighter">
                  Time Left
                </span>
                <span className="text-lg font-black text-[var(--v2-on-surface)]">
                  {campaign.daysLeft} days
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <div className="w-8 h-8 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)] font-bold text-xs uppercase">
                {campaign.organizer.initials}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--v2-on-surface-variant)] uppercase font-bold tracking-widest">
                  By
                </span>
                <span className="text-sm font-bold text-[var(--v2-on-surface)]">
                  {campaign.organizer.name}
                </span>
              </div>
              <div className="ml-auto flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-200" />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-300" />
                <div className="w-6 h-6 rounded-full border-2 border-white bg-orange-100 flex items-center justify-center text-[8px] font-bold">
                  +{campaign.contributors}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function MobileCampaignCard({
  campaign,
}: {
  campaign: (typeof mobileCampaigns)[0];
}) {
  const progress = Math.round((campaign.raised / campaign.goal) * 100);

  return (
    <Link href={`/v2/campaigns/${campaign.slug}`}>
      <article className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(73,38,4,0.05)] flex flex-col group">
        <div className="relative h-56 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
              campaign
            </span>
          </div>
          <div className="absolute top-4 left-4">
            <span className="bg-[var(--v2-primary)]/90 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase backdrop-blur-sm">
              {campaign.category}
            </span>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <h3 className="text-xl font-bold v2-headline text-[var(--v2-on-surface)] leading-tight">
              {campaign.title}
            </h3>
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-wider">
                Raised of {formatCurrency(campaign.goal, campaign.currency)}
              </span>
              <span className="text-lg font-black text-[var(--v2-primary)]">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-[var(--v2-surface-container-low)] h-2.5 rounded-full overflow-hidden">
              <div
                className="v2-gradient-primary h-full rounded-full"
                style={{width: `${progress}%`}}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 border-t border-[var(--v2-outline-variant)]/10 pt-5">
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                Raised
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {formatCurrencyShort(campaign.raised, campaign.currency)}
              </p>
            </div>
            <div className="text-center border-x border-[var(--v2-outline-variant)]/10">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                Donors
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {campaign.donors}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-tighter">
                Days Left
              </p>
              <p className="text-sm font-extrabold text-[var(--v2-on-surface)]">
                {campaign.daysLeft}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function CampaignsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<'all' | 'trending' | 'recent'>('all');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {data: {user}} = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <Link href="/v2" className="text-2xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline">
              Gifthance
            </Link>
            <div className="flex items-center gap-8 text-sm font-semibold">
              <Link href="/v2/gift-shop" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
                Gift Shop
              </Link>
              <Link href="/v2/campaigns" className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1">
                Campaigns
              </Link>
              <Link href="/v2/send-gift" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
                Send Gift
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/v2/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 transition-opacity">
                <span className="v2-icon text-2xl">account_circle</span>
              </Link>
            ) : (
              <Link href="/v2/login" className="text-[var(--v2-primary)] font-semibold hover:text-[var(--v2-primary-dim)] transition-colors">
                Login
              </Link>
            )}
            <Link
              href="/v2/create-campaign"
              className="v2-btn-primary px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform active:scale-95"
            >
              Start Campaign
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <nav className="md:hidden fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center h-14 px-4">
          <Link href="/v2" className="text-xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline">
            Gifthance
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] rounded-full transition-colors"
            >
              <span className="v2-icon">search</span>
            </button>
            {isLoggedIn ? (
              <Link href="/v2/dashboard" className="p-2 text-[var(--v2-primary)]">
                <span className="v2-icon">account_circle</span>
              </Link>
            ) : (
              <Link href="/v2/login" className="px-4 py-2 text-[var(--v2-primary)] font-semibold text-sm">
                Login
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-low)] rounded-full transition-colors"
            >
              <span className="v2-icon">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearchOpen && (
          <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
            <div className="relative">
              <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/60">search</span>
              <input
                className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-1 focus:ring-[var(--v2-primary)]/30 placeholder:text-[var(--v2-on-surface-variant)]/50"
                placeholder="Search campaigns..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
            <div className="flex flex-col gap-1 py-2">
              <Link href="/v2/gift-shop" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
                Gift Shop
              </Link>
              <Link href="/v2/campaigns" className="px-4 py-3 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-semibold">
                Campaigns
              </Link>
              <Link href="/v2/send-gift" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
                Send Gift
              </Link>
              <div className="border-t border-[var(--v2-outline-variant)]/10 my-2"></div>
              <Link href="/v2/create-campaign" className="px-4 py-3 rounded-xl v2-gradient-primary text-white font-semibold text-center">
                Start Campaign
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20 md:pt-32 pb-24 md:pb-16 px-4 md:px-8 max-w-screen-2xl mx-auto">
        {/* Desktop Header */}
        <header className="hidden md:block mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)] mb-4">
                Public Campaigns
              </h1>
              <p className="text-xl text-[var(--v2-on-surface-variant)] leading-relaxed">
                Browse and contribute to gift campaigns from the community.
                Support moments that matter.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[var(--v2-surface-container-low)] rounded-xl px-4 py-3 flex items-center gap-3 w-80 shadow-inner">
                <span className="v2-icon text-[var(--v2-outline)]">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-[var(--v2-on-surface)] placeholder:text-[var(--v2-outline)] w-full font-medium"
                  placeholder="Search campaigns..."
                  type="text"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Category Tabs */}
        <section className="md:hidden flex overflow-x-auto v2-no-scrollbar -mx-4 px-4 gap-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                activeCategory === category
                  ? 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)] shadow-sm'
                  : 'bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
              }`}
            >
              {category}
            </button>
          ))}
        </section>

        {/* Mobile Page Header */}
        <section className="md:hidden space-y-1 mb-6">
          <h2 className="text-3xl font-extrabold v2-headline tracking-tight text-[var(--v2-on-surface)]">
            Active Campaigns
          </h2>
          <p className="text-[var(--v2-on-surface-variant)] text-sm font-medium">
            Empower impactful gifts today
          </p>
        </section>

        {/* Desktop Filters */}
        <section className="hidden md:flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex gap-3">
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 bg-[var(--v2-surface-container-lowest)] px-5 py-3 rounded-full font-semibold text-[var(--v2-on-surface)] shadow-sm hover:bg-[var(--v2-surface-container-low)] transition-colors"
              >
                {activeCategory === 'All' ? 'All Categories' : activeCategory}
                <span className={`v2-icon text-sm transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-[var(--v2-surface-container-lowest)] rounded-2xl shadow-xl border border-[var(--v2-outline-variant)]/10 py-2 min-w-[180px] z-50">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setActiveCategory(category);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left font-medium transition-colors ${
                        activeCategory === category
                          ? 'bg-[var(--v2-primary)]/10 text-[var(--v2-primary)]'
                          : 'text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveSort('trending')}
              className={`px-5 py-3 rounded-full font-semibold transition-colors ${
                activeSort === 'trending'
                  ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveSort('recent')}
              className={`px-5 py-3 rounded-full font-semibold transition-colors ${
                activeSort === 'recent'
                  ? 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-lowest)] text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)]'
              }`}
            >
              Recent
            </button>
          </div>
          <Link
            href="/v2/create-campaign"
            className="flex items-center gap-2 bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] px-6 py-3 rounded-full font-bold hover:bg-[var(--v2-secondary-fixed)] transition-colors"
          >
            <span className="v2-icon">add</span>
            Create
          </Link>
        </section>

        {/* Desktop Campaign Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.slug} campaign={campaign} />
          ))}
        </div>

        {/* Mobile Campaign List */}
        <div className="md:hidden grid grid-cols-1 gap-6">
          {mobileCampaigns.map((campaign) => (
            <MobileCampaignCard key={campaign.slug} campaign={campaign} />
          ))}
        </div>

        {/* Desktop Empty State / CTA */}
        <div className="hidden md:flex mt-20 flex-col items-center justify-center text-center p-12 bg-[var(--v2-surface-container-low)] rounded-[3rem] border-2 border-dashed border-[var(--v2-outline-variant)]/30">
          <span className="v2-icon text-6xl text-[var(--v2-primary-container)] mb-4">
            volunteer_activism
          </span>
          <h4 className="text-2xl v2-headline font-bold mb-2">
            Can&apos;t find what you&apos;re looking for?
          </h4>
          <p className="text-[var(--v2-on-surface-variant)] mb-8 max-w-md">
            The most meaningful gifts are those started with intention.
          </p>
          <Link
            href="/v2/campaigns/create"
            className="bg-[var(--v2-primary)] text-[var(--v2-on-primary)] px-8 py-4 rounded-2xl font-bold v2-headline shadow-lg hover:shadow-[var(--v2-primary)]/20 transition-shadow"
          >
            Start a New Campaign
          </Link>
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block bg-[var(--v2-surface-container-low)] py-20 px-8 border-t border-[var(--v2-surface-container)] mt-12">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1">
            <div className="text-2xl font-black text-[var(--v2-primary)] mb-6 tracking-tight v2-headline">
              Gifthance
            </div>
            <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6">
              Redefining community gifting through collective impact and shared
              joy. Every gift tells a story.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all cursor-pointer">
                <span className="v2-icon text-lg">public</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all cursor-pointer">
                <span className="v2-icon text-lg">mail</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-bold text-[var(--v2-on-surface)] mb-6 uppercase tracking-widest text-xs">
              Explore
            </h5>
            <ul className="space-y-4 text-[var(--v2-on-surface-variant)] text-sm font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Success Stories
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Gift Guides
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-[var(--v2-on-surface)] mb-6 uppercase tracking-widest text-xs">
              Support
            </h5>
            <ul className="space-y-4 text-[var(--v2-on-surface-variant)] text-sm font-medium">
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-[var(--v2-primary)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="bg-[var(--v2-surface-container-highest)] p-8 rounded-3xl">
            <h5 className="font-bold text-[var(--v2-on-surface)] mb-4">
              Join our newsletter
            </h5>
            <p className="text-[var(--v2-on-surface-variant)] text-xs mb-6 font-medium">
              Get updates on the most impactful campaigns directly in your
              inbox.
            </p>
            <div className="flex gap-2">
              <input
                className="bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-[var(--v2-primary)] w-full shadow-sm"
                placeholder="Email"
                type="email"
              />
              <button className="bg-[var(--v2-primary)] text-[var(--v2-on-primary)] p-2 rounded-xl">
                <span className="v2-icon">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto pt-12 mt-12 border-t border-[var(--v2-surface-container)] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-[var(--v2-on-surface-variant)] font-medium">
            © 2024 Gifthance Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-bold text-[var(--v2-outline-variant)] uppercase tracking-widest">
            <span className="hover:text-[var(--v2-primary)] transition-colors cursor-pointer">
              English (US)
            </span>
            <span className="hover:text-[var(--v2-primary)] transition-colors cursor-pointer">
              GH₵ GHS
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile FAB */}
      {/* Mobile FAB - position changes based on login state */}
      <Link
        href="/v2/campaigns/create"
        className="md:hidden fixed right-6 bottom-6 v2-btn-primary p-4 rounded-2xl shadow-xl z-40 active:scale-95 transition-transform"
      >
        <span className="v2-icon text-2xl" style={{fontWeight: 700}}>
          add
        </span>
      </Link>
    </div>
  );
}
