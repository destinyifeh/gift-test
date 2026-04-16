'use client';

import Link from 'next/link';

// Mock vendor data
const vendor = {
  name: 'Sweet Delight Bakery',
  icon: 'bakery_dining',
  badge: 'Artisan Vendor',
  rating: 2.0,
  reviewCount: 1,
  location: '21, Baleke street, SA',
  description:
    'Crafting moments of joy through traditional baking techniques and modern flavors. Every pastry is a testament to our commitment to warmth and curation.',
  deliverySpeed: '24-48 Hours',
  categories: ['Cakes', 'Pastry'],
};

const products = [
  {
    id: 1,
    name: 'Birthday Cake Gift Card',
    price: 5000,
    tags: ['birthday', 'digital'],
    badges: ['Digital', 'Trending'],
    description:
      'Surprise your loved ones with the gift of choice. Valid for any artisanal creation in our gallery.',
    image: '/images/gift-cake.jpg',
  },
];

const navLinks = [
  {label: 'Shop', href: '/gift-shop', active: true},
  {label: 'Occasions', href: '/occasions'},
  {label: 'Registry', href: '/registry'},
  {label: 'Corporate', href: '/corporate'},
];

const mobileNavItems = [
  {icon: 'explore', label: 'Explore', href: '/'},
  {icon: 'search', label: 'Search', href: '/search'},
  {icon: 'favorite', label: 'Saved', href: '/favorites'},
  {icon: 'wallet', label: 'Cart', href: '/cart'},
];

const footerLinks = {
  quickLinks: [
    {label: 'About Us', href: '/about'},
    {label: 'Vendor Portal', href: '/vendors'},
    {label: 'Gift Registry', href: '/registry'},
    {label: 'Corporate Gifting', href: '/corporate'},
  ],
  support: [
    {label: 'Help Center', href: '/help'},
    {label: 'Contact Support', href: '/contact'},
    {label: 'Refund Policy', href: '/refunds'},
    {label: 'Shipping Info', href: '/shipping'},
  ],
};

function formatPrice(amount: number) {
  return `$${(amount / 100).toFixed(2)}`;
}

function StarRating({rating}: {rating: number}) {
  return (
    <div className="flex items-center gap-1.5 bg-[var(--v2-tertiary-container)]/20 px-3 py-1 rounded-full">
      <span
        className="v2-icon text-[var(--v2-tertiary)] text-lg"
        style={{fontVariationSettings: "'FILL' 1"}}
      >
        star
      </span>
      <span className="font-bold text-[var(--v2-on-surface)]">{rating.toFixed(1)}</span>
      <span className="text-[var(--v2-on-surface-variant)] text-sm">
        ({vendor.reviewCount} review)
      </span>
    </div>
  );
}

