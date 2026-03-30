'use client';

import Link from 'next/link';

// Mock campaign data
const campaign = {
  slug: 'happy-birthday-madama-kiki',
  title: 'Happy birthday madama kiki',
  category: 'Birthday Celebration',
  isVerified: true,
  raised: 2000,
  goal: 40000,
  currency: 'GH₵',
  contributors: 3,
  daysLeft: 10,
  organizer: {
    name: 'Eunice Baiden',
    avatar: '/images/organizer.jpg',
  },
  story: [
    'We are coming together to celebrate the incredible life and spirit of Madama Kiki. As she marks another beautiful year, we want to surprise her with a gift that reflects the warmth and kindness she has shown everyone in our community.',
    "This campaign is more than just a fundraiser; it's a collective \"thank you\" to a woman who has been a pillar of support for so many. The funds raised will go towards a curated gift experience that Madama Kiki has always dreamed of but never permitted herself to indulge in.",
    'Every contribution, no matter the size, is a note in the symphony of our appreciation for her.',
  ],
  recentContributions: [
    {
      name: 'Kojo Mensah',
      avatar: '/images/donor-1.jpg',
      amount: 500,
      time: '2 hours ago',
    },
    {
      name: 'Abena Osei',
      avatar: '/images/donor-2.jpg',
      amount: 1000,
      time: '5 hours ago',
    },
    {
      name: 'Anonymous',
      avatar: null,
      amount: 500,
      time: 'Yesterday',
    },
  ],
};

function formatCurrency(amount: number, currency: string) {
  return `${currency}${(amount / 100).toLocaleString()}`;
}

