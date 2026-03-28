'use client';

import {cn} from '@/lib/utils';

interface DashboardStatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: 'primary' | 'secondary' | 'accent' | 'destructive';
  className?: string;
}

const colorMap = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  accent: 'text-accent bg-accent/10',
  destructive: 'text-destructive bg-destructive/10',
};

export function DashboardStatCard({
  icon,
  value,
  label,
  color = 'primary',
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl',
        'bg-card border border-border',
        'min-h-[72px]',
        className,
      )}>
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          colorMap[color],
        )}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-foreground truncate">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
