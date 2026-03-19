'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
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
import {useUserStore} from '@/lib/store/useUserStore';
import {
  CheckCircle,
  Crown,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Palette,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

interface GiftPageTabProps {
  creatorPlan: 'free' | 'pro';
  setCreatorPlan: (plan: 'free' | 'pro') => void;
}

export function GiftPageTab({creatorPlan, setCreatorPlan}: GiftPageTabProps) {
  const user = useUserStore(state => state.user);
  const [proTheme, setProTheme] = useState('warm');
  const [proBanner, setProBanner] = useState(
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  );
  const [proThankYou, setProThankYou] = useState(
    'Thank you so much for your generous gift! 🎉',
  );
  const [proRemoveBranding, setProRemoveBranding] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('hsl(16 85% 60%)');
  const [bgColor, setBgColor] = useState('hsl(30 50% 98%)');
  const [textColor, setTextColor] = useState('hsl(20 25% 12%)');
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeChange = (val: string) => {
    setProTheme(val);

    if (val === 'default') {
      setPrimaryColor('hsl(16 85% 60%)');
      setBgColor('hsl(30 50% 98%)');
      setTextColor('hsl(20 25% 12%)');
    } else if (val === 'warm') {
      setPrimaryColor('hsl(16 85% 60%)');
      setBgColor('hsl(30 50% 98%)');
      setTextColor('hsl(20 25% 12%)');
    } else if (val === 'ocean') {
      setPrimaryColor('hsl(200 85% 60%)');
      setBgColor('hsl(210 50% 98%)');
      setTextColor('hsl(220 25% 12%)');
    } else if (val === 'forest') {
      setPrimaryColor('hsl(140 65% 45%)');
      setBgColor('hsl(120 30% 98%)');
      setTextColor('hsl(150 25% 12%)');
    } else if (val === 'dark') {
      setPrimaryColor('hsl(260 85% 65%)');
      setBgColor('hsl(230 25% 10%)');
      setTextColor('hsl(0 0% 98%)');
    } else if (val === 'minimal') {
      setPrimaryColor('hsl(0 0% 10%)');
      setBgColor('hsl(0 0% 100%)');
      setTextColor('hsl(0 0% 5%)');
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // In a real app, this would persist the data
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Card
        className={
          creatorPlan === 'pro'
            ? 'border-accent/30 bg-accent/5'
            : 'border-primary/20 bg-primary/5'
        }>
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
              {creatorPlan === 'pro' ? (
                <Crown className="w-4 h-4 text-accent" />
              ) : (
                <Sparkles className="w-4 h-4 text-primary" />
              )}
              Your gift page is live! 🎉
              <Badge
                variant={creatorPlan === 'pro' ? 'default' : 'outline'}
                className="ml-2">
                {creatorPlan === 'pro' ? 'Pro' : 'Free'}
              </Badge>
            </p>
            <p className="text-sm text-muted-foreground">
              gifttogether.com/{user?.username || 'username'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/u/${user?.username || 'username'}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {creatorPlan === 'free' && (
        <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" /> Upgrade to Pro
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Remove branding and unlock powerful tools for your gift page.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Remove "Powered by" branding
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Custom themes and layout
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Advanced supporter insights
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Custom thank-you messages
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Priority integrations
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Custom banner images
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Supporter leaderboard
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" />{' '}
                    Email notifications
                  </span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <Button
                  variant="hero"
                  onClick={() => setCreatorPlan('pro')}
                  className="gap-2">
                  <Crown className="w-4 h-4" /> Upgrade to Pro
                </Button>
                <p className="text-xs text-muted-foreground">
                  $8/month or $79/year
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Gift Page Settings</h3>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              defaultValue="Frontend developer. Appreciate your support! 🚀"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Suggested Amounts</Label>
            <Input defaultValue="5, 10, 20" />
            <p className="text-xs text-muted-foreground text-right mt-1">
              Comma-separated values shown on your gift page
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground">
              Gift Options
            </h4>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  Accept money gifts
                </p>
                <p className="text-xs text-muted-foreground">
                  People can send you money directly
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">
                  Accept vendor gifts
                </p>
                <p className="text-xs text-muted-foreground">
                  Gift cards and vouchers from vendors
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-foreground">
              Visibility
            </h4>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Show supporters</p>
                <p className="text-xs text-muted-foreground">
                  Display supporter names on your page
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-foreground">Show amounts</p>
                <p className="text-xs text-muted-foreground">
                  Display gift amounts publicly
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          {creatorPlan === 'pro' && (
            <>
              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Palette className="w-4 h-4 text-accent" /> Theme
                  Customization{' '}
                  <Badge variant="default" className="text-xs">
                    Pro
                  </Badge>
                </h4>
                <div className="space-y-2">
                  <Label>Page Theme</Label>
                  <Select value={proTheme} onValueChange={handleThemeChange}>
                    <SelectTrigger>
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <label
                        className="w-8 h-8 rounded-lg border border-border shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm"
                        style={{background: primaryColor}}
                        title="Pick color">
                        <input
                          type="color"
                          className="sr-only"
                          value={
                            primaryColor.startsWith('hsl')
                              ? '#7C3AED'
                              : primaryColor
                          } // Fallback for HSL display
                          onChange={e => setPrimaryColor(e.target.value)}
                        />
                      </label>
                      <Input
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2">
                      <label
                        className="w-8 h-8 rounded-lg border border-border shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm"
                        style={{background: bgColor}}
                        title="Pick color">
                        <input
                          type="color"
                          className="sr-only"
                          value={
                            bgColor.startsWith('hsl') ? '#FDFCFB' : bgColor
                          }
                          onChange={e => setBgColor(e.target.value)}
                        />
                      </label>
                      <Input
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex items-center gap-2">
                      <label
                        className="w-8 h-8 rounded-lg border border-border shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-sm"
                        style={{background: textColor}}
                        title="Pick color">
                        <input
                          type="color"
                          className="sr-only"
                          value={
                            textColor.startsWith('hsl') ? '#1A1412' : textColor
                          }
                          onChange={e => setTextColor(e.target.value)}
                        />
                      </label>
                      <Input
                        value={textColor}
                        onChange={e => setTextColor(e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Custom Banner{' '}
                  <Badge variant="default" className="text-xs">
                    Pro
                  </Badge>
                </h4>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center overflow-hidden relative">
                  <input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBannerUpload}
                  />
                  {proBanner ? (
                    <div className="space-y-3">
                      <div className="h-32 bg-muted rounded-lg overflow-hidden relative">
                        <img
                          src={proBanner}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10" />
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProBanner('')}>
                          Remove Banner
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <label
                            htmlFor="banner-upload"
                            className="cursor-pointer">
                            Change Image
                          </label>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drop image or click to upload
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild>
                        <label
                          htmlFor="banner-upload"
                          className="cursor-pointer">
                          Upload Banner
                        </label>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground flex items-center gap-2 flex-wrap">
                      Remove "Powered by" Branding{' '}
                      <Badge variant="default" className="text-xs">
                        Pro
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hide platform branding from your gift page
                    </p>
                  </div>
                  <Switch
                    checked={proRemoveBranding}
                    onCheckedChange={setProRemoveBranding}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-border pt-5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Custom Thank-You Message{' '}
                  <Badge variant="default" className="text-xs">
                    Pro
                  </Badge>
                </h4>
                <Textarea
                  value={proThankYou}
                  onChange={e => setProThankYou(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  Sent to supporters after they gift you
                </p>
              </div>
            </>
          )}

          <Button
            variant="hero"
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
