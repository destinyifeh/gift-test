'use client';

import {Gift} from 'lucide-react';
import Link from 'next/link';
import {Sidebar} from './Sidebar';

interface DesktopSidebarProps {
  section: any;
  commonProps: any;
  onSignOut: () => void;
}

export function DesktopSidebar({
  section,
  commonProps,
  onSignOut,
}: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col shrink-0 sticky top-0 h-screen">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Gift className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold font-display text-foreground">
            Gifthance
          </span>
        </Link>
      </div>
      <Sidebar {...commonProps} section={section} onSignOut={onSignOut} />
    </aside>
  );
}
