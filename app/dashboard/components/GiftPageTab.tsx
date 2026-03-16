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
import {
  CheckCircle,
  Crown,
  Eye,
  Image,
  MessageSquare,
  Palette,
  Settings,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {mockUser as user} from './mock';

interface GiftPageTabProps {
  creatorPlan: 'free' | 'pro';
  setCreatorPlan: (plan: 'free' | 'pro') => void;
}

export function GiftPageTab({creatorPlan, setCreatorPlan}: GiftPageTabProps) {
  const [proTheme, setProTheme] = useState('default');
  const [proBanner, setProBanner] = useState('');
  const [proThankYou, setProThankYou] = useState(
    'Thank you so much for your generous gift! 🎉',
  );
  const [proRemoveBranding, setProRemoveBranding] = useState(true);
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
              gifttogether.com/{user.username}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/u/${user.username}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
            </Link>
            <Link href="/profile/settings">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1" /> Edit
              </Button>
            </Link>
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
                  <Select value={proTheme} onValueChange={setProTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="warm">Warm Sunset</SelectItem>
                      <SelectItem value="ocean">Ocean Blue</SelectItem>
                      <SelectItem value="forest">Forest Green</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {name: 'Primary Color', color: 'hsl(16 85% 60%)'},
                    {name: 'Background', color: 'hsl(30 50% 98%)'},
                    {name: 'Text Color', color: 'hsl(20 25% 12%)'},
                  ].map(c => (
                    <div key={c.name} className="space-y-1">
                      <Label className="text-xs">{c.name}</Label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border border-border"
                          style={{background: c.color}}
                        />
                        <Input defaultValue={c.color} className="text-xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Image className="w-4 h-4" /> Custom Banner{' '}
                  <Badge variant="default" className="text-xs">
                    Pro
                  </Badge>
                </h4>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  {proBanner ? (
                    <div className="space-y-2">
                      <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        Banner Preview
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProBanner('')}>
                        Remove Banner
                      </Button>
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
                        onClick={() => setProBanner('banner.jpg')}>
                        Upload Banner
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

          <Button variant="hero">Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
