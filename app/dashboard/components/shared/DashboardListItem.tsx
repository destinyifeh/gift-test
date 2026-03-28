'use client';

import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';
import {ChevronRight} from 'lucide-react';

interface DashboardListItemProps {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  amount?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  trailing?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function DashboardListItem({
  icon,
  iconBg = 'bg-primary/10 text-primary',
  title,
  subtitle,
  amount,
  badge,
  trailing,
  onClick,
  showChevron = false,
  className,
}: DashboardListItemProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        'bg-card border border-border',
        onClick && 'hover:border-primary/30 hover:bg-muted/30 active:scale-[0.99] cursor-pointer',
        'min-h-[64px]',
        className,
      )}>
      {/* Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          iconBg,
        )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-foreground text-sm truncate capitalize">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {amount && (
          <span className="font-bold text-foreground text-sm">{amount}</span>
        )}
        {badge && (
          <Badge variant={badge.variant as any} className="text-[10px] h-5 px-2">
            {badge.label}
          </Badge>
        )}
        {trailing}
        {showChevron && onClick && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
    </Component>
  );
}
