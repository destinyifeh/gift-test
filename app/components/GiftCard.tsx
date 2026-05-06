'use client';

import {useState} from 'react';
import {cn} from '@/lib/utils';
import {formatCurrency} from '@/lib/utils/currency';
import {Gift} from 'lucide-react';
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from '@/components/ui/responsive-modal';

import {GiftCard3D} from '../gifts/components/GiftCardVariants';

export type GiftCardStatus = 'active' | 'partially_used' | 'redeemed';

export interface GiftCardProps {
  code: string;
  initialAmount: number;
  currentBalance: number;
  currency?: string;
  status: GiftCardStatus;
  senderName?: string;
  message?: string;
  createdAt?: string;
  variant?: 'full' | 'compact' | 'mini' | 'premium';
  colorVariant?: 'orange' | 'emerald';
  showQR?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  cardName?: string;
  vendorName?: string;
  icon?: string;
  description?: string;
}

export function GiftCard({
  code,
  initialAmount,
  currentBalance,
  currency = 'NGN',
  status,
  senderName,
  message,
  createdAt,
  variant = 'full',
  colorVariant = 'orange',
  showQR = true,
  interactive = true,
  onClick,
  className,
  cardName,
  vendorName,
  icon,
  description,
}: GiftCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (interactive) {
      setIsFlipped(!isFlipped);
    }
    if (onClick) {
      onClick();
    }
  };

  if (variant === 'mini') {
    return (
      <button 
        onClick={handleCardClick}
        className={cn(
          "w-full rounded-2xl p-4 flex items-center gap-4 transition-all active:scale-95 group relative overflow-hidden text-left",
          colorVariant === 'emerald' 
            ? "bg-gradient-to-br from-[#1a3d2e] to-[#0a1f16]" 
            : "bg-gradient-to-br from-[#d66514] to-[#b14902]",
          className
        )}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <Gift className="w-6 h-6 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="font-headline font-black text-white text-sm leading-none truncate max-w-[120px]">
              Gifthance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[7px] font-black uppercase text-white tracking-widest shrink-0 flex items-center justify-center min-w-[24px]">
              {icon ? (
                  <span className="v2-icon text-[10px]">{icon}</span>
              ) : (
                  vendorName ? 'Vendor' : (cardName || 'Gift')
              )}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-white font-black text-sm">{formatCurrency(currentBalance, currency)}</div>
          <div className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5 text-white/60")}>
            {status}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "perspective-1000",
        variant === 'compact' ? "w-full" : 
        variant === 'premium' ? "w-full max-w-[320px] mx-auto scale-[0.9] sm:scale-100" :
        "w-full max-w-sm",
        className
      )}
      style={{ perspective: '2000px' }}
      onClick={handleCardClick}
    >
      <div className={cn("w-full h-full", variant === 'compact' ? "" : "shadow-2xl")}>
        <div style={{ aspectRatio: '1.586/1' }}>
          <GiftCard3D
            variant={colorVariant === 'emerald' ? 'emerald' : 'orange'}
            isFlipped={isFlipped}
            onFlipToggle={setIsFlipped}
            amount={currentBalance}
            randomId={code || 'preview'}
            code={code ? (code.startsWith('GFT-') ? code : `GFT-${code}`) : ''}
            mode={interactive ? "live" : "preview"}
            cardName={cardName}
            vendorName={vendorName}
            icon={icon}
            description={description}
          />
        </div>
      </div>
    </div>
  );
}

export function GiftCardListItem({
  card,
  onClick,
  variant = 'compact',
  colorVariant = 'orange',
  showQR = false,
  className,
  interactive = true,
}: {
  card: any;
  onClick?: () => void;
  variant?: 'full' | 'compact' | 'mini' | 'premium';
  colorVariant?: 'orange' | 'emerald';
  showQR?: boolean;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <GiftCard
      code={card.code}
      initialAmount={card.initial_amount}
      currentBalance={card.current_balance}
      currency={card.currency}
      status={card.status}
      senderName={card.sender?.display_name || card.sender_name || undefined}
      message={card.message || undefined}
      createdAt={card.created_at}
      variant={variant}
      colorVariant={colorVariant}
      showQR={showQR}
      className={className}
      cardName={card.name}
      vendorName={card.vendor?.name || card.vendor_name}
      interactive={interactive}
      onClick={onClick}
    />
  );
}

export function GiftCardModal({
  card,
  open,
  onClose,
}: {
  card: any;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ResponsiveModal open={open} onOpenChange={val => !val && onClose()}>
      <ResponsiveModalContent className="bg-[var(--v2-background)] md:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6 md:p-8 flex flex-col items-center">
            <GiftCard
                code={card.code}
                initialAmount={card.initial_amount || card.initialAmount}
                currentBalance={card.current_balance || card.currentBalance}
                currency={card.currency}
                status={card.status}
                senderName={card.sender?.display_name || card.sender_name || card.senderName}
                message={card.message}
                variant="premium"
                interactive={true}
                className="w-full"
                cardName={card.name || card.cardName}
                vendorName={card.vendor?.name || card.vendor_name || card.vendorName}
            />
            {card.message && (
              <div className="mt-8 w-full p-4 rounded-2xl bg-[var(--v2-surface-container-low)] border border-[var(--v2-outline-variant)]/10">
                <p className="text-[10px] font-bold text-[var(--v2-on-surface-variant)] uppercase tracking-widest mb-2">Personal Message</p>
                <p className="text-sm text-[var(--v2-on-surface)] italic">"{card.message}"</p>
              </div>
            )}
            <button 
              onClick={onClose}
              className="mt-8 w-full h-12 bg-[var(--v2-surface-container-high)] text-[var(--v2-on-surface)] font-bold rounded-xl hover:bg-[var(--v2-outline-variant)]/20 transition-colors"
            >
              Close Preview
            </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