export default function CampaignDetailsPage() {
  const progress = Math.round((campaign.raised / campaign.goal) * 100);

  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav shadow-sm">
        <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
          <Link
            href="/v2"
            className="text-2xl font-black text-[var(--v2-on-surface)] v2-headline tracking-tight"
          >
            The Warm Curator
          </Link>
          <div className="flex items-center space-x-8 v2-headline font-bold tracking-tight">
            <Link
              href="/v2/campaigns"
              className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1"
            >
              Explore
            </Link>
            <Link
              href="/v2/campaigns"
              className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/v2/about"
              className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
            >
              About
            </Link>
            <Link
              href="/v2/impact"
              className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors"
            >
              Impact
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <button className="v2-icon text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">
              notifications
            </button>
            <div className="h-10 w-10 rounded-full bg-[var(--v2-surface-container-high)] flex items-center justify-center">
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                person
              </span>
            </div>
            <Link
              href="/v2/send-gift"
              className="v2-btn-primary px-6 py-2.5 rounded-xl v2-headline scale-95 active:scale-90 transition-transform"
            >
              Start a Gift
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16">
        <Link href="/v2/campaigns">
          <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
        </Link>
        <h1 className="v2-headline font-bold text-lg">Campaign Details</h1>
        <button>
          <span className="v2-icon text-[var(--v2-primary)]">share</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-24 pb-32 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Hero & Story Content (Left Column) */}
            <div className="lg:col-span-8 space-y-6 md:space-y-10">
              {/* Mobile Hero Image */}
              <div className="md:hidden relative h-[397px] w-full overflow-hidden -mx-4">
                <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                  <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
                    celebration
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-surface)] via-transparent to-transparent" />
              </div>

              {/* Desktop Hero Image */}
              <div className="hidden md:block relative group">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-[2rem] bg-[var(--v2-surface-container-low)]">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                    <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
                      celebration
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Floating Progress Card */}
              <div className="md:hidden px-2 -mt-24 relative z-10">
                <div className="bg-[var(--v2-surface-container-lowest)] rounded-xl p-6 shadow-[0_20px_40px_rgba(73,38,4,0.06)]">
                  <div className="flex justify-between items-end mb-4">
                    <div className="space-y-1">
                      <span className="text-sm text-[var(--v2-on-surface-variant)]">
                        Raised so far
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl v2-headline font-bold text-[var(--v2-primary)]">
                          {formatCurrency(campaign.raised, campaign.currency)}
                        </span>
                        <span className="text-sm text-[var(--v2-on-surface-variant)]">
                          of {formatCurrency(campaign.goal, campaign.currency)}{' '}
                          goal
                        </span>
                      </div>
                    </div>
                    <div className="bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] px-3 py-1 rounded-full text-[12px] font-bold">
                      {progress}% Funded
                    </div>
                  </div>

                  <div className="w-full h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full v2-gradient-primary rounded-full"
                      style={{width: `${progress}%`}}
                    />
                  </div>

                  <div className="flex justify-between items-center py-2 border-t border-[var(--v2-outline-variant)]/10">
                    <div className="flex flex-col">
                      <span className="text-lg v2-headline font-bold text-[var(--v2-on-surface)]">
                        {campaign.contributors}
                      </span>
                      <span className="text-xs text-[var(--v2-on-surface-variant)]">
                        Contributors
                      </span>
                    </div>
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--v2-surface-container-lowest)] bg-[var(--v2-surface-container)] flex items-center justify-center">
                        <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">
                          person
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--v2-surface-container-lowest)] bg-[var(--v2-surface-container)] flex items-center justify-center">
                        <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">
                          person
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-[var(--v2-surface-container-lowest)] bg-[var(--v2-surface-container-high)] flex items-center justify-center text-[10px] font-bold text-[var(--v2-on-surface-variant)]">
                        +{campaign.contributors}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg v2-headline font-bold text-[var(--v2-on-surface)]">
                        {campaign.daysLeft}
                      </span>
                      <span className="text-xs text-[var(--v2-on-surface-variant)]">
                        Days left
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and Meta - Desktop */}
              <div className="hidden md:block space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] rounded-full text-xs font-bold tracking-wider uppercase">
                    {campaign.category}
                  </span>
                  {campaign.isVerified && (
                    <span className="text-[var(--v2-on-surface-variant)] text-sm font-medium flex items-center gap-1.5">
                      <span className="v2-icon text-base">verified</span>{' '}
                      Verified Campaign
                    </span>
                  )}
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold v2-headline tracking-tight leading-[1.1] text-[var(--v2-on-surface)]">
                  {campaign.title}
                </h1>
              </div>

              {/* Story Section */}
              <section className="px-2 md:px-0">
                <h2 className="text-xl md:text-2xl font-bold v2-headline mb-4">
                  {/* Mobile */}
                  <span className="md:hidden">The Story</span>
                  {/* Desktop */}
                  <span className="hidden md:inline">The Campaign Story</span>
                </h2>

                {/* Mobile Story */}
                <div className="md:hidden bg-[var(--v2-surface-container-low)] rounded-xl p-5">
                  <p className="text-[var(--v2-on-surface-variant)] leading-relaxed">
                    We are raising funds to provide essential educational
                    materials for the children at the Grace Community School.
                    Your contribution helps us purchase books, stationary, and
                    basic tech tools that will open up a world of possibilities
                    for over 200 students.
                  </p>
                  <button className="mt-4 text-[var(--v2-primary)] font-bold flex items-center gap-1 hover:underline">
                    Read full story
                    <span className="v2-icon text-sm">keyboard_arrow_down</span>
                  </button>
                </div>

                {/* Desktop Story */}
                <div className="hidden md:block bg-[var(--v2-surface-container-lowest)] p-8 md:p-12 rounded-[2rem] space-y-4">
                  {campaign.story.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-lg leading-relaxed text-[var(--v2-on-surface-variant)]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>

              {/* Recent Activity/Contributions */}
              <section className="px-2 md:px-0">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold v2-headline">
                    {/* Mobile */}
                    <span className="md:hidden">Recent Activity</span>
                    {/* Desktop */}
                    <span className="hidden md:inline">
                      Recent Contributions
                    </span>
                  </h2>
                  <button className="text-[var(--v2-primary)] font-bold hover:underline">
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {campaign.recentContributions.map((contribution, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[var(--v2-surface-container-lowest)] md:bg-[var(--v2-surface-container-low)] rounded-xl md:rounded-2xl hover:bg-[var(--v2-surface-container)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--v2-surface-container)] flex items-center justify-center">
                          {contribution.avatar ? (
                            <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                              person
                            </span>
                          ) : (
                            <span
                              className="v2-icon-filled text-[var(--v2-on-surface-variant)]"
                              style={{fontVariationSettings: "'FILL' 1"}}
                            >
                              person
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--v2-on-surface)]">
                            {contribution.name}
                          </p>
                          <p className="text-xs text-[var(--v2-on-surface-variant)]">
                            {contribution.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg v2-headline font-bold text-[var(--v2-primary)] md:text-[var(--v2-on-surface)]">
                          {formatCurrency(
                            contribution.amount,
                            campaign.currency
                          )}
                        </p>
                        <p className="hidden md:block text-[10px] text-[var(--v2-on-surface-variant)] font-bold uppercase tracking-wider">
                          GIFTED
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mobile Verified Card */}
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
                      By Gifthance Trust Safety Team
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Funding Sidebar (Right Column) - Desktop Only */}
            <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-6">
              <div className="bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(73,38,4,0.04)] ring-1 ring-[var(--v2-outline-variant)]/10">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black v2-headline text-[var(--v2-on-surface)]">
                        {formatCurrency(campaign.raised, campaign.currency)}
                      </span>
                      <span className="text-[var(--v2-on-surface-variant)] font-medium">
                        raised of{' '}
                        {formatCurrency(campaign.goal, campaign.currency)} goal
                      </span>
                    </div>
                    <div className="mt-4 w-full h-3 bg-[var(--v2-surface-container-low)] rounded-full overflow-hidden">
                      <div
                        className="h-full v2-gradient-primary"
                        style={{width: `${progress}%`}}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--v2-surface-container-low)] p-5 rounded-2xl">
                      <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-wider">
                        Contributors
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {campaign.contributors}
                      </p>
                    </div>
                    <div className="bg-[var(--v2-surface-container-low)] p-5 rounded-2xl">
                      <p className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-wider">
                        Days Left
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {campaign.daysLeft}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button className="w-full v2-btn-primary py-5 rounded-2xl v2-headline font-extrabold text-xl shadow-lg shadow-[var(--v2-primary)]/20 hover:shadow-xl hover:shadow-[var(--v2-primary)]/30 active:scale-[0.98] transition-all">
                      Send a Gift
                    </button>
                    <button className="w-full bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] py-5 rounded-2xl v2-headline font-bold text-lg hover:bg-[var(--v2-surface-variant)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      <span className="v2-icon">share</span> Share Campaign
                    </button>
                  </div>

                  <div className="pt-6 border-t border-[var(--v2-outline-variant)]/10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--v2-secondary-container)] rounded-xl">
                        <span
                          className="v2-icon text-[var(--v2-on-secondary-container)]"
                          style={{fontVariationSettings: "'FILL' 1"}}
                        >
                          favorite
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--v2-on-surface)]">
                          100% of proceeds go to the recipient
                        </p>
                        <p className="text-xs text-[var(--v2-on-surface-variant)]">
                          The Warm Curator does not take platform fees.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className="bg-[var(--v2-surface-container-low)] rounded-[2rem] p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center">
                  <span className="v2-icon text-[var(--v2-on-surface-variant)]">
                    person
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest">
                    Organizer
                  </p>
                  <p className="font-bold text-[var(--v2-on-surface)]">
                    {campaign.organizer.name}
                  </p>
                </div>
                <button className="ml-auto p-2 hover:bg-[var(--v2-surface-container)] transition-colors rounded-full">
                  <span className="v2-icon text-[var(--v2-primary)]">mail</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block w-full rounded-t-[2rem] mt-20 bg-[var(--v2-surface-container-low)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-7xl mx-auto text-sm leading-relaxed">
          <div className="space-y-6">
            <div className="text-xl font-bold text-[var(--v2-on-surface)]">
              The Warm Curator
            </div>
            <p className="text-[var(--v2-on-surface-variant)]">
              Transforming collective giving into meaningful, curated
              experiences that celebrate human connection.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[var(--v2-on-surface)]">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/v2/campaigns"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  Impact Stories
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[var(--v2-on-surface)]">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-[var(--v2-on-surface-variant)] hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold text-[var(--v2-on-surface)]">
              Stay Connected
            </h4>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all cursor-pointer">
                <span className="v2-icon">share</span>
              </div>
            </div>
            <p className="text-xs text-[var(--v2-on-surface-variant)]">
              © 2024 The Warm Curator. Crafted with intention.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Action */}
      <div className="md:hidden fixed bottom-0 left-0 w-full px-6 pb-safe pt-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl z-40">
        <button className="w-full h-14 v2-btn-primary rounded-xl v2-headline font-bold text-lg flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(150,67,0,0.25)] active:scale-95 transition-transform">
          <span
            className="v2-icon"
            style={{fontVariationSettings: "'FILL' 1"}}
          >
            card_giftcard
          </span>
          Send a Gift
        </button>
      </div>
    </div>
  );
}
