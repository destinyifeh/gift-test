'use client';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {useState} from 'react';
import {getIcon, getTitle} from './utils';

interface ActionAdvancedModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  type: string;
  targetType: string;
  targetName: string;
  onConfirm: (data: {days?: string; reason: string}) => void;
}

export function ActionAdvancedModal({
  isOpen,
  onOpenChange,
  type,
  targetType,
  targetName,
  onConfirm,
}: ActionAdvancedModalProps) {
  const [days, setDays] = useState('3');
  const [reason, setReason] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon(type)}
            <DialogTitle>{getTitle(type, targetType)}</DialogTitle>
          </div>
          <DialogDescription>
            Confirm the <strong>{type}</strong> action for{' '}
            <strong>{targetName}</strong>. This action will be logged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === 'suspend' && (
            <div className="space-y-2">
              <Label>Suspension Duration</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason for {type}</Label>
            <Textarea
              placeholder={`Enter the reason for this ${type} action...`}
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={
              ['ban', 'delete', 'remove', 'reject', 'cancel'].includes(type)
                ? 'destructive'
                : 'hero'
            }
            onClick={() => {
              onConfirm({days, reason});
              setReason('');
            }}
            disabled={!reason}>
            Confirm {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
