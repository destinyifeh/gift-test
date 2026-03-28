'use client';

import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {ArrowLeft, Home, Search} from 'lucide-react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect} from 'react';

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      pathname,
    );
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Animated 404 Illustration */}
        <div className="relative mb-8">
          {/* Background glow effect */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-primary via-secondary to-primary rounded-full scale-150" />

          {/* 404 Number */}
          <div className="relative">
            <h1 className="text-[120px] md:text-[180px] font-bold font-display leading-none text-gradient select-none">
              404
            </h1>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/20 animate-pulse" />
            <div className="absolute -bottom-2 -left-6 w-6 h-6 md:w-10 md:h-10 rounded-full bg-secondary/20 animate-pulse delay-150" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center max-w-md mx-auto space-y-3">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Page not found
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
            Let's get you back on track.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 w-full max-w-sm space-y-3 px-4">
          <Link href="/" className="block">
            <Button
              variant="hero"
              size="lg"
              className="w-full h-12 text-base font-medium">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium"
            onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-border w-full max-w-sm mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider font-medium">
            Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              {label: 'Dashboard', href: '/dashboard'},
              {label: 'Explore', href: '/explore'},
              {label: 'Send Gift', href: '/send'},
              {label: 'Help', href: '/help'},
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  'bg-muted/50 hover:bg-muted text-foreground',
                  'transition-colors duration-200',
                )}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Need help?{' '}
          <Link href="/help" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </footer>
    </div>
  );
}