export default function VendorShopPage() {
  return (
    <div className="min-h-screen bg-[var(--v2-background)]">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 v2-glass-nav">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-black text-[var(--v2-on-surface)] tracking-tight v2-headline"
            >
              The Warm Curator
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`v2-headline font-bold text-lg transition-colors duration-300 ${
                    link.active
                      ? 'text-[var(--v2-primary)] border-b-2 border-[var(--v2-primary)] pb-1'
                      : 'text-[var(--v2-on-surface-variant)] hover:text-[var(--v2-on-surface)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-[var(--v2-surface-container-low)] px-4 py-2 rounded-full gap-2">
              <span className="v2-icon text-[var(--v2-on-surface-variant)] text-sm">search</span>
              <input
                type="text"
                placeholder="Search curated gifts..."
                className="bg-transparent border-none focus:ring-0 text-sm w-48 font-medium placeholder:text-[var(--v2-on-surface-variant)]/50"
              />
            </div>
            <button className="p-2 rounded-full hover:bg-[var(--v2-surface-container-low)] transition-colors duration-300 active:scale-95">
              <span className="v2-icon text-[var(--v2-primary)]">shopping_bag</span>
            </button>
            <button className="p-2 rounded-full hover:bg-[var(--v2-surface-container-low)] transition-colors duration-300 active:scale-95">
              <span className="v2-icon text-[var(--v2-primary)]">person</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 md:pb-12 max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-[var(--v2-on-surface-variant)] text-sm font-medium">
          <Link href="/" className="hover:text-[var(--v2-primary)]">
            Home
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <Link href="/vendors" className="hover:text-[var(--v2-primary)]">
            Vendors
          </Link>
          <span className="v2-icon text-xs">chevron_right</span>
          <span className="text-[var(--v2-on-surface)]">{vendor.name}</span>
        </nav>

        {/* Vendor Profile Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Asymmetric Header Layout */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Vendor Icon */}
              <div className="w-32 h-32 rounded-3xl bg-[var(--v2-surface-container-low)] flex items-center justify-center shadow-[0_20px_40px_rgba(73,38,4,0.04)]">
                <span
                  className="v2-icon text-[var(--v2-primary)] text-6xl"
                  style={{fontVariationSettings: "'FILL' 1"}}
                >
                  {vendor.icon}
                </span>
              </div>

              {/* Vendor Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h1 className="text-4xl md:text-5xl font-black v2-headline tracking-tight text-[var(--v2-on-surface)]">
                    {vendor.name}
                  </h1>
                  <span className="bg-[var(--v2-secondary-container)] text-[var(--v2-on-secondary-container)] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    {vendor.badge}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-6 mb-6">
                  <StarRating rating={vendor.rating} />
                  <div className="flex items-center gap-2 text-[var(--v2-on-surface-variant)]">
                    <span className="v2-icon text-lg">location_on</span>
                    <span className="text-sm font-semibold">{vendor.location}</span>
                  </div>
                </div>

                <p className="text-lg text-[var(--v2-on-surface-variant)] leading-relaxed max-w-2xl">
                  {vendor.description}
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Quick Stats/Info */}
          <div className="lg:col-span-4 bg-[var(--v2-surface-container-lowest)] p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(73,38,4,0.04)] space-y-6">
            <h3 className="v2-headline font-bold text-xl text-[var(--v2-on-surface)]">
              Bakery Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--v2-on-surface-variant)] font-medium">
                  Delivery Speed
                </span>
                <span className="text-[var(--v2-on-surface)] font-bold">
                  {vendor.deliverySpeed}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[var(--v2-on-surface-variant)] font-medium">Categories</span>
                <div className="flex gap-2">
                  {vendor.categories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-[var(--v2-surface-container-low)] text-[var(--v2-on-surface-variant)] text-xs font-bold px-2 py-1 rounded-md"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <button className="w-full bg-[var(--v2-surface-container-high)] text-[var(--v2-primary)] font-bold py-4 rounded-xl hover:opacity-80 transition-opacity active:scale-[0.98]">
                Contact Vendor
              </button>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black v2-headline text-[var(--v2-on-surface)]">
                Gift Products ({products.length})
              </h2>
              <div className="h-1.5 w-24 v2-hero-gradient rounded-full"></div>
            </div>
            <button className="flex items-center gap-2 text-[var(--v2-primary)] font-bold hover:underline">
              View all catalog
              <span className="v2-icon">arrow_forward</span>
            </button>
          </div>

          {/* Bento-style Product Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Product Cards */}
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-[var(--v2-surface-container-lowest)] rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_rgba(73,38,4,0.04)] transition-all duration-500 hover:shadow-[0_30px_60px_rgba(73,38,4,0.1)] hover:-translate-y-2"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--v2-surface-container)]">
                  {/* Placeholder for image */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--v2-surface-container-high)] to-[var(--v2-surface-container)]">
                    <span
                      className="v2-icon text-8xl text-[var(--v2-outline-variant)]"
                      style={{fontVariationSettings: "'FILL' 1"}}
                    >
                      cake
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-6 left-6 flex gap-2">
                    {product.badges.map((badge, index) => (
                      <span
                        key={badge}
                        className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${
                          index === 0
                            ? 'bg-white/90 backdrop-blur-md text-[var(--v2-on-surface)]'
                            : 'bg-[var(--v2-primary)] text-[var(--v2-on-primary)]'
                        }`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black v2-headline text-[var(--v2-on-surface)] mb-2">
                        {product.name}
                      </h3>
                      <div className="flex gap-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[var(--v2-on-surface-variant)] text-xs font-bold uppercase tracking-widest"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[var(--v2-primary)]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>

                  <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed mb-8">
                    {product.description}
                  </p>

                  <button className="w-full v2-hero-gradient text-[var(--v2-on-primary)] v2-headline font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-transform duration-300 active:scale-[0.95]">
                    <span className="v2-icon" style={{fontVariationSettings: "'FILL' 1"}}>
                      card_giftcard
                    </span>
                    Send as Gift
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State/Placeholder for curated look */}
            <div className="hidden lg:flex flex-col items-center justify-center border-4 border-dashed border-[var(--v2-outline-variant)]/20 rounded-[2.5rem] p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-[var(--v2-surface-container-low)] rounded-full flex items-center justify-center">
                <span className="v2-icon text-[var(--v2-outline-variant)] text-3xl">add</span>
              </div>
              <h4 className="v2-headline font-bold text-lg text-[var(--v2-on-surface-variant)]">
                Stay Tuned
              </h4>
              <p className="text-[var(--v2-on-surface-variant)] text-sm">
                More curated delights coming soon to the bakery catalog.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--v2-surface-container-lowest)] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1 space-y-6">
              <span className="text-2xl font-black text-[var(--v2-on-surface)] tracking-tight v2-headline">
                The Warm Curator
              </span>
              <p className="text-[var(--v2-on-surface-variant)] text-sm leading-relaxed">
                A boutique platform dedicated to the art of giving. We curate experiences that
                bridge distances and celebrate connections.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all"
                >
                  <span className="v2-icon text-xl">share</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-[var(--v2-surface-container-low)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all"
                >
                  <span className="v2-icon text-xl">public</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="v2-headline font-bold text-[var(--v2-on-surface)] mb-6">
                Quick Links
              </h4>
              <ul className="space-y-4 text-[var(--v2-on-surface-variant)] font-medium">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[var(--v2-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="v2-headline font-bold text-[var(--v2-on-surface)] mb-6">Support</h4>
              <ul className="space-y-4 text-[var(--v2-on-surface-variant)] font-medium">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-[var(--v2-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="v2-headline font-bold text-[var(--v2-on-surface)] mb-6">Newsletter</h4>
              <p className="text-[var(--v2-on-surface-variant)] text-sm mb-4">
                Subscribe for curation updates and exclusive vendor drops.
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="email@warmcurator.com"
                  className="w-full bg-[var(--v2-surface-container-low)] border-none rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-[var(--v2-primary)]/20"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-[var(--v2-primary)] text-[var(--v2-on-primary)] px-4 rounded-lg text-xs font-bold uppercase tracking-widest">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-10 border-t border-[var(--v2-outline-variant)]/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[var(--v2-on-surface-variant)] text-xs font-medium">
             © 2026 Gifthance. All rights reserved.
            </p>
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-[var(--v2-on-surface-variant)]">
              <a href="#" className="hover:text-[var(--v2-primary)]">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[var(--v2-primary)]">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
