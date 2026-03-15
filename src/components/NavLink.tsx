'use client';

import {cn} from '@/lib/utils';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {forwardRef, ReactNode} from 'react';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  onClick?: () => void;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({className, activeClassName, href, children, ...props}, ref) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}>
        {children}
      </Link>
    );
  },
);

NavLink.displayName = 'NavLink';

export {NavLink};
