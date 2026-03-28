'use client';

import {cn} from '@/lib/utils';

interface StickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyFooter({children, className}: StickyFooterProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 md:relative',
        'bg-background/95 backdrop-blur-lg border-t border-border',
        'p-4 pb-safe',
        'md:bg-transparent md:border-t-0 md:p-0 md:pb-0',
        className,
      )}>
      {children}
    </div>
  );
}
