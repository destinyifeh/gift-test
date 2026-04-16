'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {authClient} from '@/lib/auth-client';
import {GifthanceLogo} from '@/components/GifthanceLogo';
import {getTopCampaignsByAmountRaised} from '@/lib/server/actions/campaigns';
import {formatCurrency} from '@/lib/utils/currency';

// Category data
const categories = [
  {
    name: 'Birthdays',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr8UZFtbEd6Asoa7lb636-mn7fAmCLFCyEwORUU1bypxLuRSCSZdPn-SkJh4rwldVD9m_eil9Le-k4bGjXbxIMoy2Ocj6lypSODVMe7cfGsQdmnp4QH_ePN3E1plIVe42DsHMRTAIduoMYQLXJcNq0jRvHOcR49ONN8poyNKsvAm972EhtRtS__3mmJyLcYkfFa2p0p2-TwmQbUlc7uD3euQ2L5Bz6QbeLCUCWJ-bj7bWSZD1bKNzLunwnmkXCYjHoNTyTNYkx9GA',
  },
  {
    name: 'Weddings',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE8qWwKJrhWaT2608XVDdG9MtwU6WM6v1aHO09aPgQRlNMOM-sEulfbelStV8HgB7A7wbG3hDXIll4CcL_LeB9VadePEMsIPVXllPPWxbHKEjLSjNlBJbcaQ5IJZA5MKQOz2THp0foS2OK3KWZKYZDN-tDbOVSZX7apuQ9d9kQG2kZ7oUTwZSe_r0xOqmoYo1kVAG26F3q2gJEVGhDA4TT2Vg6AR_jix4JKGizXRyDG_7RSgtklcmkbvpmQO5yL3yPCD4yafpD-tU',
  },
  {
    name: 'Baby Shower',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm1v5IXQLh7CRjiff5tCaMt4G4vFLB80a6HTvPyxvHV1GsRqWEEKuZT2RGFxf0F99F_Fh3gGon9cVS7K_Jx8h0wyrVcy8fbDyOI1InFnczepiH0NcmRolFbVQSXwb28Dt282VKnvDYSY6XZAQuovO7PYk_2ZvvjLJqJcpDuyKtEjH8AXvwQQNIHmQVHnzgaxEnyLVxG7Uh0O9tBwWo7JMoc9keUdp9WR9U5KGQdqR5YFzFaEOnu5qy_LdcvTxPYv8ztN8uEG2tJzk',
  },
  {
    name: 'Anniversary',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsuNY-2hQlHecaHe6hL8ZKTrp5BdnpzufwBGGKTNHXqhhOF2adupaiSTCDW2fybxWYFTmrw_MM6-5lhI2C7ZIs7ldbcWpsviXm9Z9Nm1qNQB-4oCj62tPo1uLcOz5DLUNkJ-VxyreWtyQOgKP-8UgWz84thmL9U4bTEDr2xeksp3pwQvI6zEzz8tKDr3RSWSW1Hsr7l97h5RIr83YcfhxNB5-AShXN60uFKBvrL-4EKXlTpWyx1x0wtAltAvzGBjzEVhuJBGfQIz0',
  },
];


// FAQ data
const faqs = [
  {
    q: 'How secure are the payments?',
    a: 'We use bank-level encryption and partner with industry-leading payment processors to ensure your data and transactions are 100% secure.',
  },
  {
    q: 'Can I send gifts internationally?',
    a: 'Yes, Gifthance supports international shipping and multi-currency contributions for campaigns. Fees may vary based on location.',
  },
  {
    q: "What happens if a campaign doesn't reach its goal?",
    a: "Campaign creators can choose between 'All or Nothing' or 'Flex' funding. In 'Flex' funding, the amount raised is still used for the intended cause.",
  },
];

