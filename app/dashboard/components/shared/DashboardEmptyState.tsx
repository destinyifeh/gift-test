'use client';

import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import Link from 'next/link';

interface DashboardEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function DashboardEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6 rounded-2xl',
        'border border-dashed border-border bg-card/50',
        className,
      )}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {description}
      </p>
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="hero" size="sm">
              {action.label}
            </Button>
          </Link>
        ) : (
          <Button variant="hero" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
