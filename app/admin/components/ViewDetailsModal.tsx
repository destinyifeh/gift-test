'use client';

import {Button} from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {cn} from '@/lib/utils';
import {Eye, Store} from 'lucide-react';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: any;
}

export function ViewDetailsModal({
  isOpen,
  onOpenChange,
  title,
  data,
}: ViewDetailsModalProps) {
  if (!data) return null;

  // Format key names for display
  const formatKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Filter out sensitive or internal fields
  const displayData = Object.entries(data).filter(
    ([key]) => !['password', 'raw_user_meta_data', 'raw_app_meta_data'].includes(key),
  );

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-2xl">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {title}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Detailed view of the selected record
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {displayData.map(([key, value]) => (
              <div
                key={key}
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-3',
                  'border-b border-border last:border-0',
                )}>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatKey(key)}
                </span>
                <span className="sm:col-span-2 text-sm text-foreground break-all font-mono">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          {data.shop_slug && (
            <Button
              variant="hero"
              onClick={() =>
                window.open(`/gift-shop/${data.shop_slug}`, '_blank')
              }
              className="w-full sm:w-auto h-11">
              <Store className="w-4 h-4 mr-2" />
              View Shop
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11">
            Close
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
