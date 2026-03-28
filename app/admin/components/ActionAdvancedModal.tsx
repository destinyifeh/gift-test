'use client';

import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
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

  const handleConfirm = () => {
    onConfirm({days, reason});
    setReason('');
    onOpenChange(false);
  };

  const isDestructive = ['ban', 'delete', 'remove', 'reject', 'cancel'].includes(type);

  return (
    <ResponsiveModal open={isOpen} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3 mb-1">
            {getIcon(type)}
            <ResponsiveModalTitle>{getTitle(type, targetType)}</ResponsiveModalTitle>
          </div>
          <ResponsiveModalDescription>
            Confirm the <strong className="text-foreground">{type}</strong> action for{' '}
            <strong className="text-foreground">{targetName}</strong>. This action will be logged.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="px-4 md:px-6 py-4 space-y-4">
          {type === 'suspend' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suspension Duration</Label>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="21">21 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Reason for {type}
            </Label>
            <Textarea
              placeholder={`Enter the reason for this ${type} action...`}
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This will be recorded in the admin logs
            </p>
          </div>
        </div>

        <ResponsiveModalFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'hero'}
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="w-full sm:w-auto h-11">
            Confirm {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
