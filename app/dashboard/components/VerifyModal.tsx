'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-sm mx-4 border-border shadow-elevated">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">
              Welcome back,{' '}
              {user?.display_name || user?.email?.split('@')[0] || 'User'}! 🎁
            </h3>
            <p className="text-muted-foreground text-sm">
              Please enter your password to confirm this action.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Or we can send a verification code to {user?.email}
          </p>
          <div className="flex gap-3">
            <Button
              variant="hero"
              className="flex-1"
              onClick={onConfirm}
              disabled={!password}>
              Confirm
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
