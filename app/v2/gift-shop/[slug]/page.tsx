'use client';

import Link from 'next/link';
import Image from 'next/image';

// Mock product data
const product = {
  slug: 'artisan-pottery-workshop',
  name: 'Artisan Pottery Workshop',
  category: 'Experiences',
  subcategory: 'Ceramics',
  duration: '3 Hours',
  price: 12000,
  originalPrice: 15000,
  rating: 4.5,
  reviewCount: 128,
  description:
    'Gift a tactile journey into the world of ceramics. This three-hour private session covers fundamental wheel-throwing techniques and glazing, hosted by a master artisan in a boutique studio.',
  features: [
    {icon: 'verified', text: 'Includes all materials & firing'},
    {icon: 'local_shipping', text: 'Digital Delivery in seconds'},
  ],
  whyChoose: [
    {icon: 'eco', label: 'Sustainable'},
    {icon: 'workspace_premium', label: 'Expert Led'},
  ],
  whatToExpect: [
    {
      step: 1,
      title: 'Personal Consultation',
      description: "A quick chat to understand the recipient's creative goals.",
    },
    {
      step: 2,
      title: 'Wheel Sessions',
      description: 'Hands-on practice under expert guidance for 2.5 hours.',
    },
    {
      step: 3,
      title: 'Firing & Glazing',
      description: 'Pick up two finished, glazed pieces within 14 days.',
    },
  ],
  curator: {
    name: 'Elena Vance',
    title: 'Master Ceramist, 15+ Yrs',
    image: '/images/curator-elena.jpg',
    quote:
      '"I believe everyone has a hidden sculptor within. My studio is designed to be a sanctuary of creativity and peace."',
  },
  images: [
    '/images/pottery-main.jpg',
    '/images/pottery-secondary-1.jpg',
    '/images/pottery-secondary-2.jpg',
  ],
};

const relatedProducts = [
  {
    slug: 'artisan-painting-kit',
    name: 'Artisan Painting Kit',
    price: 8500,
    image: '/images/painting-kit.jpg',
  },
  {
    slug: 'candle-making-class',
    name: 'Candle Making Class',
    price: 6500,
    image: '/images/candle-class.jpg',
  },
  {
    slug: 'barista-experience',
    name: 'Barista Experience',
    price: 11000,
    image: '/images/barista.jpg',
  },
  {
    slug: 'digital-spa-retreat',
    name: 'Digital Spa Retreat',
    price: 4500,
    image: '/images/spa-retreat.jpg',
  },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

function StarRating({rating}: {rating: number}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <span
        key={`full-${i}`}
        className="v2-icon"
        style={{fontVariationSettings: "'FILL' 1"}}
      >
        star
      </span>
    );
  }

  if (hasHalfStar) {
    stars.push(
      <span
        key="half"
        className="v2-icon"
        style={{fontVariationSettings: "'FILL' 1"}}
      >
        star_half
      </span>
    );
  }

  return (
    <div className="flex text-[var(--v2-tertiary-fixed-dim)]">{stars}</div>
  );
}

