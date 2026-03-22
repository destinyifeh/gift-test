'use client';

import {Badge} from '@/components/ui/badge';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {getCurrencyMetadata} from '@/lib/constants/currencies';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {CreditCard, Gift, Search} from 'lucide-react';
import {useState} from 'react';

interface GiftSelectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  amount: number | null;
  setAmount: (amount: number | null) => void;
  customAmount: string;
  setCustomAmount: (amount: string) => void;
  selectedGift: number | null;
  setSelectedGift: (id: number | null) => void;
  minAmount?: number;
  campaignTitle?: string;
  target?: string;
  profileTheme?: {
    primary: string;
    background: string;
    text: string;
  };
  onGiftShopClick?: () => void;
  acceptMoney?: boolean;
  acceptVendor?: boolean;
  currencySymbol?: string;
  currencyCode?: string;
  vendorGifts?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
    profiles?: {
      display_name: string;
      country: string;
    };
  }[];
}

const GiftSelection = ({
  activeTab,
  onTabChange,
  amount,
  setAmount,
  customAmount,
  setCustomAmount,
  selectedGift,
  setSelectedGift,
  minAmount = 0,
  campaignTitle,
  target,
  profileTheme,
  onGiftShopClick,
  acceptMoney = true,
  acceptVendor = true,
  currencySymbol = '$',
  currencyCode = 'NGN',
  vendorGifts,
}: GiftSelectionProps) => {
  const [giftSearch, setGiftSearch] = useState('');

  const displayVendorGifts = vendorGifts || [];
  const currencyMetadata = getCurrencyMetadata(currencyCode);
  const suggestedAmounts = currencyMetadata?.suggestedAmounts || [
    10, 20, 50, 100, 200,
  ];
  const filteredVendorGifts = displayVendorGifts.filter(
    g =>
      !giftSearch ||
      g.name.toLowerCase().includes(giftSearch.toLowerCase()) ||
      g.profiles?.display_name
        ?.toLowerCase()
        .includes(giftSearch.toLowerCase()),
  );

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        {!campaignTitle && acceptMoney && acceptVendor && (
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger
              value="money"
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
              <CreditCard className="w-4 h-4" /> Choose Amount
            </TabsTrigger>
            <TabsTrigger
              value="vendor"
              className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold">
              <Gift className="w-4 h-4" /> Send a Gift Card
            </TabsTrigger>
          </TabsList>
        )}

        {campaignTitle && (
          <div className="flex items-center gap-2 py-4 mb-2 text-sm font-bold text-foreground border-b border-border/50">
            <CreditCard className="w-5 h-5 text-primary" /> Monetary
            Contribution
          </div>
        )}

        <TabsContent value="money" className="space-y-6 mt-6">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <Label className="mb-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Amount
              </Label>
              {minAmount > 0 && (
                <Badge variant="default" className="text-[10px] h-5 font-bold">
                  Min. {currencySymbol}
                  {minAmount}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2 pb-1">
              {suggestedAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => {
                    setAmount(a);
                    setCustomAmount('');
                  }}
                  disabled={minAmount > a}
                  className={`h-12 rounded-xl border-2 text-sm font-bold transition-all transform active:scale-95 ${
                    amount === a
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-border text-foreground hover:border-primary/40'
                  } ${minAmount > a ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                  style={
                    amount === a && profileTheme
                      ? {
                          borderColor: profileTheme.primary,
                          color: profileTheme.primary,
                          backgroundColor: `${profileTheme.primary}10`,
                        }
                      : {}
                  }>
                  {currencySymbol}
                  {a}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-lg transition-colors group-focus-within:text-primary">
                  {currencySymbol}
                </span>
                <Input
                  type="number"
                  placeholder={minAmount > 0 ? `${minAmount}+` : 'Custom'}
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value);
                    setAmount(null);
                  }}
                  className="text-center font-bold text-lg h-14 pl-8 border-2 rounded-xl focus-visible:ring-0 focus-visible:border-primary transition-all"
                />
              </div>
              {minAmount > 0 &&
                customAmount &&
                Number(customAmount) < minAmount && (
                  <p className="text-[10px] text-destructive text-center font-bold animate-pulse">
                    Minimum amount required is {currencySymbol}
                    {minAmount}
                  </p>
                )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vendor" className="space-y-4 mt-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search gift cards..."
              value={giftSearch}
              onChange={e => setGiftSearch(e.target.value)}
              className="pl-10 h-11 border-2 rounded-xl focus-visible:ring-0 focus-visible:border-primary transition-all bg-muted/20"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredVendorGifts.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGift(g.id)}
                className={`w-full p-3 rounded-xl border-2 text-left flex items-center justify-between transition-all group ${
                  selectedGift === g.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40 shadow-none hover:shadow-sm'
                }`}
                style={
                  profileTheme
                    ? ({
                        '--primary': profileTheme.primary,
                      } as React.CSSProperties)
                    : {}
                }>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shadow-sm">
                    {g.image_url ? (
                      <img
                        src={g.image_url}
                        alt={g.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{g.name.split(' ')[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm leading-none">
                      {g.image_url
                        ? g.name
                        : g.name.split(' ').slice(1).join(' ') || g.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium line-clamp-1">
                      {g.description || 'Verified gift card • Instant delivery'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-primary text-base text-right shrink-0">
                  {g.profiles?.country
                    ? getCurrencySymbol(
                        getCurrencyByCountry(g.profiles.country),
                      )
                    : currencySymbol}
                  {g.price.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GiftSelection;
