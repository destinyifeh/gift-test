'use client';

import {cn} from '@/lib/utils';
import Link from 'next/link';
import {useRouter} from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="v2-theme min-h-screen bg-[var(--v2-background)] flex flex-col items-center justify-center p-6 text-[var(--v2-on-surface)] selection:bg-[var(--v2-primary-container)] selection:text-[var(--v2-on-primary-container)]">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--v2-primary-fixed)] opacity-5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--v2-tertiary-fixed)] opacity-5 blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-[480px] text-center">
        {/* Animated Illustration Area */}
        <div className="relative mb-12 flex justify-center">
          <div className="relative group">
            {/* Soft shadow/glow */}
            <div className="absolute inset-0 bg-[var(--v2-primary)] opacity-10 blur-2xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
            
            {/* Main Error Number */}
            <h1 className="v2-headline relative text-[140px] md:text-[180px] font-black leading-none tracking-tighter bg-gradient-to-b from-[var(--v2-primary)] to-[var(--v2-primary-fixed)] bg-clip-text text-transparent select-none animate-in fade-in zoom-in duration-1000">
              404
            </h1>
            
            {/* Floating Icons */}
            <div className="absolute top-0 -left-8 animate-bounce delay-75">
              <span className="v2-icon text-4xl text-[var(--v2-tertiary)] opacity-40">pest_control</span>
            </div>
            <div className="absolute bottom-4 -right-8 animate-bounce delay-300">
              <span className="v2-icon text-4xl text-[var(--v2-primary)] opacity-40">explore</span>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-4 mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-200">
          <h2 className="v2-headline text-3xl md:text-4xl font-bold text-[var(--v2-on-surface)]">
            Lost in the gallery?
          </h2>
          <p className="text-lg text-[var(--v2-on-surface-variant)] leading-relaxed max-w-[400px] mx-auto opacity-80">
            The page you're looking for has wandered off our curated shelves. 
            Let's guide you back to something beautiful.
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-500">
          <Link href="/" className="group">
            <button className="v2-btn-primary w-full h-14 flex items-center justify-center gap-3 px-6 shadow-lg shadow-[rgba(150,67,0,0.15)] hover:shadow-[rgba(150,67,0,0.25)] hover:scale-[1.02] transition-all">
              <span className="v2-icon text-xl">home</span>
              <span>Go Home</span>
            </button>
          </Link>

          <button 
            onClick={() => router.back()}
            className="v2-btn-secondary w-full h-14 flex items-center justify-center gap-3 px-6 border border-[var(--v2-outline-variant)]/20 hover:bg-[var(--v2-surface-container-high)] hover:scale-[1.02] transition-all text-[var(--v2-primary)]"
          >
            <span className="v2-icon text-xl">arrow_back</span>
            <span>Step Back</span>
          </button>
        </div>

        {/* Curation Links */}
        <div className="mt-16 pt-10 border-t border-[var(--v2-outline-variant)]/10 animate-in fade-in duration-1000 delay-700">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--v2-on-surface-variant)] opacity-60 mb-6">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-3 px-4">
            {[
              { label: 'Gifts', href: '/gifts', icon: 'shopping_bag' },
              { label: 'Campaigns', href: '/campaigns', icon: 'auto_awesome' },
              { label: 'My Wallet', href: '/dashboard/wallet', icon: 'account_balance_wallet' },
              { label: 'Help', href: '/help', icon: 'support_agent' },
            ].map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--v2-surface-container-low)] hover:bg-[var(--v2-surface-container)] transition-colors text-sm font-semibold text-[var(--v2-on-surface)] border border-[var(--v2-outline-variant)]/5"
              >
                <span className="v2-icon text-lg opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-0 right-0 text-center animate-in fade-in duration-1000 delay-1000">
        <p className="text-xs font-medium text-[var(--v2-on-surface-variant)] opacity-40">
          &copy; {new Date().getFullYear()} Gifthance &bull; Curating moments of joy.
        </p>
      </footer>
    </div>
  );
}
