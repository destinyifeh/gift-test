'use client';

import Link from 'next/link';
import {Gift} from 'lucide-react';

interface GifthanseLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

function LogoIcon({size}: {size: 'sm' | 'md' | 'lg'}) {
  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`${containerSizes[size]} rounded-xl bg-gradient-to-b from-amber-300 to-orange-800 flex items-center justify-center`}
    >
      <Gift className={`${iconSizes[size]} text-white`} />
    </div>
  );
}

export function GifthanceLogo({size = 'md', showText = true, href = '/v2', className = ''}: GifthanseLogoProps) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const gaps = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
  };

  const content = (
    <div className={`flex items-center ${gaps[size]} ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className={`${textSizes[size]} font-bold text-orange-900 tracking-tight font-headline`}>
          Gifthance
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

export function GifthanseLogoIcon({size = 'md'}: {size?: 'sm' | 'md' | 'lg'}) {
  return <LogoIcon size={size} />;
}
