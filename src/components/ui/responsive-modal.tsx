'use client';

import * as React from 'react';
import {useIsMobile} from '@/hooks/use-mobile';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import {cn} from '@/lib/utils';

interface ResponsiveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const ResponsiveModal = ({children, ...props}: ResponsiveModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Drawer {...props}>{children}</Drawer>;
  }

  return <Dialog {...props}>{children}</Dialog>;
};

const ResponsiveModalTrigger = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerTrigger className={className} {...props}>
        {children}
      </DrawerTrigger>
    );
  }

  return (
    <DialogTrigger className={className} {...props}>
      {children}
    </DialogTrigger>
  );
};

interface ResponsiveModalContentProps extends React.ComponentProps<typeof DialogContent> {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveModalContent = ({
  children,
  className,
  ...props
}: ResponsiveModalContentProps) => {
  const isMobile = useIsMobile();

  // Check if V2 styling is being used (contains --v2- CSS variables or v2- prefix)
  const isV2 = className?.includes('--v2-') || className?.includes('v2-');

  if (isMobile) {
    return (
      <DrawerContent
        className={cn(
          'max-h-[90vh]',
          className,
        )}
        {...(props as any)}>
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent
      className={cn(
        'sm:max-w-[480px] overflow-hidden border shadow-2xl rounded-2xl',
        className,
      )}
      {...props}>
      {children}
    </DialogContent>
  );
};

const ResponsiveModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader className={className} {...props} />;
  }

  return <DialogHeader className={cn('p-6 pb-0', className)} {...props} />;
};

const ResponsiveModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerFooter
        className={cn('pb-safe sticky bottom-0', className)}
        {...props}
      />
    );
  }

  return <DialogFooter className={cn('p-6 pt-4 gap-3', className)} {...props} />;
};

const ResponsiveModalTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle className={className} {...props} />;
  }

  return <DialogTitle className={className} {...props} />;
};

const ResponsiveModalDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription className={className} {...props} />;
  }

  return <DialogDescription className={className} {...props} />;
};

const ResponsiveModalClose = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogClose>) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerClose className={className} {...props}>
        {children}
      </DrawerClose>
    );
  }

  return (
    <DialogClose className={className} {...props}>
      {children}
    </DialogClose>
  );
};

export {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalClose,
};
