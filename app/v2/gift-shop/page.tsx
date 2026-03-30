'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {createClient} from '@/lib/server/supabase/client';

// Sample gift data
const gifts = [
  {
    id: 1,
    name: 'Artisan Celebration Suite',
    description: 'A handcrafted selection of fine wines and dark chocolate.',
    price: 125,
    category: 'Gourmet',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDefc_AvCy_52qD4PaYWsYXcdWmciemDXweNmodJ3rYjYe4qQBWbGAqVd48dOfc8azDuE8zN3sh4FUngsYX3cNB1Vz5y5860Np_wvz3TjCoR1me2XohoIJRXbGlpAwXSf1xgR3nx2BZC3flvBVWJFsj3VuW4D83lF5hI-pqQPPHmVltEs57tjzsocjCCDvj7m9KqGRGTxg79ibkUEcAB0-dR1YC6ciNVsaf2WjKF7MIkPzh0lgCJ5FNwjK3ByrcMGUXHcJSV0NSLtQ',
    featured: true,
    badge: "Editor's Pick",
  },
  {
    id: 2,
    name: 'Artisan Ceramics',
    description: 'Hand-thrown stoneware from local workshops in the valley.',
    price: 84,
    category: 'Homeware',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB45vExU4-RqEyOxOCGNu1xhTPDhSRMllEc2VI2ZVnMosl9vq2azGS-bX3WJVwaTMWcS2d8tFvKlG4ihdq0TuFKFiHuiiTbZTSeSQV8eB1OtmWFem6XsXlYk4M26jKzejg0r8cS_9Jrx2bxq9eu03SH8nnRGV-BM-Sq8-DXSPoVAP70TZAQDhRMc2Kvol9BL1rpHfxHjdb-r45yZTkScRDPjbQIdEhv830_T_19vPTbRZIOntyH9xm5F4elxBe8_g499XPvOn72C4',
  },
  {
    id: 3,
    name: 'Ritual Spa Box',
    description: 'Everything needed for a restorative Sunday afternoon at home.',
    price: 120,
    category: 'Wellness',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMOQBWcau2VaAcwWuE2KABV6sbM8Er0SP_KEWovkNI_KSXJgGku84m_ydoJBQk9X5x9yDgl7HzqQ67inxZmF-_qG4RlFZbzBvTFCQAvGyxfoqSUsT_nA9Hnk9fvjW2Q3VTsoIszAboVM8QiHsT-Yub4GULgZpBJDcfiKIyujSsWZHShlDvJ5m6yxwc7w_l6uqYowEYcDKXAHSP8IjSbcT2tV9iylk-QwMt9npttgjddpkvH3L52LlP6zycGQyphLkbOI78bsC9P28',
  },
  {
    id: 4,
    name: 'The Horizon Timepiece',
    description: 'Brushed steel with a cognac leather band.',
    price: 245,
    category: 'Accessories',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm2N7qa_h9jr3lefyNnCrnkf5IV9im3KS2hKXJ6JZQZWS3pWGG9hbazL3s_4OrM9aTzuOKqtydYzDdNaRUziAKAcgMBGAi3k4uvyFiwuRrVk0aQETpUUrhKYvuGAWIKXz4yEhM1n0Td8LOkSk0jo70RfZXIuUDs7T7Q8BDM5fx3JWa5ZD56N7QA5_TBDkg9r7DMYR8IUJXY0uPiSnwGcoueXnzgXb6rM0Has_LKC93tFwJnHWkRATts4esyweUQd0awAfxTzx9VhI',
    badge: 'New Arrival',
  },
  {
    id: 5,
    name: 'Dark Truffle Set',
    description: 'Small-batch ganache infusions featuring single-origin cocoa.',
    price: 42,
    category: 'Gourmet',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuyDVqHLk76jttvnTD5Y4wvm_eY2Ey20CUYFvy-XWdApubiKPin9d6y_RkEko6hmx26XQK0HTNJfckj0K0txIJkS1smH9SGuVSlXjTB38d8lpyq7Ldwyxbipd0UW8dFfVqTacDKIHwVjv2O_ICN0hZfoiNfNkVy3iAXw4_M-vkZbHM6d3juZCFVODEfpauG0pNk-_P9Ks_kavDfmWUw5j3Ujx628VXWacltbExBabEWMRCltANHKdeOFLouU0rEf5Al5C_6U7tLoM',
  },
  {
    id: 6,
    name: 'Nordic Stone Vase',
    description: 'Minimalist white ceramic vase for any interior.',
    price: 45,
    category: 'Homeware',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFvwZyp5eHtgsYzVpkWAtthr14G9Vg_gxI4Mg8Zey-11x1zKK3EeW8qKwr5wBbcy2I1c0XblAFUdcm74osXLNwVKMNsxDOq9ZqJHJbDMqwFjKW-pfGkeb68_IN8yO5DivImsEKUYDAdQzSx7PxQ8345QM3RHh7zk0IUNaVRtFBvh3kUF_N8EvJdRDYcAaCSIWHkmuIb6w6miL1VB37nHyt9yD6ZFsIE8JkM2Mb_mNVHyl3hHUKhtu4g0ozNvPiNKRLcJvJfwhn1-8',
  },
  {
    id: 7,
    name: 'Legacy Leather Journal',
    description: 'Elegant fountain pen resting on a leather-bound journal.',
    price: 32,
    category: 'Stationery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3G6u85K-DxoemKgxDD9dyEhjwAiwjrx3_66vvfmrvCor-1na1O9iBYv2DDwFi1ahpGTBMne5j9iYqTXslgVj4Zdld9kMUuM4JfIWCnxQYq4SJ-nJVHJn0YYc79Z2XMlPTs5tMR3nORBxOSUjSWoBmN0IAvGtAilj9P4piEx0qFqMcL0UgO4gWSRQKI940trtenZjV0_YTfaT0bZzZ3w5O0bzGPsJ_BUDuWULyJMEnUEYPnoaJ-jSlzkSwKeVdVwmuLkqxEbEhAWc',
  },
  {
    id: 8,
    name: 'Amber & Oak Candle',
    description: 'Slow-burn essential oils.',
    price: 24,
    category: 'Home',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwyDuxNWnMte2T5l7OU2dHUi63NI8Z4mbY97h2DGG0DYbb5NhBqyDo1fG3PxEtiS7nKa_zIVBi-qk_Ap4w_6WJ6eyOD2AFsTwQm-SOLHx1zv63r85fcAnIDuZcVEfUab-y9IDJNa0gfa6IKm7ma-HOdkXX2jhMIAnVvYbt-To_ZnpD3eFvyfDD5TqaqL8NAQx7M5yDpoo1hwGmtyTQQH_JemLf2G3b7F8bOI23tFoMqUUH2CsWBVHC3z70xwjrGGE44YPURZ8okl0',
    badge: 'New Arrival',
  },
];

