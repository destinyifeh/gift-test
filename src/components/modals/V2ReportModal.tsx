'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createReport } from '@/lib/server/actions/moderation';
import { useProfile } from '@/hooks/use-profile';

interface V2ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'campaign' | 'user' | 'vendor' | 'gift';
  targetName: string;
}

const reasons = [
  'Inappropriate content',
  'Spam or misleading',
  'Fraudulent activity',
  'Intellectual property violation',
  'Harassment or hate speech',
  'Other'
];

export function V2ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetName
}: V2ReportModalProps) {
  const { data: profile } = useProfile();
  const [reason, setReason] = useState(reasons[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalReason = reason === 'Other' ? customReason : reason;

    if (reason === 'Other' && !customReason.trim()) {
      toast.error('Please specify a reason');
      setIsSubmitting(false);
      return;
    }

    const result = await createReport({
      targetId,
      targetType,
      targetName,
      reason: finalReason,
      reporterUsername: profile?.username || 'anonymous'
    });

    if (result.success) {
      toast.success('Report submitted. Thank you for keeping our community safe.');
      onClose();
    } else {
      toast.error(result.error || 'Failed to submit report');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
            <span className="v2-icon text-2xl">flag</span>
          </div>
          <div>
            <h3 className="text-xl font-bold v2-headline">Report {targetType}</h3>
            <p className="text-sm text-[var(--v2-on-surface-variant)]">{targetName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--v2-on-surface)] mb-2">
            Why are you reporting this?
          </p>
          <div className="grid gap-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  reason === r 
                    ? 'bg-[var(--v2-primary-container)] text-[var(--v2-primary)] ring-2 ring-[var(--v2-primary)]' 
                    : 'bg-[var(--v2-surface-container)] text-[var(--v2-on-surface-variant)] hover:bg-[var(--v2-surface-container-high)]'
                }`}
              >
                {r}
                {reason === r && <span className="v2-icon text-lg">check_circle</span>}
              </button>
            ))}
          </div>

          {reason === 'Other' && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please provide more details..."
              className="w-full px-4 py-3 bg-[var(--v2-surface-container)] rounded-2xl border-none focus:ring-2 focus:ring-[var(--v2-primary)] outline-none text-sm min-h-[100px]"
            />
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-[var(--v2-surface-container)] text-[var(--v2-on-surface)] rounded-full font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 v2-hero-gradient text-white rounded-full font-bold text-sm shadow-lg shadow-[var(--v2-primary)]/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
