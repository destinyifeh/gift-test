'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import {Shield} from 'lucide-react';
import {UserProfile} from '@/lib/store/useUserStore';

interface VerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  password: string;
  setPassword: (password: string) => void;
  user: UserProfile;
}

export function VerifyModal({
  isOpen,
  onClose,
  onConfirm,
  password,
  setPassword,
  user,
}: VerifyModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={open => !open && onClose()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <ResponsiveModalTitle>
              Welcome back,{' '}
              <span className="capitalize">
                {user?.display_name || user?.email?.split('@')[0] || 'User'}
              </span>
              !
            </ResponsiveModalTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Please enter your password to confirm this action.
            </p>
          </div>
        </ResponsiveModalHeader>

        <div className="p-4 md:px-6 space-y-4">
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Or we can send a verification code to {user?.email}
          </p>
        </div>

        <ResponsiveModalFooter>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="hero"
            className="flex-1"
            onClick={onConfirm}
            disabled={!password}>
            Confirm
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
