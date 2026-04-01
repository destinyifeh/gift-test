'use client';

import {CreditCard, Gift} from 'lucide-react';
import {motion} from 'framer-motion';

interface SelectGiftStepProps {
  giftType: 'money' | 'gift-card' | null;
  setGiftType: (v: 'money' | 'gift-card') => void;
}

export function SelectGiftStep({giftType, setGiftType}: SelectGiftStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Choose a Gift Type
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Send a specific vendor gift card, or let them decide with a cash gift.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.button
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
          onClick={() => setGiftType('gift-card')}
          className={`p-6 rounded-2xl border-2 text-left flex flex-col items-center gap-3 transition-all ${
            giftType === 'gift-card'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/30'
          }`}>
          <div className={`p-3 rounded-full ${giftType === 'gift-card' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Gift className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-foreground">Vendor Gift Card</h3>
            <p className="text-xs text-muted-foreground mt-1">Send a prepaid digital gift card from verified vendors.</p>
          </div>
        </motion.button>

        <motion.button
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
          onClick={() => setGiftType('money')}
          className={`p-6 rounded-2xl border-2 text-left flex flex-col items-center gap-3 transition-all ${
            giftType === 'money'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/30'
          }`}>
          <div className={`p-3 rounded-full ${giftType === 'money' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <CreditCard className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-foreground">Cash Gift</h3>
            <p className="text-xs text-muted-foreground mt-1">Flexible cash gift they can use anywhere.</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
