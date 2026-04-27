'use client';

import Link from 'next/link';

export function CampaignDetailFooter() {
  return (
    <footer className="hidden md:block w-full rounded-t-[2rem] mt-20 bg-[var(--v2-surface-container-low)]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-16 max-w-7xl mx-auto text-sm leading-relaxed">
        <div className="space-y-6">
          <div className="text-xl font-bold text-[var(--v2-primary)]">Gifthance</div>
          <p className="text-[var(--v2-on-surface-variant)]">
            Transforming collective giving into meaningful, curated experiences
            that celebrate human connection.
          </p>
        </div>
        <div className="space-y-6">
          <h4 className="font-bold text-[var(--v2-on-surface)]">Platform</h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="/campaigns"
                className="text-[var(--v2-on-surface-variant)] hover:underline"
              >
                Explore Campaigns
              </Link>
            </li>
            <li>
              <Link
                href="/gifts"
                className="text-[var(--v2-on-surface-variant)] hover:underline"
              >
                Gifts
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
          <h4 className="font-bold text-[var(--v2-on-surface)]">Stay Connected</h4>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all cursor-pointer">
              <span className="v2-icon">share</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--v2-surface-container)] flex items-center justify-center text-[var(--v2-primary)] hover:bg-[var(--v2-primary)] hover:text-[var(--v2-on-primary)] transition-all cursor-pointer">
              <span className="v2-icon">mail</span>
            </div>
          </div>
          <p className="text-xs text-[var(--v2-on-surface-variant)]">
            © 2024 Gifthance Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
