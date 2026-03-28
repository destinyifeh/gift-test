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
import {AlertTriangle} from 'lucide-react';

interface ActionConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
}

export function ActionConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = 'default',
}: ActionConfirmModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            {variant === 'destructive' && (
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            )}
            <div>
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-2">
                {description}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'hero'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full sm:w-auto h-11">
            Confirm
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
