import {
  AlertTriangle,
  DollarSign,
  Flag,
  Info,
  Key,
  Pause,
  Play,
  Trash2,
  X,
} from 'lucide-react';
import React from 'react';
import {toast} from 'sonner';

export const statusBadge = (s: string) => {
  if (['active', 'completed', 'paid', 'approved'].includes(s))
    return 'secondary';
  if (['pending', 'suspended'].includes(s)) return 'outline';
  if (['rejected', 'expired', 'flagged', 'cancelled'].includes(s))
    return 'destructive';
  return 'default';
};

export const getTitle = (type: string, targetType: string) => {
  switch (type) {
    case 'warn':
      return 'Issue Warning';
    case 'suspend':
      return 'Temporary Suspension';
    case 'ban':
      return 'Permanent Ban';
    case 'flag':
      return 'Flag Record';
    case 'restrict':
      return 'Restrict Wallet';
    case 'reject':
      return 'Reject Request';
    case 'delete':
      return `Delete ${targetType.charAt(0).toUpperCase() + targetType.slice(1)}`;
    case 'remove':
      return 'Remove Admin';
    case 'disable':
      return 'Disable Integration';
    case 'activate':
      return 'Activate Item';
    case 'pause':
      return 'Pause Campaign';
    case 'resume':
      return 'Resume Campaign';
    case 'invalidate':
      return 'Invalidate Code';
    case 'generate':
      return 'Generate API Key';
    case 'unsuspend':
      return 'Unsuspend/Unrestrict Item';
    case 'feature':
      return 'Feature Campaign';
    case 'unfeature':
      return 'Unfeature Campaign';
    case 'approve':
      return 'Approve Withdrawal';
    case 'pay':
      return 'Mark as Paid';
    case 'cancel':
      return 'Cancel Subscription';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const getIcon = (type: string) => {
  switch (type) {
    case 'warn':
      return React.createElement(AlertTriangle, {
        className: 'w-6 h-6 text-yellow-500',
      });
    case 'suspend':
    case 'pause':
    case 'disable':
    case 'unfeature':
      return React.createElement(Pause, {className: 'w-6 h-6 text-orange-500'});
    case 'resume':
    case 'activate':
    case 'unsuspend':
    case 'feature':
    case 'approve':
      return React.createElement(Play, {className: 'w-6 h-6 text-secondary'});
    case 'pay':
      return React.createElement(DollarSign, {className: 'w-6 h-6 text-hero'});
    case 'ban':
    case 'delete':
    case 'remove':
    case 'invalidate':
    case 'cancel':
      return React.createElement(Trash2, {
        className: 'w-6 h-6 text-destructive',
      });
    case 'flag':
      return React.createElement(Flag, {className: 'w-6 h-6 text-red-500'});
    case 'restrict':
    case 'reject':
      return React.createElement(X, {className: 'w-6 h-6 text-destructive'});
    case 'generate':
      return React.createElement(Key, {className: 'w-6 h-6 text-hero'});
    default:
      return React.createElement(Info, {className: 'w-6 h-6 text-hero'});
  }
};

export const handleExport = (
  format: 'csv' | 'excel' | 'pdf',
  context: string,
) => {
  const filename = `${context.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.${format}`;
  toast.promise(new Promise(resolve => setTimeout(resolve, 800)), {
    loading: `Preparing ${format.toUpperCase()} export for ${context}...`,
    success: `Successfully exported ${filename}`,
    error: 'Failed to generate export',
  });
};
