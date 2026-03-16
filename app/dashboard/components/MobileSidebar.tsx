'use client';

import {Gift, X} from 'lucide-react';
import Link from 'next/link';
import {Sidebar} from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  section: any;
  commonProps: any;
  onSignOut: () => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  section,
  commonProps,
  onSignOut,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card shadow-elevated">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Gift className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display text-foreground">
              Gifthance
            </span>
          </Link>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <Sidebar {...commonProps} section={section} onSignOut={onSignOut} />
      </aside>
    </div>
  );
}
