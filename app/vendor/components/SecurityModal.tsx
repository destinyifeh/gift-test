'use client';

import {Button} from '@/components/ui/button';
import {Input as UIInput} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {Shield} from 'lucide-react';
import {useState} from 'react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
}

export function SecurityModal({
  isOpen,
  onClose,
  onConfirm,
}: SecurityModalProps) {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
  };

  const handleClose = () => {
    onClose();
    setPassword('');
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={open => !open && handleClose()}>
      <ResponsiveModalContent className="sm:max-w-sm">
        <ResponsiveModalHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <ResponsiveModalTitle>Security Verification</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Enter your password to confirm this action
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="security-password">Password</Label>
            <UIInput
              id="security-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11"
              onKeyDown={e => {
                if (e.key === 'Enter' && password) {
                  handleConfirm();
                }
              }}
            />
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant="hero"
            onClick={handleConfirm}
            disabled={!password}
            className="w-full sm:w-auto h-11">
            Confirm
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