export default function V2LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [topCampaigns, setTopCampaigns] = useState<any[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Fetch top campaigns by amount raised
  useEffect(() => {
    async function fetchTopCampaigns() {
      const result = await getTopCampaignsByAmountRaised(6);
      if (result.success && result.data) {
        setTopCampaigns(result.data);
      }
      setLoadingCampaigns(false);
    }
    fetchTopCampaigns();
  }, []);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Show loading while checking auth
  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--v2-background)] flex items-center justify-center">
        <span className="v2-icon text-4xl text-[var(--v2-primary)] animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation - Desktop */}
      <nav className="fixed top-0 w-full z-50 v2-glass-nav hidden md:block">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <GifthanceLogo size="md" />
          <div className="flex items-center gap-8">
            <Link href="/gift-shop" className="text-orange-800/70 hover:text-orange-600 transition-colors duration-300">
              Gift Shop
            </Link>
            <Link href="/campaigns" className="text-orange-800/70 hover:text-orange-600 transition-colors duration-300">
              Campaigns
            </Link>
            <Link href="/send-gift" className="text-orange-800/70 hover:text-orange-600 transition-colors duration-300">
              Send Gift
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2 text-[var(--v2-primary)] font-semibold hover:text-orange-600 transition-all">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-2.5 v2-gradient-primary text-[var(--v2-on-primary)] rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-[var(--v2-primary)]/10">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Navigation - Mobile */}
      <header className="fixed top-0 w-full z-50 bg-[var(--v2-background)]/80 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--v2-surface-container-low)] active:scale-95 transition-all"
            >
              <span className="v2-icon text-[var(--v2-primary)]">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
            <GifthanceLogo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--v2-surface-container-low)] active:scale-95 transition-all"
            >
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">search</span>
            </button>
            <Link
              href="/gift-shop"
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--v2-surface-container-low)] active:scale-95 transition-all"
            >
              <span className="v2-icon text-[var(--v2-on-surface-variant)]">shopping_bag</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[var(--v2-surface)] border-b border-[var(--v2-outline-variant)]/10 shadow-lg p-4 space-y-2">
            <Link
              href="/gift-shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              <span className="v2-icon text-[var(--v2-primary)]">storefront</span>
              <span className="font-medium text-[var(--v2-on-surface)]">Gift Shop</span>
            </Link>
            <Link
              href="/campaigns"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              <span className="v2-icon text-[var(--v2-primary)]">campaign</span>
              <span className="font-medium text-[var(--v2-on-surface)]">Campaigns</span>
            </Link>
            <Link
              href="/send-gift"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
            >
              <span className="v2-icon text-[var(--v2-primary)]">send</span>
              <span className="font-medium text-[var(--v2-on-surface)]">Send Gift</span>
            </Link>
            <div className="border-t border-[var(--v2-outline-variant)]/10 pt-2 mt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--v2-surface-container-low)] transition-colors"
              >
                <span className="v2-icon text-[var(--v2-on-surface-variant)]">login</span>
                <span className="font-medium text-[var(--v2-on-surface)]">Login</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--v2-primary)]/10 transition-colors"
              >
                <span className="v2-icon text-[var(--v2-primary)]">person_add</span>
                <span className="font-bold text-[var(--v2-primary)]">Sign Up</span>
              </Link>
            </div>
          </div>
        )}

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="absolute top-16 left-0 right-0 bg-[var(--v2-surface)] border-b border-[var(--v2-outline-variant)]/10 shadow-lg p-4">
            <div className="relative">
              <span className="v2-icon absolute left-4 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]">search</span>
              <input
                type="text"
                placeholder="Search gifts, campaigns..."
                autoFocus
                className="w-full h-12 pl-12 pr-4 bg-[var(--v2-surface-container-low)] border-none rounded-xl text-[var(--v2-on-surface)] focus:ring-2 focus:ring-[var(--v2-primary)]/20 transition-all"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
              >
                <span className="v2-icon text-sm text-[var(--v2-on-surface-variant)]">close</span>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16 md:pt-24 overflow-x-hidden">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] rounded-full text-xs md:text-sm font-bold tracking-wide uppercase">
              <span className="v2-icon text-sm" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
              Enhancing the joy of giving
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-7xl v2-headline font-extrabold leading-[1.1] text-[var(--v2-on-background)] tracking-tight">
              Gift and support the people you care about
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-[var(--v2-on-surface-variant)] max-w-lg leading-relaxed">
              Send gifts or support what matters. From special moments to group campaigns, make every contribution count.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-2 md:pt-4">
              <Link href="/gift-shop" className="px-8 py-4 v2-gradient-primary text-[var(--v2-on-primary)] rounded-xl font-bold text-base md:text-lg active:scale-95 transition-all shadow-xl shadow-[var(--v2-primary)]/20 flex items-center justify-center gap-2 v2-headline">
                Send a Gift
                <span className="v2-icon">arrow_forward</span>
              </Link>
              <Link href="/campaigns" className="px-8 py-4 bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] rounded-xl font-bold text-base md:text-lg active:scale-95 transition-all v2-headline text-center">
                Start a Campaign
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-[var(--v2-primary-container)]/20 rounded-3xl blur-3xl group-hover:bg-[var(--v2-primary-container)]/30 transition-all duration-700 hidden md:block"></div>
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl transform md:rotate-1 md:group-hover:rotate-0 transition-transform duration-500">
              <img
                alt="Gift box with warm lighting"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxFyY_bZDNqEP5bqEIqbZAoyKxbCQIwTUkRUeUw8mhYBOwJ6B9Q7p7WEiXDC0OlSjFO0SgUJqGxFMQD9vatGSDFWVk4Zk3Rh3pn7Bn3jdkj3ezeSQW5XAeBPk_TXJ09fnd_hJs_15rphoNJ_cScjxVkLKjVi4grh0thHIQx474LN7JkqqxUdWdwbbRwnDYKEXXWCkP5mLINzUY3wrKFJ_KVMsrlXHnb_66DQk8EMCWk2VgZgamhUr3dwp7Dlqoy_YfFbbAB2kPXdE"
              />
              {/* Overlay Card - Mobile */}
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 md:hidden">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-[var(--v2-primary-container)] flex items-center justify-center">
                    <span className="v2-icon text-[var(--v2-on-primary-container)]" style={{fontVariationSettings: "'FILL' 1"}}>volunteer_activism</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-xs uppercase tracking-widest">Trusted by</p>
                    <p className="v2-headline font-bold text-white text-sm">10,000+ happy gifters</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Overlay Card - Desktop */}
            <div className="absolute -bottom-6 -left-6 bg-white/20 backdrop-blur-xl p-6 rounded-2xl shadow-xl hidden md:flex items-center gap-4 border border-white/30">
              <div className="w-12 h-12 rounded-full bg-[var(--v2-primary-container)] flex items-center justify-center text-[var(--v2-on-primary-container)]">
                <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>volunteer_activism</span>
              </div>
              <div>
                <div className="text-sm text-white/80 uppercase tracking-widest">Trusted by</div>
                <div className="text-xl v2-headline font-bold text-white">10,000+ happy gifters</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="bg-[var(--v2-surface-container-low)] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex justify-between items-end mb-8 md:mb-12">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl lg:text-4xl v2-headline font-extrabold text-[var(--v2-on-background)]">A gift for every occasion</h2>
                <p className="text-[var(--v2-on-surface-variant)] text-sm md:text-base">
                  Thoughtful gifts. Simplified.
                </p>
              </div>
              <button className="hidden md:flex items-center gap-2 text-[var(--v2-primary)] font-bold hover:underline underline-offset-4">
                Explore all categories <span className="v2-icon">trending_flat</span>
              </button>
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="flex overflow-x-auto v2-no-scrollbar gap-4 pb-4 -mx-6 px-6 md:hidden snap-x snap-mandatory">
              {categories.map((cat) => (
                <Link key={cat.name} href={`/gift-shop?category=${cat.name.toLowerCase()}`} className="flex-shrink-0 w-40 group cursor-pointer snap-start">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-3 relative">
                    <img alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cat.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-[var(--v2-on-primary)]">
                      <p className="text-base v2-headline font-bold">{cat.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <div key={cat.name} className="group cursor-pointer">
                  <div className="aspect-square rounded-3xl overflow-hidden mb-4 relative">
                    <img alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={cat.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-[var(--v2-on-primary)]">
                      <p className="text-xl v2-headline font-bold">{cat.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20 space-y-3 md:space-y-4">
            <h2 className="text-2xl md:text-4xl lg:text-5xl v2-headline font-extrabold text-[var(--v2-on-background)]">Everything You Need to Give Better</h2>
            <p className="text-sm md:text-lg text-[var(--v2-on-surface-variant)] max-w-xs md:max-w-none mx-auto">
              We&apos;ve reimagined the gifting experience from the ground up to focus on what matters: the connection.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {icon: 'card_giftcard', title: 'Find the right gift easily', desc: 'Our AI-driven recommendations suggest the perfect gift based on personality, occasion, and relationship depth.'},
              {icon: 'group', title: 'Group Campaigns', desc: 'Pool resources with friends and family for larger gifts or meaningful social causes without the administrative headache.'},
              {icon: 'verified', title: 'Trusted partner vendors', desc: 'Redeem your gifts easily at verified partner stores.'},
            ].map((feature, i) => (
              <div key={i} className="p-8 md:p-10 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] shadow-sm border border-[var(--v2-outline-variant)]/5 hover:border-[var(--v2-primary-container)]/20 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[var(--v2-primary-container)]/10 flex items-center justify-center text-[var(--v2-primary)] mb-6 md:mb-8 group-hover:bg-[var(--v2-primary-container)] group-hover:text-[var(--v2-on-primary-container)] transition-all">
                  <span className="v2-icon text-3xl md:text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl v2-headline font-bold mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-[var(--v2-on-surface-variant)] leading-relaxed text-sm md:text-base">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-[var(--v2-surface-container)]">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Steps Card */}
              <div className="relative order-2 lg:order-1">
                <div className="bg-[var(--v2-surface-container-lowest)] p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6 md:space-y-8">
                  {[
                    {num: "01", title: "Choose Your Path", desc: "Send a direct gift or start a collaborative campaign."},
                    {num: "02", title: "Add a personal touch", desc: "Include a message with your gift."},
                    {num: "03", title: "Make someone’s day", desc: "Track your gift in real time.", highlight: true},
                  ].map((step, i) => (
                    <div key={i} className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl ${step.highlight ? "bg-[var(--v2-primary-container)] text-[var(--v2-on-primary)] shadow-lg md:scale-105" : "bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10"}`}>
                      <span className={`text-3xl md:text-4xl v2-headline font-extrabold ${step.highlight ? "opacity-50" : "text-[var(--v2-primary-container)]/30"}`}>{step.num}</span>
                      <div>
                        <h4 className="text-lg md:text-xl v2-headline font-bold">{step.title}</h4>
                        <p className={`text-sm md:text-base ${step.highlight ? "opacity-90" : "text-[var(--v2-on-surface-variant)]"}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
                <h2 className="text-2xl md:text-4xl lg:text-5xl v2-headline font-extrabold text-[var(--v2-on-background)] leading-tight">Gifting, simplified</h2>
                <p className="text-base md:text-lg lg:text-xl text-[var(--v2-on-surface-variant)] leading-relaxed">Everything you need to give, in one place.</p>
                <ul className="space-y-4">
                  {["One-click contribution links", "Personalize every gift with a message", "Real-time gift tracking"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[var(--v2-on-surface)] font-semibold">
                      <span className="v2-icon text-[var(--v2-primary)]" style={{fontVariationSettings: "’FILL’ 1"}}>check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Campaigns Section */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex justify-between items-end mb-8 md:mb-12">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl lg:text-4xl v2-headline font-extrabold text-[var(--v2-on-background)]">Trending right now</h2>
              <p className="text-[var(--v2-on-surface-variant)] text-sm md:text-base">
                <span className="md:hidden">Items capturing hearts this week.</span>
                <span className="hidden md:inline">Items capturing hearts this week.</span>
              </p>
            </div>
            <Link href="/campaigns" className="text-[var(--v2-primary)] font-bold hover:underline underline-offset-4 flex items-center gap-1 md:gap-2 text-sm md:text-base">
              View all <span className="v2-icon text-lg md:text-base">chevron_right</span>
            </Link>
          </div>

          {/* Mobile Horizontal Scroll */}
          <div className="flex overflow-x-auto v2-no-scrollbar gap-4 pb-4 -mx-6 px-6 md:hidden snap-x snap-mandatory">
            {loadingCampaigns ? (
              <div className="flex-shrink-0 w-72 h-64 bg-[var(--v2-surface-container-low)] rounded-2xl animate-pulse" />
            ) : topCampaigns.length === 0 ? (
              <p className="text-[var(--v2-on-surface-variant)] text-sm py-8">No campaigns yet</p>
            ) : (
              topCampaigns.map((campaign: any) => {
                const raised = campaign.totalRaised / 100; // Convert from kobo
                const goal = campaign.goal_amount || 1;
                const percent = Math.min(Math.round((raised / goal) * 100), 100);
                return (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.campaign_short_id}/${campaign.campaign_slug}`}
                    className="flex-shrink-0 w-72 snap-start"
                  >
                    <div className="bg-[var(--v2-surface-container-lowest)] rounded-2xl overflow-hidden shadow-sm border border-[var(--v2-outline-variant)]/10 h-full">
                      {campaign.image_url ? (
                        <img alt={campaign.title} className="w-full h-40 object-cover" src={campaign.image_url} />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)] flex items-center justify-center">
                          <span className="v2-icon text-4xl text-[var(--v2-on-primary-container)]/50">volunteer_activism</span>
                        </div>
                      )}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] rounded-full text-[10px] font-bold uppercase tracking-wider">{campaign.category}</span>
                        </div>
                        <h4 className="text-base v2-headline font-bold text-[var(--v2-on-background)] line-clamp-2">{campaign.title}</h4>
                        <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 text-xs">{campaign.description}</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-[var(--v2-primary)]">{formatCurrency(raised, campaign.currency || 'NGN')} raised</span>
                            <span className="text-[var(--v2-on-surface-variant)]">{percent}%</span>
                          </div>
                          <div className="w-full bg-[var(--v2-surface-container)] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[var(--v2-primary)] h-full rounded-full" style={{width: `${percent}%`}}></div>
                          </div>
                        </div>
                        <button className="w-full py-2.5 bg-[var(--v2-surface-container-low)] text-[var(--v2-primary)] rounded-xl font-bold text-sm active:scale-[0.98] transition-all">Contribute</button>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingCampaigns ? (
              <>
                <div className="h-96 bg-[var(--v2-surface-container-low)] rounded-3xl animate-pulse" />
                <div className="h-96 bg-[var(--v2-surface-container-low)] rounded-3xl animate-pulse" />
                <div className="h-96 bg-[var(--v2-surface-container-low)] rounded-3xl animate-pulse" />
              </>
            ) : topCampaigns.length === 0 ? (
              <p className="col-span-3 text-center text-[var(--v2-on-surface-variant)] py-12">No campaigns yet. Be the first to create one!</p>
            ) : (
              topCampaigns.map((campaign: any) => {
                const raised = campaign.totalRaised / 100; // Convert from kobo
                const goal = campaign.goal_amount || 1;
                const percent = Math.min(Math.round((raised / goal) * 100), 100);
                return (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.campaign_short_id}/${campaign.campaign_slug}`}
                    className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-[var(--v2-outline-variant)]/10"
                  >
                    {campaign.image_url ? (
                      <img alt={campaign.title} className="w-full h-56 object-cover" src={campaign.image_url} />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-[var(--v2-primary-container)] to-[var(--v2-secondary-container)] flex items-center justify-center">
                        <span className="v2-icon text-6xl text-[var(--v2-on-primary-container)]/50">volunteer_activism</span>
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] rounded-full text-xs font-bold uppercase tracking-wider">{campaign.category}</span>
                      </div>
                      <h4 className="text-xl v2-headline font-bold text-[var(--v2-on-background)]">{campaign.title}</h4>
                      <p className="text-[var(--v2-on-surface-variant)] line-clamp-2 text-sm">{campaign.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-[var(--v2-primary)]">{formatCurrency(raised, campaign.currency || 'NGN')} raised</span>
                          <span className="text-[var(--v2-on-surface-variant)]">{percent}%</span>
                        </div>
                        <div className="w-full bg-[var(--v2-surface-container)] h-2 rounded-full overflow-hidden">
                          <div className="bg-[var(--v2-primary)] h-full rounded-full" style={{width: `${percent}%`}}></div>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-[var(--v2-surface-container-low)] text-[var(--v2-primary)] rounded-xl font-bold hover:bg-[var(--v2-primary-container)] hover:text-[var(--v2-on-primary-container)] transition-all">Contribute</button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-8">
          <div className="bg-[var(--v2-inverse-surface)] md:bg-[var(--v2-primary-container)]/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 md:gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-[var(--v2-primary)] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
            <div className="md:w-1/2 space-y-4 md:space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-5xl v2-headline font-extrabold text-white md:text-[var(--v2-on-primary-container)] leading-tight">Stay Updated</h2>
              <p className="text-[var(--v2-inverse-on-surface)] md:text-[var(--v2-on-surface-variant)] text-base md:text-lg leading-relaxed">
                <span className="md:hidden">Get gifting tips, trending campaigns, and updates delivered to your inbox every week.</span>
                <span className="hidden md:inline">Get gifting tips, trending campaigns, and updates delivered to your inbox every week.</span>
              </p>
            </div>
            <div className="md:w-1/2 w-full relative z-10">
              <form className="flex flex-col gap-3 md:flex-row md:gap-4">
                <input
                  className="flex-grow bg-white/10 md:bg-white/60 backdrop-blur-md border-none md:border-white/20 text-white md:text-[var(--v2-on-surface)] rounded-xl px-5 md:px-6 py-4 focus:ring-2 focus:ring-[var(--v2-primary)] placeholder:text-white/40 md:placeholder:text-[var(--v2-on-surface-variant)]/50"
                  placeholder="Your email address"
                  type="email"
                />
                <button className="v2-gradient-primary text-[var(--v2-on-primary)] font-bold px-8 py-4 rounded-xl hover:shadow-2xl hover:shadow-[var(--v2-primary)]/40 transition-all whitespace-nowrap v2-headline" type="submit">
                  <span className="md:hidden">Join the Inner Circle</span>
                  <span className="hidden md:inline">Subscribe</span>
                </button>
              </form>
              <p className="text-white/40 md:text-[var(--v2-on-surface-variant)]/60 text-xs mt-4">We respect your privacy. Unsubscribe at any time.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="text-2xl md:text-4xl v2-headline font-extrabold text-center text-[var(--v2-on-background)] mb-12 md:mb-16">
            <span className="md:hidden">Common Questions</span>
            <span className="hidden md:inline">Frequently Asked Questions</span>
          </h2>
          <div className="space-y-4 md:space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[var(--v2-surface-container-low)] rounded-2xl p-6 border border-[var(--v2-outline-variant)]/10">
                <button
                  className="flex justify-between items-center w-full text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-lg md:text-xl v2-headline font-bold text-[var(--v2-on-surface)]">{faq.q}</span>
                  <span className={`v2-icon text-[var(--v2-primary)] transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    {openFaq === i ? 'remove' : 'add'}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="mt-4 text-[var(--v2-on-surface-variant)] leading-relaxed text-sm md:text-base">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>


      {/* Footer */}
      <footer className="bg-stone-100 mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 px-6 md:px-8 py-12 md:py-16 max-w-7xl mx-auto">
          <div className="space-y-6 text-center md:text-left">
            <GifthanceLogo size="sm" />
            <p className="text-stone-600 text-sm leading-relaxed">Make every gift count <br/> Join others who are making giving simple and meaningful.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              {['public', 'mail', 'share'].map((icon) => (
                <a key={icon} className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all" href="#">
                  <span className="v2-icon">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-6 hidden md:block">
            <h5 className="text-sm font-bold uppercase tracking-widest text-orange-700">Explore</h5>
            <ul className="space-y-4">
              {['Gift Shop', 'Trending Campaigns', 'Gift Ideas', 'Gifting Guide'].map((link) => (
                <li key={link}><a className="text-stone-600 hover:text-orange-600 underline-offset-4 hover:underline transition-all" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-6 hidden md:block">
            <h5 className="text-sm font-bold uppercase tracking-widest text-orange-700">Company</h5>
            <ul className="space-y-4">
              {['About Us', 'Contact', 'Press', 'FAQ'].map((link) => (
                <li key={link}><a className="text-stone-600 hover:text-orange-600 underline-offset-4 hover:underline transition-all" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
          <div className="space-y-6 hidden md:block">
            <h5 className="text-sm font-bold uppercase tracking-widest text-orange-700">Legal</h5>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((link) => (
                <li key={link}><a className="text-stone-600 hover:text-orange-600 underline-offset-4 hover:underline transition-all" href="#">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Mobile Footer Links */}
        <div className="flex gap-8 text-[var(--v2-on-surface-variant)] text-sm justify-center md:hidden pb-4">
          <span className="hover:text-[var(--v2-primary)] transition-colors cursor-pointer">Privacy</span>
          <span className="hover:text-[var(--v2-primary)] transition-colors cursor-pointer">Terms</span>
          <span className="hover:text-[var(--v2-primary)] transition-colors cursor-pointer">Support</span>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 md:py-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4 pb-24 md:pb-8">
          <p className="text-stone-600 text-sm">© 2026 Gifthance. All rights reserved.</p>
          <div className="hidden md:flex items-center gap-2 text-stone-400 text-sm">
            Made with <span className="v2-icon text-xs text-red-500" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span> for the community
          </div>
        </div>
      </footer>
    </div>
  );
}
