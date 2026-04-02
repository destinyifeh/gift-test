'use client';

import Link from 'next/link';

export function CampaignFooter() {
  return (
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
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                How it works
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                Success Stories
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                Gift Guides
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
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
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                Trust & Safety
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[var(--v2-primary)] transition-colors">
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
            Get updates on the most impactful campaigns directly in your inbox.
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
            NGN
          </span>
        </div>
      </div>
    </footer>
  );
}
