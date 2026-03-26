'use client';

import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Link as LinkIcon, Mail, Send, CalendarClock, Info, Search} from 'lucide-react';
import {useEffect, useState} from 'react';
import {createClient} from '@/lib/server/supabase/client';

interface GiftDetailsStepProps {
  giftType: 'money' | 'gift-card' | null;
  amount: string;
  setAmount: (v: string) => void;
  giftId: number | null;
  setGiftId: (v: number | null) => void;
  message: string;
  setMessage: (v: string) => void;
  // Delivery TypeProps
  deliveryType: 'direct' | 'claim-link';
  setDeliveryType: (v: 'direct' | 'claim-link') => void;
  recipientEmail: string;
  setRecipientEmail: (v: string) => void;
  senderName: string;
  setSenderName: (v: string) => void;
  isAnonymous: boolean;
  setIsAnonymous: (v: boolean) => void;
  // Delivery Time Props
  deliveryTime: 'now' | 'schedule';
  setDeliveryTime: (v: 'now' | 'schedule') => void;
  scheduledFor: string;
  setScheduledFor: (v: string) => void;
}

export function GiftDetailsStep({
  giftType,
  amount,
  setAmount,
  giftId,
  setGiftId,
  message,
  setMessage,
  deliveryType,
  setDeliveryType,
  recipientEmail,
  setRecipientEmail,
  senderName,
  setSenderName,
  isAnonymous,
  setIsAnonymous,
  deliveryTime,
  setDeliveryTime,
  scheduledFor,
  setScheduledFor,
}: GiftDetailsStepProps) {
  const [vendorGifts, setVendorGifts] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (giftType === 'gift-card') {
      const fetchGifts = async () => {
        const supabase = createClient();
        const {data} = await supabase
          .from('vendor_gifts')
          .select('id, name, price, profiles!vendor_gifts_vendor_id_fkey(shop_name, display_name)')
          .eq('is_active', true);
        if (data) setVendorGifts(data);
      };
      fetchGifts();
    }
  }, [giftType]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-4">
          Gift Details
        </h2>
      </div>

      {giftType === 'money' ? (
        <div className="space-y-3">
          <Label>Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
              ₦
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Select Gift Card</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search available vendor gift cards..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {vendorGifts
              .filter(
                g =>
                  !search ||
                  g.name.toLowerCase().includes(search.toLowerCase()) ||
                  (g.profiles?.shop_name || g.profiles?.display_name || '').toLowerCase().includes(search.toLowerCase()),
              )
              .map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGiftId(g.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${
                    giftId === g.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30'
                  }`}>
                  <div className="flex-1 mr-4">
                    <p className="font-semibold text-sm capitalize line-clamp-1">{g.name}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {g.profiles?.shop_name || g.profiles?.display_name || 'Vendor Shop'}
                    </p>
                  </div>
                  <span className="font-bold text-primary flex-shrink-0 text-sm">
                    ₦{Number(g.price).toLocaleString()}
                  </span>
                </button>
              ))}
            {vendorGifts.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading available gift cards...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-border">
        <Label>Personal Message (optional)</Label>
        <Textarea
          placeholder="Add a nice note for the recipient..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="mt-2 resize-none"
        />
      </div>

      {/* --- Delivery Options --- */}
      <div className="pt-6 border-t border-border space-y-8">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">
            How do you want to send this gift?
          </h3>
          <div className="space-y-3">
            {/* Direct Send Checkbox Card */}
            <div 
              onClick={() => setDeliveryType('direct')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryType === 'direct' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                deliveryType === 'direct' ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {deliveryType === 'direct' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Mail className={`w-4 h-4 ${deliveryType === 'direct' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-sm">Send directly to someone</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">We'll email them the gift securely.</p>
                
                {deliveryType === 'direct' && (
                  <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <Label className="text-xs">Recipient Email</Label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Claim Link Checkbox Card */}
            <div 
              onClick={() => setDeliveryType('claim-link')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryType === 'claim-link' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                deliveryType === 'claim-link' ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {deliveryType === 'claim-link' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <LinkIcon className={`w-4 h-4 ${deliveryType === 'claim-link' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-sm">Create a claim link</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Anyone with the link can claim this gift.</p>
                
                {deliveryType === 'claim-link' && (
                  <div className="mt-3 p-3 rounded-lg bg-orange-50/50 border border-orange-100 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-orange-800 leading-relaxed font-medium">
                      A unique claim link will be generated after payment. You can share it anywhere!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">
              When should we send this?
            </h3>
          </div>
          <div className="space-y-3">
            {/* Send Now Checkbox Card */}
            <div 
              onClick={() => setDeliveryTime('now')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                deliveryTime === 'now' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                deliveryTime === 'now' ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {deliveryTime === 'now' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Send className={`w-4 h-4 ${deliveryTime === 'now' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-sm">Send Now</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Deliver immediately after payment.</p>
              </div>
            </div>

            {/* Schedule Checkbox Card */}
            <div 
              onClick={() => deliveryType !== 'claim-link' && setDeliveryTime('schedule')}
              className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                deliveryTime === 'schedule' 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                  : deliveryType === 'claim-link'
                    ? 'border-muted bg-muted/20 cursor-not-allowed opacity-60'
                    : 'border-border hover:border-primary/30 cursor-pointer'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                deliveryTime === 'schedule' ? 'bg-primary border-primary' : 'border-muted-foreground/30'
              }`}>
                {deliveryTime === 'schedule' && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CalendarClock className={`w-4 h-4 ${deliveryTime === 'schedule' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-bold text-sm">Schedule for later</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {deliveryType === 'claim-link' ? 'Scheduling unavailable for claim links.' : 'Choose a future date and time.'}
                </p>
                
                {deliveryTime === 'schedule' && deliveryType !== 'claim-link' && (
                  <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <Label className="text-xs">Select Date and Time</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={e => setScheduledFor(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="h-9 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-sm">Your Name (optional)</Label>
            <Input
              placeholder="E.g. John Doe"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              className="h-10 text-sm"
            />
          </div>
          <div className="flex items-center space-x-3 pt-6 sm:pt-9">
            <input
              type="checkbox"
              id="is-anon-gift"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary h-5 w-5 bg-card"
            />
            <Label htmlFor="is-anon-gift" className="text-sm cursor-pointer font-medium">
              Hide my name from recipient
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