const categories = ['All Gifts', 'Birthday', 'Anniversary', 'Corporate', 'Wedding', 'For Him', 'For Her', 'Digital', 'Home'];

export default function V2GiftShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Gifts');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {data: {user}} = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  const featuredGift = gifts.find(g => g.featured);
  const regularGifts = gifts.filter(g => !g.featured);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation - Desktop */}
      <nav className="fixed top-0 w-full z-50 v2-glass-nav hidden md:block">
        <div className="flex justify-between items-center px-8 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-12">
            <Link href="/v2" className="text-2xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline">Gifthance</Link>
            <div className="flex items-center gap-8 text-sm font-semibold">
              <Link href="/v2/gift-shop" className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1">Gift Shop</Link>
              <Link href="/v2/campaigns" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">Campaigns</Link>
              <Link href="/v2/send-gift" className="text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-primary)] transition-colors">Send Gift</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="v2-icon absolute left-3 top-1/2 -translate-y-1/2 text-[var(--v2-on-surface-variant)]/60">search</span>
              <input
                className="bg-[var(--v2-surface-container-low)] border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-[var(--v2-primary)]/30 focus:bg-[var(--v2-surface-container-lowest)] transition-all placeholder:text-[var(--v2-on-surface-variant)]/50"
                placeholder="Find the perfect gift..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isLoggedIn ? (
              <Link href="/v2/dashboard" className="flex items-center text-[var(--v2-primary)] hover:opacity-80 transition-opacity">
                <span className="v2-icon text-2xl">account_circle</span>
              </Link>
            ) : (
              <Link href="/v2/login" className="text-[var(--v2-primary)] font-semibold hover:text-[var(--v2-primary-dim)] transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Navigation - Mobile */}
      <nav className="fixed top-0 w-full z-50 v2-glass-nav md:hidden">
        <div className="flex justify-between items-center px-4 h-14">
          <Link href="/v2" className="text-xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline">Gifthance</Link>
          <div className="flex items-center gap-2">
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

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="px-4 pb-4 bg-[var(--v2-surface)]/95 backdrop-blur-xl border-t border-[var(--v2-outline-variant)]/10">
            <div className="flex flex-col gap-1 py-2">
              <Link href="/v2/gift-shop" className="px-4 py-3 rounded-xl bg-[var(--v2-primary)]/10 text-[var(--v2-primary)] font-semibold">
                Gift Shop
              </Link>
              <Link href="/v2/campaigns" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
                Campaigns
              </Link>
              <Link href="/v2/send-gift" className="px-4 py-3 rounded-xl text-[var(--v2-on-surface)] hover:bg-[var(--v2-surface-container-low)] transition-colors">
                Send Gift
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20 md:pt-28 pb-32 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="text-[var(--v2-primary)] font-bold tracking-[0.2em] uppercase text-xs mb-3 block hidden md:block">Curated Selection</span>
              <h1 className="v2-headline text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--v2-on-background)] tracking-tighter leading-none mb-4 md:mb-6">
                <span className="md:hidden">Gift Shop</span>
                <span className="hidden md:inline">Gift shop for the <span className="text-[var(--v2-primary-container)]">thoughtful</span> curator.</span>
              </h1>
              <p className="text-[var(--v2-on-surface-variant)] text-base md:text-lg max-w-lg leading-relaxed hidden md:block">
                Hand-picked treasures designed to celebrate life&apos;s most meaningful milestones. From bespoke hampers to artisan crafts.
              </p>
            </div>

            {/* Mobile Search */}
            <div className="relative group md:hidden">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[var(--v2-on-surface-variant)]">search</span>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 bg-[var(--v2-surface-container-low)] border-none rounded-2xl text-[var(--v2-on-surface)] placeholder:text-[var(--v2-on-surface-variant)] focus:ring-1 focus:ring-[var(--v2-outline-variant)]/30 transition-all"
                placeholder="Find the perfect gifts..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Categories Filter */}
        <section className="mb-8 md:mb-10 -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto v2-no-scrollbar flex gap-3 pb-2 md:pb-0 md:flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--v2-primary-container)] text-[var(--v2-on-primary-container)] md:bg-[var(--v2-primary)] md:text-[var(--v2-on-primary)]'
                  : 'bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-highest)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid" style={{gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem'}}>
          {/* Hero Feature Card */}
          <div className="col-span-12 lg:col-span-8 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] overflow-hidden group relative min-h-[500px] flex items-end">
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxqktAL_XjhV6l9oErz6Y6TUmbq9Dm6EyKuG8iAbLs0vXnYh8LN055mxyaF-vqEpVScFy1kZnV5zOWsoO6Rd3DdZyu7nv8kaHU1u2B6vvRXOhzXpqIGQTlfDQWNyUhiiJluI6sYgORJgP1bdZlQeKn1QuYL68vpC_2ERgQIHGz39K87KMXM10JOoQBXLMzPfSPhKbLWZ2JWnZLurbbw0f5tfctzyFvffkg0xM7l28Vbi6IDM_2Tu3WtL7VTN1Q5c0ogJPVIJjvJow"
              alt="The Heritage Collection"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/80 via-[var(--v2-on-background)]/20 to-transparent"></div>
            <div className="relative p-10 w-full">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Featured Campaign</span>
              </div>
              <h2 className="v2-headline text-4xl font-bold text-white mb-4 tracking-tight">The Heritage Collection</h2>
              <p className="text-white/80 max-w-md mb-8 font-medium">A timeless selection of handcrafted leather goods and vintage stationery for the discerning professional.</p>
              <button className="v2-gradient-primary text-[var(--v2-on-primary)] px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl shadow-[var(--v2-primary)]/20 hover:scale-[1.02] active:scale-95 transition-all">
                Explore Collection
              </button>
            </div>
          </div>

          {/* Artisan Ceramics */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-low)] rounded-[2rem] p-8 flex flex-col justify-between group">
            <div>
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container)]">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={gifts[1].image} alt={gifts[1].name} />
              </div>
              <span className="text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">{gifts[1].category}</span>
              <h3 className="v2-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2">{gifts[1].name}</h3>
              <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6">{gifts[1].description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold v2-headline text-[var(--v2-secondary)]">${gifts[1].price}.00</span>
              <button className="p-3 bg-white text-[var(--v2-primary)] rounded-full shadow-sm hover:shadow-md transition-all active:scale-90">
                <span className="material-symbols-outlined">add_shopping_cart</span>
              </button>
            </div>
          </div>

          {/* Ritual Spa Box */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-[var(--v2-surface-container-high)] rounded-[2rem] p-8 flex flex-col group">
            <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container-highest)]">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={gifts[2].image} alt={gifts[2].name} />
            </div>
            <span className="text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">{gifts[2].category}</span>
            <h3 className="v2-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2">{gifts[2].name}</h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-4">{gifts[2].description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold v2-headline text-[var(--v2-secondary)]">${gifts[2].price}.00</span>
              <button className="text-[var(--v2-primary)] font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Horizon Timepiece - Tall Card */}
          <div className="col-span-12 lg:col-span-4 bg-[var(--v2-surface-container-low)] rounded-[2rem] overflow-hidden relative group min-h-[400px]">
            <img className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={gifts[3].image} alt={gifts[3].name} />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--v2-on-background)]/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <span className="bg-[var(--v2-on-primary-fixed-variant)] text-[var(--v2-on-primary)] text-[10px] font-bold px-2 py-1 rounded mb-3 inline-block uppercase tracking-tighter">New Arrival</span>
              <h3 className="text-white v2-headline text-2xl font-bold">{gifts[3].name}</h3>
              <p className="text-white/70 text-sm mb-4">{gifts[3].description}</p>
              <span className="text-white text-xl font-bold">${gifts[3].price}.00</span>
            </div>
          </div>

          {/* Dark Truffle Set */}
          <div className="col-span-12 lg:col-span-4 bg-[var(--v2-surface-container-lowest)] rounded-[2rem] p-8 border border-[var(--v2-outline-variant)]/10 shadow-sm flex flex-col group">
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 bg-[var(--v2-surface-container)]">
              <img className="w-full h-full object-cover group-hover:rotate-1 group-hover:scale-110 transition-transform duration-500" src={gifts[4].image} alt={gifts[4].name} />
            </div>
            <span className="text-[var(--v2-on-surface-variant)] font-bold text-xs uppercase tracking-widest mb-2 block">{gifts[4].category}</span>
            <h3 className="v2-headline text-2xl font-bold text-[var(--v2-on-background)] mb-2">{gifts[4].name}</h3>
            <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-6">{gifts[4].description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold v2-headline text-[var(--v2-secondary)]">${gifts[4].price}.00</span>
              <div className="flex gap-2">
                <button className="w-10 h-10 flex items-center justify-center bg-[var(--v2-surface-container-low)] text-[var(--v2-primary)] rounded-full">
                  <span className="material-symbols-outlined text-xl">favorite</span>
                </button>
                <button className="px-5 py-2 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] rounded-full text-xs font-bold">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bento Grid */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {/* Featured Large Card */}
          <div className="col-span-2 bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden shadow-sm">
            <div className="relative h-56 w-full">
              <img className="w-full h-full object-cover" src={featuredGift?.image} alt={featuredGift?.name} />
              <div className="absolute top-4 right-4 bg-[var(--v2-tertiary-container)] text-[var(--v2-on-tertiary-container)] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Editor&apos;s Pick</div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-1">
                <h3 className="v2-headline font-bold text-lg leading-tight">{featuredGift?.name}</h3>
                <span className="font-extrabold text-[var(--v2-primary)] text-lg">${featuredGift?.price}</span>
              </div>
              <p className="text-[var(--v2-on-surface-variant)] text-sm mb-4">{featuredGift?.description}</p>
              <button className="w-full py-3 v2-gradient-primary text-[var(--v2-on-primary)] rounded-xl font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                Send Gift
              </button>
            </div>
          </div>

          {/* Regular Gift Cards */}
          {regularGifts.slice(0, 2).map((gift) => (
            <div key={gift.id} className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden">
              <div className="h-40 w-full bg-[var(--v2-surface-container-low)]">
                <img className="w-full h-full object-cover" src={gift.image} alt={gift.name} />
              </div>
              <div className="p-4">
                <h3 className="v2-headline font-bold text-sm mb-1 truncate">{gift.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--v2-on-surface)]">${gift.price}</span>
                  <span className="material-symbols-outlined text-[var(--v2-primary)] text-xl">favorite</span>
                </div>
              </div>
            </div>
          ))}

          {/* Wide Card */}
          <div className="col-span-2 flex bg-[var(--v2-surface-container-low)] rounded-3xl p-4 gap-4 items-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <img className="w-full h-full object-cover" src={gifts[7].image} alt={gifts[7].name} />
            </div>
            <div className="flex-grow">
              <div className="bg-[var(--v2-secondary-container)]/30 text-[var(--v2-on-secondary-container)] text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-1">New Arrival</div>
              <h3 className="v2-headline font-bold text-base leading-tight">{gifts[7].name}</h3>
              <p className="text-[var(--v2-on-surface-variant)] text-xs mb-2">{gifts[7].description}</p>
              <span className="font-extrabold text-[var(--v2-primary)]">${gifts[7].price}</span>
            </div>
            <button className="bg-[var(--v2-surface-container-lowest)] p-3 rounded-full shadow-sm text-[var(--v2-primary)]">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>

          {/* More Regular Cards */}
          {regularGifts.slice(2, 4).map((gift) => (
            <div key={gift.id} className="bg-[var(--v2-surface-container-lowest)] rounded-3xl overflow-hidden">
              <div className="h-40 w-full bg-[var(--v2-surface-container-low)]">
                <img className="w-full h-full object-cover" src={gift.image} alt={gift.name} />
              </div>
              <div className="p-4">
                <h3 className="v2-headline font-bold text-sm mb-1 truncate">{gift.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--v2-on-surface)]">${gift.price}</span>
                  <span className="material-symbols-outlined text-[var(--v2-primary)] text-xl">favorite</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 md:mt-20 text-center">
          <button className="inline-flex items-center gap-4 text-[var(--v2-on-background)] v2-headline font-bold text-base md:text-lg hover:text-[var(--v2-primary)] transition-colors group">
            See more curated treasures
            <span className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-[var(--v2-outline-variant)]/30 rounded-full group-hover:border-[var(--v2-primary)] transition-all">
              <span className="material-symbols-outlined">expand_more</span>
            </span>
          </button>
        </div>
      </main>

    </div>
  );
}