export default function GiftDetailsPage() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <Link
            href="/v2"
            className="text-2xl font-bold text-[var(--v2-primary)] tracking-tighter v2-headline"
          >
            Gifthance
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/v2/gift-shop"
              className="text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1 v2-headline text-sm font-semibold tracking-tight"
            >
              Gift Shop
            </Link>
            <Link
              href="/v2/campaigns"
              className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="/v2/send-gift"
              className="text-[var(--v2-on-surface-variant)] font-medium v2-headline text-sm tracking-tight hover:text-[var(--v2-primary)] transition-colors"
            >
              Send Gift
            </Link>
          </div>
          <button className="v2-icon text-[var(--v2-primary)]">
            account_circle
          </button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full z-50 v2-glass-nav flex items-center justify-between px-6 h-16">
        <Link href="/v2/gift-shop">
          <span className="v2-icon text-[var(--v2-primary)]">arrow_back</span>
        </Link>
        <h1 className="v2-headline text-lg font-bold text-[var(--v2-primary)]">
          Gift Details
        </h1>
        <button>
          <span className="v2-icon text-[var(--v2-primary)]">share</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-16 md:pt-24 pb-32 md:pb-16">
        {/* Desktop Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm px-6 max-w-7xl mx-auto">
          <Link href="/v2/gift-shop" className="hover:text-[var(--v2-primary)]">
            Gift Shop
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <span>{product.category}</span>
          <span className="v2-icon text-xs">chevron_right</span>
          <span className="text-[var(--v2-primary)] font-bold">
            {product.name}
          </span>
        </nav>

        {/* Mobile Hero */}
        <section className="md:hidden px-6 pt-4 pb-8">
          <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden bg-[var(--v2-surface-container-low)] shadow-sm">
            <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
              <span className="v2-icon text-6xl text-[var(--v2-outline-variant)]">
                image
              </span>
            </div>
            <div className="absolute bottom-6 left-6 flex gap-2">
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[var(--v2-primary)] tracking-wider uppercase">
                {product.subcategory}
              </span>
              <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[var(--v2-primary)] tracking-wider uppercase">
                {product.duration}
              </span>
            </div>
          </div>
        </section>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid grid-cols-12 gap-12 items-start px-6 max-w-7xl mx-auto">
          {/* Left: Image Gallery */}
          <div className="col-span-7 grid grid-cols-6 gap-4">
            <div className="col-span-6 rounded-3xl overflow-hidden aspect-[4/3] bg-[var(--v2-surface-container-low)]">
              <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                <span className="v2-icon text-8xl text-[var(--v2-outline-variant)]">
                  image
                </span>
              </div>
            </div>
            <div className="col-span-3 rounded-2xl overflow-hidden aspect-square bg-[var(--v2-surface-container-low)]">
              <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                <span className="v2-icon text-5xl text-[var(--v2-outline-variant)]">
                  image
                </span>
              </div>
            </div>
            <div className="col-span-3 rounded-2xl overflow-hidden aspect-square bg-[var(--v2-surface-container-low)]">
              <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center">
                <span className="v2-icon text-5xl text-[var(--v2-outline-variant)]">
                  image
                </span>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="col-span-5 sticky top-32 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] text-xs font-bold uppercase tracking-widest">
                Handpicked Experience
              </div>
              <h1 className="v2-headline text-5xl font-extrabold tracking-tight text-[var(--v2-on-surface)] leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <StarRating rating={product.rating} />
                <span className="text-[var(--v2-on-surface-variant)] font-medium">
                  ({product.reviewCount} Reviews)
                </span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--v2-surface-container-low)] space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="v2-headline text-4xl font-extrabold text-[var(--v2-primary)]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-[var(--v2-on-surface-variant)] line-through text-lg">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>

              <p className="text-[var(--v2-on-surface-variant)] leading-relaxed">
                {product.description}
              </p>

              <div className="space-y-4">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-[var(--v2-on-surface)] font-semibold"
                  >
                    <span className="v2-icon text-[var(--v2-primary)]">
                      {feature.icon}
                    </span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <button className="w-full py-5 rounded-xl v2-btn-primary text-lg shadow-xl shadow-[var(--v2-primary)]/20 flex justify-center items-center gap-3">
                <span>Send as Gift</span>
                <span className="v2-icon">send</span>
              </button>

              <button className="w-full py-4 rounded-xl bg-[var(--v2-surface-container-highest)] text-[var(--v2-primary)] v2-headline font-bold text-base transition-all hover:bg-[var(--v2-surface-container-high)] active:scale-95">
                Add to Wishlist
              </button>
            </div>

            {/* Why Choose This Gift */}
            <div className="p-6 rounded-3xl bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/15 space-y-4">
              <h3 className="v2-headline font-bold text-[var(--v2-on-surface)]">
                Why choose this gift?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {product.whyChoose.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <span className="v2-icon text-[var(--v2-secondary)]">
                      {item.icon}
                    </span>
                    <span className="text-xs font-bold text-[var(--v2-on-surface)]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Product Info */}
        <section className="md:hidden px-6 pb-8">
          <div className="flex flex-col gap-2">
            <h2 className="v2-headline text-2xl font-extrabold text-[var(--v2-on-surface)] leading-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-[var(--v2-tertiary)]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="v2-icon text-sm"
                    style={{fontVariationSettings: "'FILL' 1"}}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-medium text-[var(--v2-on-surface-variant)]">
                ({product.reviewCount} Reviews)
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-4">
              <span className="v2-headline text-3xl font-extrabold text-[var(--v2-primary)]">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-[var(--v2-on-surface-variant)] line-through opacity-60">
                {formatPrice(product.originalPrice)}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-[var(--v2-on-surface-variant)] leading-relaxed text-lg font-medium">
              {product.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-[var(--v2-surface-container-low)] p-4 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-[var(--v2-primary)]">brush</span>
              <span className="text-sm font-bold text-[var(--v2-on-background)]">
                Includes all materials
              </span>
            </div>
            <div className="bg-[var(--v2-surface-container-low)] p-4 rounded-2xl flex items-center gap-3">
              <span className="v2-icon text-[var(--v2-primary)]">mail</span>
              <span className="text-sm font-bold text-[var(--v2-on-background)]">
                Digital Delivery
              </span>
            </div>
          </div>
        </section>

        {/* Mobile Curator Section */}
        <section className="md:hidden bg-[var(--v2-surface-container-low)] px-6 py-10 mt-4 rounded-t-[2.5rem]">
          <h3 className="v2-headline text-xl font-bold mb-6">
            About the Curator
          </h3>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-[var(--v2-surface-container)] flex items-center justify-center">
              <span className="v2-icon text-2xl text-[var(--v2-outline-variant)]">
                person
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-bold text-lg text-[var(--v2-on-surface)]">
                {product.curator.name}
              </h4>
              <p className="text-sm text-[var(--v2-on-surface-variant)] leading-relaxed">
                Elena is a master potter with 12 years of experience focusing on
                wabi-sabi aesthetics and tactile functional art.
              </p>
            </div>
          </div>
        </section>

        {/* Desktop Details Sections */}
        <section className="hidden md:grid grid-cols-2 gap-8 mt-24 px-6 max-w-7xl mx-auto">
          <div className="p-10 rounded-[2.5rem] bg-[var(--v2-surface-container-low)]">
            <h2 className="v2-headline text-2xl font-bold mb-6">
              What to Expect
            </h2>
            <ul className="space-y-6">
              {product.whatToExpect.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--v2-primary-container)]/20 flex items-center justify-center shrink-0">
                    <span className="text-[var(--v2-primary)] font-bold v2-headline text-sm">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[var(--v2-on-surface)]">
                      {item.title}
                    </p>
                    <p className="text-sm text-[var(--v2-on-surface-variant)]">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-[var(--v2-surface-container-lowest)] border border-[var(--v2-outline-variant)]/10">
            <h2 className="v2-headline text-2xl font-bold mb-6">
              About the Curator
            </h2>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--v2-surface-container)] flex items-center justify-center">
                <span className="v2-icon text-3xl text-[var(--v2-outline-variant)]">
                  person
                </span>
              </div>
              <div>
                <p className="font-bold text-xl">{product.curator.name}</p>
                <p className="text-[var(--v2-primary)] font-medium text-sm">
                  {product.curator.title}
                </p>
              </div>
            </div>
            <p className="text-[var(--v2-on-surface-variant)] leading-relaxed italic">
              {product.curator.quote}
            </p>
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-16 md:mt-24 px-6 md:max-w-7xl md:mx-auto">
          <div className="flex justify-between items-end mb-6 md:mb-10">
            <div className="space-y-1 md:space-y-2">
              <h2 className="v2-headline text-xl md:text-3xl font-extrabold tracking-tight">
                You might also like
              </h2>
              <p className="hidden md:block text-[var(--v2-on-surface-variant)]">
                Curated similar experiences for your loved ones.
              </p>
            </div>
            <Link
              href="/v2/gift-shop"
              className="hidden md:flex text-[var(--v2-primary)] font-bold items-center gap-2"
            >
              View all <span className="v2-icon">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden flex overflow-x-auto v2-no-scrollbar gap-5 -mx-6 px-6">
            {relatedProducts.slice(0, 3).map((item) => (
              <Link
                href={`/v2/gift-shop/${item.slug}`}
                key={item.slug}
                className="flex-shrink-0 w-48 group"
              >
                <div className="aspect-square bg-[var(--v2-surface-container-low)] rounded-3xl overflow-hidden mb-3">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <span className="v2-icon text-4xl text-[var(--v2-outline-variant)]">
                      redeem
                    </span>
                  </div>
                </div>
                <h5 className="font-bold text-[var(--v2-on-surface)] truncate">
                  {item.name}
                </h5>
                <p className="text-[var(--v2-primary)] font-bold">
                  {formatPrice(item.price)}
                </p>
              </Link>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link
                href={`/v2/gift-shop/${item.slug}`}
                key={item.slug}
                className="group relative bg-[var(--v2-surface-container-low)] rounded-3xl p-4 transition-all hover:bg-[var(--v2-surface-container)]"
              >
                <div className="rounded-2xl overflow-hidden aspect-square mb-4">
                  <div className="w-full h-full bg-gradient-to-br from-[var(--v2-surface-container)] to-[var(--v2-surface-container-high)] flex items-center justify-center transition-transform group-hover:scale-110">
                    <span className="v2-icon text-5xl text-[var(--v2-outline-variant)]">
                      redeem
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="v2-headline font-bold text-[var(--v2-on-surface)]">
                    {item.name}
                  </h4>
                  <p className="text-[var(--v2-primary)] v2-headline font-extrabold">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Fixed Bottom Action */}
      <div className="md:hidden fixed bottom-0 left-0 w-full px-6 pb-safe pt-4 bg-[var(--v2-surface)]/90 backdrop-blur-xl z-40">
        <button className="w-full v2-btn-primary py-4 rounded-xl shadow-xl active:scale-95 transition-transform font-bold">
          Send as Gift
        </button>
      </div>
    </div>
  );
}
