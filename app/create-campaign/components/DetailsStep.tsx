'use client';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';
import {
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from '@/lib/constants/currencies';
import {AlertCircle, CreditCard, Gift, Search, Upload, X} from 'lucide-react';
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
    senderEmail: string;
    setSenderEmail: (v: string) => void;
    senderName: string;
    setSenderName: (v: string) => void;
    isAnonymous: boolean;
    setIsAnonymous: (v: boolean) => void;
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
    currency: string;
    setCurrency: (v: string) => void;
  };
  description: string;
  setDescription: (v: string) => void;
  image: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  allVendorGifts: any[];
  userCountry?: string;
}

export function DetailsStep({
  category,
  claimable,
  standard,
  description,
  setDescription,
  image,
  handleImageUpload,
  onRemoveImage,
  fileInputRef,
  allVendorGifts,
  userCountry,
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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {getCurrencySymbol(standard.currency)}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={claimable.amount}
                  onChange={e => claimable.setAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
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
                      (g.profiles?.shop_name || g.profiles?.display_name || '')
                        .toLowerCase()
                        .includes(giftSearch.toLowerCase()),
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
                      <div className="flex-1 mr-4">
                        <p className="font-semibold text-sm capitalize line-clamp-1">
                          {g.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                          {g.profiles?.shop_name ||
                            g.profiles?.display_name ||
                            'Vendor'}
                        </p>
                      </div>
                      <span className="font-bold text-primary flex-shrink-0">
                        {getCurrencySymbol(standard.currency)}
                        {Number(g.price).toLocaleString()}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="rec-email">Recipient Email (required)</Label>
              <Input
                id="rec-email"
                type="email"
                required
                value={claimable.recipientEmail}
                onChange={e => claimable.setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
              />
              <p className="text-[10px] text-muted-foreground">
                To send the gift link to the recipient.
              </p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="sender-email">Your Email (required)</Label>
              <Input
                id="sender-email"
                type="email"
                required
                value={claimable.senderEmail}
                onChange={e => claimable.setSenderEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-[10px] text-muted-foreground">
                Used to send you the purchase receipt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="sender-name">Your Name (optional)</Label>
              <Input
                id="sender-name"
                value={claimable.senderName}
                onChange={e => claimable.setSenderName(e.target.value)}
                placeholder="E.g. John Doe"
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="is-anonymous-claimable"
                checked={claimable.isAnonymous}
                onChange={e => claimable.setIsAnonymous(e.target.checked)}
                className="w-4 h-4 text-primary bg-muted border-muted-foreground rounded"
              />
              <Label
                htmlFor="is-anonymous-claimable"
                className="cursor-pointer">
                Hide my name from recipient
              </Label>
            </div>
          </div>

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

          <div>
            <Label htmlFor="currency">Campaign Currency</Label>
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              This is based on your account country.
            </p>
            <Select
              disabled
              value={standard.currency}
              onValueChange={standard.setCurrency}>
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.filter(c => c.canCreate)
                  .sort((a, b) => {
                    if (userCountry && a.country === userCountry) return -1;
                    if (userCountry && b.country === userCountry) return 1;
                    return 0;
                  })
                  .map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>
                          {c.label} ({c.symbol})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {userCountry &&
              SUPPORTED_CURRENCIES.find(c => c.code === standard.currency)
                ?.country !== userCountry && (
                <div className="flex items-start gap-2 mt-2 p-2 rounded-lg bg-orange-50 border border-orange-100 text-orange-800 text-[10px] sm:text-xs">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <p>
                    You will only be able to withdraw to a{' '}
                    {
                      SUPPORTED_CURRENCIES.find(
                        c => c.code === standard.currency,
                      )?.label
                    }{' '}
                    bank account.
                  </p>
                </div>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal">Goal Amount (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {getCurrencySymbol(standard.currency)}
                </span>
                <Input
                  id="goal"
                  type="number"
                  value={standard.goal}
                  onChange={e => standard.setGoal(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="min-amount">Starting From (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  {getCurrencySymbol(standard.currency)}
                </span>
                <Input
                  id="min-amount"
                  type="number"
                  value={standard.minAmount}
                  onChange={e => standard.setMinAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
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
              className={`border-2 border-dashed border-border rounded-xl p-2 text-center hover:border-primary/30 transition-colors cursor-pointer min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden group ${image ? 'bg-muted/30' : ''}`}>
              {image ? (
                <>
                  <div className="w-full h-full flex items-center justify-center p-2 rounded-lg bg-black/5">
                    <img
                      src={image}
                      alt="Campaign Preview"
                      className="max-h-[220px] w-auto h-auto object-contain rounded-md shadow-sm transition-transform group-hover:scale-[1.02]"
                      onClick={() => fileInputRef.current?.click()}
                    />
                  </div>

                  {/* Remove Button - More visible */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onRemoveImage();
                    }}
                    className="absolute top-2 right-2 z-30 w-7 h-7 rounded-full bg-destructive/90 text-destructive-foreground shadow-lg flex items-center justify-center hover:bg-destructive hover:scale-110 transition-all border border-background/20"
                    title="Remove Image">
                    <X className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold text-white whitespace-nowrap">
                      Click image to change
                    </p>
                  </div>
                </>
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-black font-semibold">
                    Drag & drop or{' '}
                    <span className="text-primary underline">browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 1200x630
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    PNG, JPG, or JPEG (max. 2MB)
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
