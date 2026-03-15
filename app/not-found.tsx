'use client';

import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect} from 'react';

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      pathname,
    );
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold font-display text-gradient">
          404
        </h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">
          Oops! Page not found
        </p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button variant="hero" size="lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
