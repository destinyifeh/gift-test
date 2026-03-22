'use client';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-hero" /> {title}
          </DialogTitle>
          <DialogDescription>
            Detailed view of the selected record.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-3 gap-2 py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground font-semibold">
                  {key.toUpperCase()}
                </span>
                <span className="col-span-2 text-foreground break-all">
                  {typeof value === 'object'
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {data.shop_slug && (
            <Button
              variant="hero"
              onClick={() =>
                window.open(`/gift-shop/${data.shop_slug}`, '_blank')
              }>
              <Store className="w-4 h-4 mr-2" /> View Shop
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
