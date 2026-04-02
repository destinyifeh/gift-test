'use client';

import {cn} from '@/lib/utils';
import {formatCurrency} from '@/lib/utils/currency';
import {QRCodeSVG} from 'qrcode.react';

export type FlexCardStatus = 'active' | 'partially_used' | 'redeemed';

export interface FlexCardProps {
  code: string;
  initialAmount: number;
  currentBalance: number;
  currency?: string;
  status: FlexCardStatus;
  senderName?: string;
  message?: string;
  createdAt?: string;
  variant?: 'full' | 'compact' | 'mini';
  showQR?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FlexCard({
  code,
  initialAmount,
  currentBalance,
  currency = 'NGN',
  status,
  senderName,
  message,
  createdAt,
  variant = 'full',
  showQR = true,
  onClick,
  className,
}: FlexCardProps) {
  const usedAmount = initialAmount - currentBalance;
  const usagePercent = (usedAmount / initialAmount) * 100;

  const statusConfig = {
    active: {
      label: 'Active',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
    },
    partially_used: {
      label: 'Partially Used',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-500',
    },
    redeemed: {
      label: 'Redeemed',
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      gradientFrom: 'from-gray-400',
      gradientTo: 'to-gray-500',
    },
  };

  const config = statusConfig[status];

  if (variant === 'mini') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]',
          status === 'redeemed' ? 'bg-gray-100 opacity-60' : 'bg-gradient-to-r ' + config.gradientFrom + ' ' + config.gradientTo,
          className,
        )}>
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
          <span className="v2-icon text-white text-lg">card_giftcard</span>
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-white text-sm">Flex Card</p>
          <p className="text-white/80 text-xs">{code}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">{formatCurrency(currentBalance, currency)}</p>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] text-left',
          status === 'redeemed' ? 'bg-gray-100' : 'bg-gradient-to-br ' + config.gradientFrom + ' ' + config.gradientTo,
          className,
        )}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="v2-icon text-white/90">card_giftcard</span>
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Flex Card</span>
            </div>
            <p className="font-mono text-white text-sm">{code}</p>
          </div>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', config.bgColor, config.color)}>
            {config.label}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/60 text-xs mb-0.5">Balance</p>
            <p className="font-extrabold text-white text-2xl">{formatCurrency(currentBalance, currency)}</p>
          </div>
          {senderName && (
            <p className="text-white/70 text-xs">From: {senderName}</p>
          )}
        </div>

        {status !== 'active' && (
          <div className="mt-3">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/50 rounded-full transition-all"
                style={{width: `${usagePercent}%`}}
              />
            </div>
            <p className="text-white/60 text-[10px] mt-1">
              {formatCurrency(usedAmount, currency)} used of {formatCurrency(initialAmount, currency)}
            </p>
          </div>
        )}
      </button>
    );
  }

  // Full variant
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-3xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        status === 'redeemed' ? 'bg-gray-200' : 'bg-gradient-to-br ' + config.gradientFrom + ' ' + config.gradientTo,
        className,
      )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="v2-icon text-white text-xl">card_giftcard</span>
              <span className="text-white/80 text-sm font-bold uppercase tracking-wider">Gifthance Flex</span>
            </div>
            <p className="font-mono text-white/70 text-xs">{code}</p>
          </div>
          <span className={cn('px-3 py-1 rounded-full text-xs font-bold uppercase', config.bgColor, config.color)}>
            {config.label}
          </span>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-1">Available Balance</p>
          <p className="font-extrabold text-white text-4xl tracking-tight">
            {formatCurrency(currentBalance, currency)}
          </p>
          {status !== 'active' && (
            <p className="text-white/60 text-sm mt-1">
              of {formatCurrency(initialAmount, currency)} original
            </p>
          )}
        </div>

        {/* Progress bar */}
        {status !== 'active' && (
          <div className="mb-6">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all"
                style={{width: `${100 - usagePercent}%`}}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            {senderName && (
              <div className="mb-2">
                <p className="text-white/50 text-xs">From</p>
                <p className="text-white font-medium">{senderName}</p>
              </div>
            )}
            {message && (
              <p className="text-white/70 text-sm italic max-w-[200px] truncate">"{message}"</p>
            )}
            {createdAt && (
              <p className="text-white/50 text-xs mt-2">
                {new Date(createdAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* QR Code */}
          {showQR && status !== 'redeemed' && (
            <div className="bg-white rounded-xl p-2">
              <QRCodeSVG
                value={code}
                size={80}
                level="M"
                bgColor="transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper component for FlexCard data from server actions
export interface FlexCardComponentProps {
  card: {
    id: number;
    code: string;
    initial_amount: number;
    current_balance: number;
    currency: string;
    status: 'active' | 'partially_used' | 'redeemed';
    sender_name?: string | null;
    message?: string | null;
    created_at?: string;
    sender?: {
      display_name: string;
      username: string;
    };
  };
  variant?: 'full' | 'compact' | 'mini';
  showQR?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FlexCardComponent({card, variant = 'compact', showQR = true, onClick, className}: FlexCardComponentProps) {
  return (
    <FlexCard
      code={card.code}
      initialAmount={card.initial_amount}
      currentBalance={card.current_balance}
      currency={card.currency}
      status={card.status}
      senderName={card.sender?.display_name || card.sender_name || undefined}
      message={card.message || undefined}
      createdAt={card.created_at}
      variant={variant}
      showQR={showQR}
      onClick={onClick}
      className={className}
    />
  );
}

// Display component for flex card in a list
export function FlexCardListItem({
  code,
  initialAmount,
  currentBalance,
  currency = 'NGN',
  status,
  senderName,
  createdAt,
  onClick,
}: Omit<FlexCardProps, 'variant' | 'showQR' | 'message' | 'className'>) {
  const config = {
    active: {label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100'},
    partially_used: {label: 'Partially Used', color: 'text-amber-600', bg: 'bg-amber-100'},
    redeemed: {label: 'Redeemed', color: 'text-gray-500', bg: 'bg-gray-100'},
  }[status];

  return (
    <button
      onClick={onClick}
      className="w-full bg-[var(--v2-surface-container-lowest)] rounded-2xl p-4 flex items-center gap-4 hover:bg-[var(--v2-surface-container-low)] transition-colors text-left">
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center',
        status === 'redeemed' ? 'bg-gray-100' : 'bg-gradient-to-br from-emerald-500 to-teal-500',
      )}>
        <span className={cn('v2-icon text-xl', status === 'redeemed' ? 'text-gray-400' : 'text-white')}>
          card_giftcard
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[var(--v2-on-surface)]">Flex Card</p>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', config.bg, config.color)}>
            {config.label}
          </span>
        </div>
        <p className="font-mono text-xs text-[var(--v2-on-surface-variant)]">{code}</p>
        {senderName && (
          <p className="text-xs text-[var(--v2-on-surface-variant)] mt-0.5">From: {senderName}</p>
        )}
      </div>

      <div className="text-right">
        <p className="font-bold text-lg text-[var(--v2-primary)]">
          {formatCurrency(currentBalance, currency)}
        </p>
        {currentBalance !== initialAmount && (
          <p className="text-xs text-[var(--v2-on-surface-variant)]">
            of {formatCurrency(initialAmount, currency)}
          </p>
        )}
      </div>
    </button>
  );
}
