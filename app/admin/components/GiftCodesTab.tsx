'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Ban, Download, Tag} from 'lucide-react';
import React, {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {statusBadge} from './utils';

interface GiftCodesTabProps {
  giftCodes: any[];
  setGiftCodes: React.Dispatch<React.SetStateAction<any[]>>;
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function GiftCodesTab({
  giftCodes,
  setGiftCodes,
  searchQuery,
  addLog,
  setViewDetailsModal,
}: GiftCodesTabProps) {
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'invalidate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'invalidate',
    targetId: '',
    targetName: '',
  });

  const handleAdvancedAction = (
    type: any,
    targetType: string,
    targetId: string,
    targetName: string,
  ) => {
    setAdvancedModal({
      isOpen: true,
      type,
      targetId,
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetName, targetId} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed code ${targetName}. Reason: ${data.reason}`;

    if (type === 'invalidate') {
      setGiftCodes(prev =>
        prev.map(c => (c.code === targetId ? {...c, status: 'expired'} : c)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onInvalidate = (code: string) => {
    handleAdvancedAction('invalidate', 'gift', code, code);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{giftCodes.length} codes</p>
        <div className="flex gap-2">
          <Button variant="hero" size="sm">
            <Tag className="w-4 h-4 mr-1" /> Generate Codes
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" /> Import
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Code</th>
              <th className="text-left py-2 font-medium">Vendor</th>
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-left py-2 font-medium">Redeemed By</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {giftCodes
              .filter(
                c =>
                  c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.vendor.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(c => (
                <tr
                  key={c.code}
                  className="border-b border-border last:border-0">
                  <td className="py-3 font-mono font-semibold text-foreground">
                    {c.code}
                  </td>
                  <td className="py-3 text-foreground">{c.vendor}</td>
                  <td className="py-3 text-foreground">{c.product}</td>
                  <td className="py-3">
                    <Badge variant={statusBadge(c.status) as any}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {c.redeemedBy || '—'}
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInvalidate(c.code)}>
                      <Ban className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type}
        targetType="gift"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}
