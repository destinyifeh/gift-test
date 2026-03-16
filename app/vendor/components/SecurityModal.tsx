'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input as UIInput} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Shield} from 'lucide-react';

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
  const [password, setPassword] = require('react').useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-sm mx-4 border-border shadow-elevated">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">
              Security Verification
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your password to confirm
            </p>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <UIInput
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => {
                onConfirm(password);
                setPassword('');
              }}
              disabled={!password}>
              Confirm
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClose();
                setPassword('');
              }}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
