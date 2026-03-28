'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Textarea} from '@/components/ui/textarea';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {updateProfile} from '@/lib/server/actions/auth';
import {verifyPaymentAndUpgrade} from '@/lib/server/actions/transactions';
import {useUserStore} from '@/lib/store/useUserStore';
import {cn} from '@/lib/utils';
import {useQueryClient} from '@tanstack/react-query';
import {AnimatePresence, motion} from 'framer-motion';
import {
  CheckCircle,
  ChevronDown,
  Crown,
  Eye,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Palette,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

interface GiftPageTabProps {
  creatorPlan: 'free' | 'pro';
  setCreatorPlan: (plan: 'free' | 'pro') => void;
}

// Collapsible Section Component
function SettingsSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('rounded-xl border border-border overflow-hidden', isOpen && 'bg-card')}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'text-left transition-colors',
          isOpen ? 'bg-muted/30' : 'bg-card hover:bg-muted/20',
        )}>
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <span className="font-semibold text-foreground">{title}</span>
          {badge && (
            <Badge variant="default" className="text-[10px]">{badge}</Badge>
          )}
        </div>
        <ChevronDown className={cn('w-5 h-5 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: 'auto', opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}>
            <div className="p-4 pt-0 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GiftPageTab({creatorPlan, setCreatorPlan}: GiftPageTabProps) {
  const user = useUserStore(state => state.user);
  const {data: profile, isLoading: isProfileLoading} = useProfile();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [bio, setBio] = useState('');
  const [suggestedAmounts, setSuggestedAmounts] = useState('5, 10, 20');
  const [acceptMoney, setAcceptMoney] = useState(true);
  const [showSupporters, setShowSupporters] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);

  const [proTheme, setProTheme] = useState('warm');
  const [proBanner, setProBanner] = useState('');
  const [proThankYou, setProThankYou] = useState('Thank you so much for your generous gift! 🎉');
  const [proRemoveBranding, setProRemoveBranding] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('hsl(16 85% 60%)');
  const [bgColor, setBgColor] = useState('hsl(30 50% 98%)');
  const [textColor, setTextColor] = useState('hsl(20 25% 12%)');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setSuggestedAmounts(profile.suggested_amounts?.join(', ') || '5, 10, 25');

      const theme = profile.theme_settings || {};
      setAcceptMoney(theme.acceptMoney ?? true);
      setShowSupporters(theme.showSupporters ?? true);
      setShowAmounts(theme.showAmounts ?? true);

      setProTheme(theme.proTheme || 'warm');
      setProBanner(theme.proBanner || '');
      setProThankYou(theme.proThankYou || 'Thank you so much for your generous gift! 🎉');
      setProRemoveBranding(theme.proRemoveBranding ?? true);
      setPrimaryColor(theme.primaryColor || 'hsl(16 85% 60%)');
      setBgColor(theme.bgColor || 'hsl(30 50% 98%)');
      setTextColor(theme.textColor || 'hsl(20 25% 12%)');
    }
  }, [profile]);

  const handleThemeChange = (val: string) => {
    setProTheme(val);
    const themes: Record<string, {primary: string; bg: string; text: string}> = {
      default: {primary: 'hsl(16 85% 60%)', bg: 'hsl(30 50% 98%)', text: 'hsl(20 25% 12%)'},
      warm: {primary: 'hsl(16 85% 60%)', bg: 'hsl(30 50% 98%)', text: 'hsl(20 25% 12%)'},
      ocean: {primary: 'hsl(200 85% 60%)', bg: 'hsl(210 50% 98%)', text: 'hsl(220 25% 12%)'},
      forest: {primary: 'hsl(140 65% 45%)', bg: 'hsl(120 30% 98%)', text: 'hsl(150 25% 12%)'},
      dark: {primary: 'hsl(260 85% 65%)', bg: 'hsl(230 25% 10%)', text: 'hsl(0 0% 98%)'},
      minimal: {primary: 'hsl(0 0% 10%)', bg: 'hsl(0 0% 100%)', text: 'hsl(0 0% 5%)'},
    };
    if (themes[val]) {
      setPrimaryColor(themes[val].primary);
      setBgColor(themes[val].bg);
      setTextColor(themes[val].text);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const amounts = suggestedAmounts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const result = await updateProfile({
        bio,
        suggested_amounts: amounts,
        theme_settings: {
          acceptMoney,
          showSupporters,
          showAmounts,
          proTheme,
          proBanner,
          proThankYou,
          proRemoveBranding,
          primaryColor,
          bgColor,
          textColor,
        },
      });

      if (result.success) {
        toast.success('Settings saved!');
        queryClient.invalidateQueries({queryKey: ['profile']});
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user?.email) {
      toast.error('User email not found. Please log in again.');
      return;
    }

    const {default: PaystackPop} = await import('@paystack/inline-js');
    const paystack = new (PaystackPop as any)();
    paystack.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 10000 * 100,
      onSuccess: async (transaction: any) => {
        setIsSaving(true);
        try {
          const result = await verifyPaymentAndUpgrade(transaction.reference);
          if (result.success) {
            toast.success('Successfully upgraded to Pro! 🚀');
            await queryClient.invalidateQueries({queryKey: ['profile']});
          } else {
            toast.error(result.error || 'Upgrade failed after payment.');
          }
        } catch (error: any) {
          toast.error(error.message || 'An error occurred during upgrade.');
        } finally {
          setIsSaving(false);
        }
      },
      onCancel: () => toast.info('Payment cancelled.'),
    });
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 md:pb-0">
      {/* Live Banner */}
      <div
        className={cn(
          'p-4 rounded-xl',
          creatorPlan === 'pro'
            ? 'bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20'
            : 'bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20',
        )}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {creatorPlan === 'pro' ? (
              <Crown className="w-5 h-5 text-accent" />
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
            <div>
              <p className="font-semibold text-foreground">
                Your gift page is live! 🎉
                <Badge variant={creatorPlan === 'pro' ? 'default' : 'outline'} className="ml-2">
                  {creatorPlan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                gifthance.com/u/{profile?.username || user?.username || '[username]'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Link href={`/u/${profile?.username || user?.username || ''}`}>
                <Eye className="w-4 h-4 mr-1" /> View
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={async () => {
                const url = `https://gifthance.com/u/${profile?.username || user?.username}`;
                if (navigator.share) {
                  try {
                    await navigator.share({title: 'My Gift Page', url});
                  } catch {
                    navigator.clipboard.writeText(url);
                    toast.success('Link copied!');
                  }
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied!');
                }
              }}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {creatorPlan === 'free' && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/20">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-accent" /> Upgrade to Pro
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Remove branding and unlock powerful customization tools.
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm text-muted-foreground">
                {[
                  'Remove branding',
                  'Custom themes',
                  'Supporter insights',
                  'Custom thank-you',
                  'Priority support',
                  'Custom banner',
                ].map(f => (
                  <span key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" /> {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-center w-full lg:w-auto">
              <Button variant="hero" onClick={handleUpgrade} disabled={isSaving} className="w-full lg:w-auto">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crown className="w-4 h-4 mr-2" />}
                Upgrade to Pro
              </Button>
              <p className="text-xs text-muted-foreground mt-2">$8/month or $79/year</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <SettingsSection title="Bio & Amounts" icon={<Sparkles className="w-4 h-4" />} defaultOpen>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            placeholder="Tell your supporters about yourself..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Suggested Amounts</Label>
          <Input
            placeholder="e.g. 5, 10, 25"
            value={suggestedAmounts}
            onChange={e => setSuggestedAmounts(e.target.value)}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">Comma-separated values</p>
        </div>
      </SettingsSection>

      <SettingsSection title="Gift Options" icon={<Eye className="w-4 h-4" />}>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-foreground text-sm">Accept money gifts</p>
            <p className="text-xs text-muted-foreground">People can send you money directly</p>
          </div>
          <Switch checked={acceptMoney} onCheckedChange={setAcceptMoney} />
        </div>
      </SettingsSection>

      <SettingsSection title="Visibility" icon={<Eye className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Show supporters</p>
              <p className="text-xs text-muted-foreground">Display supporter names on your page</p>
            </div>
            <Switch checked={showSupporters} onCheckedChange={setShowSupporters} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Show amounts</p>
              <p className="text-xs text-muted-foreground">Display gift amounts publicly</p>
            </div>
            <Switch checked={showAmounts} onCheckedChange={setShowAmounts} />
          </div>
        </div>
      </SettingsSection>

      {creatorPlan === 'pro' && (
        <>
          <SettingsSection title="Theme Customization" icon={<Palette className="w-4 h-4" />} badge="Pro">
            <div className="space-y-2">
              <Label>Page Theme</Label>
              <Select value={proTheme} onValueChange={handleThemeChange}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="warm">Warm Sunset</SelectItem>
                  <SelectItem value="ocean">Ocean Blue</SelectItem>
                  <SelectItem value="forest">Forest Green</SelectItem>
                  <SelectItem value="minimal">Minimalist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {label: 'Primary', value: primaryColor, set: setPrimaryColor},
                {label: 'Background', value: bgColor, set: setBgColor},
                {label: 'Text', value: textColor, set: setTextColor},
              ].map(c => (
                <div key={c.label} className="space-y-1">
                  <Label className="text-xs">{c.label}</Label>
                  <label
                    className="block w-full h-10 rounded-lg border border-border cursor-pointer"
                    style={{background: c.value}}>
                    <input type="color" className="sr-only" onChange={e => c.set(e.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection title="Custom Banner" icon={<ImageIcon className="w-4 h-4" />} badge="Pro">
            <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={handleBannerUpload} />
            {proBanner ? (
              <div className="space-y-3">
                <div className="h-32 bg-muted rounded-lg overflow-hidden">
                  <img src={proBanner} alt="Banner" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setProBanner('')}>
                    Remove
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <label htmlFor="banner-upload" className="cursor-pointer">Change</label>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="banner-upload" className="cursor-pointer">Upload Banner</label>
                </Button>
              </div>
            )}
          </SettingsSection>

          <SettingsSection title="Branding & Messages" icon={<MessageSquare className="w-4 h-4" />} badge="Pro">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground text-sm">Remove branding</p>
                <p className="text-xs text-muted-foreground">Hide "Powered by" from your page</p>
              </div>
              <Switch checked={proRemoveBranding} onCheckedChange={setProRemoveBranding} />
            </div>
            <div className="space-y-2">
              <Label>Custom Thank-You Message</Label>
              <Textarea
                value={proThankYou}
                onChange={e => setProThankYou(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </SettingsSection>
        </>
      )}

      {/* Save Button */}
      {isMobile ? (
        <StickyFooter>
          <Button variant="hero" onClick={handleSave} disabled={isSaving} className="w-full h-12">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </StickyFooter>
      ) : (
        <Button variant="hero" onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      )}
    </div>
  );
}
