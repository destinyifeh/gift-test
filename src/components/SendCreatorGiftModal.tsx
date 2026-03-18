'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {allVendorGifts} from '@/lib/data/gifts';
import {ArrowRight, CreditCard, Heart} from 'lucide-react';
import {useEffect, useState} from 'react';
import GiftSelection from './GiftSelection';

interface SendCreatorGiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorName: string;
  minAmount?: number;
  initialTab?: 'money' | 'vendor';
  initialAmount?: number | null;
  initialGiftId?: number | null;
  initialCustomAmount?: string;
  initialStep?: 'details' | 'recipient';
}

const SendCreatorGiftModal = ({
  open,
  onOpenChange,
  creatorName,
  minAmount = 0,
  initialTab = 'money',
  initialAmount = null,
  initialGiftId = null,
  initialCustomAmount = '',
  initialStep = 'details',
}: SendCreatorGiftModalProps) => {
  const [step, setStep] = useState<
    'details' | 'recipient' | 'payment' | 'success'
  >(initialStep as any);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [amount, setAmount] = useState<number | null>(initialAmount);
  const [customAmount, setCustomAmount] = useState(initialCustomAmount);
  const [selectedGift, setSelectedGift] = useState<number | null>(
    initialGiftId,
  );

  useEffect(() => {
    setActiveTab(initialTab);
    setAmount(initialAmount);
    setCustomAmount(initialCustomAmount);
    setSelectedGift(initialGiftId);
    setStep(initialStep as any);
  }, [
    open,
    initialTab,
    initialAmount,
    initialGiftId,
    initialCustomAmount,
    initialStep,
  ]);

  const selectedGiftData = allVendorGifts.find(g => g.id === selectedGift);

  const handleNext = () => {
    if (step === 'details') setStep('recipient');
    else if (step === 'recipient') setStep('payment');
    else if (step === 'payment') setStep('success');
  };

  const handleBack = () => {
    if (step === 'recipient') setStep('details');
    else if (step === 'payment') setStep('recipient');
  };

  const isDetailsValid =
    activeTab === 'money'
      ? amount !== null ||
        (customAmount !== '' && Number(customAmount) >= minAmount)
      : selectedGift !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className="relative">
          <div className="bg-primary/5 px-6 pt-8 pb-6 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-14 h-14 border-4 border-background shadow-md">
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                  {creatorName?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {step === 'success'
                    ? 'Gift Sent!'
                    : `Send a Gift to ${creatorName}`}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step === 'success'
                    ? 'Thank you for your support'
                    : 'Choose something special'}
                </p>
              </div>
            </div>

            {step !== 'success' && (
              <div className="flex items-center gap-2 mt-6">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${(s === 1 && (step === 'details' || step === 'recipient' || step === 'payment')) || (s === 2 && (step === 'recipient' || step === 'payment')) || (s === 3 && step === 'payment') ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            {step === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <GiftSelection
                  activeTab={activeTab}
                  onTabChange={t => setActiveTab(t as 'money' | 'vendor')}
                  amount={amount}
                  setAmount={setAmount}
                  customAmount={customAmount}
                  setCustomAmount={setCustomAmount}
                  selectedGift={selectedGift}
                  setSelectedGift={setSelectedGift}
                  minAmount={minAmount}
                />
                <Button
                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                  disabled={!isDetailsValid}
                  onClick={handleNext}>
                  {activeTab === 'money' ? 'Send Support' : 'Send Gift Card'}{' '}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 'recipient' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Your Name
                    </Label>
                    <Input
                      placeholder="E.g. John Doe"
                      defaultValue="Destiny I."
                      className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Message (Optional)
                    </Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-xl bg-muted/20 border-2 font-medium focus:outline-none focus:border-primary transition-all resize-none text-sm"
                      placeholder="Write a sweet note..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-xl bg-muted/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    <Checkbox id="anonymous" />
                    <label
                      htmlFor="anonymous"
                      className="text-sm font-medium leading-none cursor-pointer">
                      Hide my name from recipient
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    onClick={handleNext}>
                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                      Summary
                    </p>
                    <p className="font-bold text-lg">
                      {activeTab === 'money'
                        ? 'Monetary Support'
                        : `${selectedGiftData?.name}`}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    $
                    {activeTab === 'money'
                      ? amount || customAmount
                      : selectedGiftData?.price}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                      Card Details
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="0000 0000 0000 0000"
                        className="h-12 rounded-xl bg-muted/20 border-2 font-medium pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        Expiry
                      </Label>
                      <Input
                        placeholder="MM / YY"
                        className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        CVC
                      </Label>
                      <Input
                        placeholder="123"
                        className="h-12 rounded-xl bg-muted/20 border-2 font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="h-14 px-6 rounded-2xl font-bold border-2"
                    onClick={handleBack}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-2xl"
                    onClick={handleNext}>
                    Pay Now
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-20" />
                  <Heart className="w-12 h-12 text-green-500 fill-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Awesome!</h3>
                <p className="text-muted-foreground mb-8 text-balance">
                  {activeTab === 'money' ? (
                    <>
                      Your contribution of{' '}
                      <span className="text-foreground font-bold">
                        ${amount || customAmount}
                      </span>{' '}
                      has been sent to {creatorName}.
                    </>
                  ) : (
                    <>
                      Your{' '}
                      <span className="text-foreground font-bold">
                        {selectedGiftData?.name}
                      </span>{' '}
                      worth{' '}
                      <span className="text-foreground font-bold">
                        ${selectedGiftData?.price}
                      </span>{' '}
                      has been successfully sent to {creatorName}.
                    </>
                  )}
                </p>
                <Button
                  className="w-full h-14 rounded-2xl font-bold text-lg"
                  onClick={() => onOpenChange(false)}>
                  Back to Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendCreatorGiftModal;
