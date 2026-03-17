'use client';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {CheckCircle, CreditCard, Gift, Search, Upload} from 'lucide-react';

import {useState} from 'react';

interface DetailsStepProps {
  category: string;
  claimable: {
    giftType: 'money' | 'gift-card';
    setGiftType: (v: 'money' | 'gift-card') => void;
    amount: string;
    setAmount: (v: string) => void;
    giftId: number | null;
    setGiftId: (v: number | null) => void;
    recipientType: 'self' | 'other';
    setRecipientType: (v: 'self' | 'other') => void;
    recipientEmail: string;
    setRecipientEmail: (v: string) => void;
  };
  standard: {
    title: string;
    setTitle: (v: string) => void;
    goal: string;
    setGoal: (v: string) => void;
    minAmount: string;
    setMinAmount: (v: string) => void;
    endDate: string;
    setEndDate: (v: string) => void;
  };
  description: string;
  setDescription: (v: string) => void;
  image: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  allVendorGifts: any[];
}

export function DetailsStep({
  category,
  claimable,
  standard,
  description,
  setDescription,
  image,
  handleImageUpload,
  fileInputRef,
  allVendorGifts,
}: DetailsStepProps) {
  const [giftSearch, setGiftSearch] = useState('');
  const isClaimable = category === 'claimable';

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Campaign Details
      </h2>

      {isClaimable ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Select Gift Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => claimable.setGiftType('money')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  claimable.giftType === 'money'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}>
                <CreditCard
                  className={`w-5 h-5 ${claimable.giftType === 'money' ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span className="text-sm font-semibold">Money</span>
              </button>
              <button
                onClick={() => claimable.setGiftType('gift-card')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  claimable.giftType === 'gift-card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}>
                <Gift
                  className={`w-5 h-5 ${claimable.giftType === 'gift-card' ? 'text-primary' : 'text-muted-foreground'}`}
                />
                <span className="text-sm font-semibold">Gift Card</span>
              </button>
            </div>
          </div>

          {claimable.giftType === 'money' ? (
            <div className="space-y-3">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="$0.00"
                value={claimable.amount}
                onChange={e => claimable.setAmount(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Label>Select Gift Card</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search gift cards..."
                  value={giftSearch}
                  onChange={e => setGiftSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2">
                {allVendorGifts
                  .filter(
                    g =>
                      !giftSearch ||
                      g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
                      g.vendor.toLowerCase().includes(giftSearch.toLowerCase()),
                  )
                  .map(g => (
                    <button
                      key={g.id}
                      onClick={() => claimable.setGiftId(g.id)}
                      className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                        claimable.giftId === g.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/20'
                      }`}>
                      <div>
                        <p className="font-semibold text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {g.vendor}
                        </p>
                      </div>
                      <span className="font-bold text-primary">${g.price}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Who is this for?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => claimable.setRecipientType('self')}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  claimable.recipientType === 'self'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border'
                }`}>
                For me
              </button>
              <button
                onClick={() => claimable.setRecipientType('other')}
                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                  claimable.recipientType === 'other'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border'
                }`}>
                Someone else
              </button>
            </div>
          </div>

          {claimable.recipientType === 'other' && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <Label htmlFor="rec-email">Recipient Email (required)</Label>
                <Input
                  id="rec-email"
                  type="email"
                  value={claimable.recipientEmail}
                  onChange={e => claimable.setRecipientEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          )}

          <div>
            <Label>Message (optional)</Label>
            <Textarea
              placeholder="Add a nice message..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              value={standard.title}
              onChange={e => standard.setTitle(e.target.value)}
              placeholder="e.g., Birthday Gift for Sarah"
            />
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell people about this gift campaign..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal">Goal Amount (optional)</Label>
              <Input
                id="goal"
                type="number"
                value={standard.goal}
                onChange={e => standard.setGoal(e.target.value)}
                placeholder="$0"
              />
            </div>
            <div>
              <Label htmlFor="min-amount">Starting From (optional)</Label>
              <Input
                id="min-amount"
                type="number"
                value={standard.minAmount}
                onChange={e => standard.setMinAmount(e.target.value)}
                placeholder="$0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="end-date">Campaign Duration / End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={standard.endDate}
                onChange={e => standard.setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="mb-0">Campaign Image</Label>
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
              {image ? (
                <>
                  <img
                    src={image}
                    alt="Campaign Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-2">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-white">
                      Custom Image Uploaded
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      Click to change or upload another
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-black font-semibold">
                    Drag & drop or{' '}
                    <span className="text-primary underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1200x630
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PNG, JPG, or GIF (max. 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
