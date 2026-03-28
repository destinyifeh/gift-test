'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {StickyFooter} from '@/components/ui/sticky-footer';
import {useIsMobile} from '@/hooks/use-mobile';
import {CreditCard, DollarSign, Save, Settings, Shield} from 'lucide-react';
import {toast} from 'sonner';

export function SettingsTab() {
  const isMobile = useIsMobile();

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      {/* General Settings */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Platform Name</Label>
            <Input defaultValue="Gifthance" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Support Email</Label>
            <Input defaultValue="support@gifthance.com" className="h-11" />
          </div>
        </div>
      </div>

      {/* Payment Providers */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground">Payment Providers</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['Stripe', 'Paystack', 'Flutterwave'].map(p => (
            <div
              key={p}
              className="p-4 rounded-xl border border-border bg-muted/30 text-center">
              <p className="text-sm font-medium text-foreground">{p}</p>
              <Badge className="mt-2 bg-emerald-500/10 text-emerald-500 text-xs">
                Connected
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Fees & Limits */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground">Fees & Limits</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Platform Fee (%)</Label>
            <Input defaultValue="5" type="number" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Min Withdrawal</Label>
            <Input defaultValue="10" type="number" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Gift Amount</Label>
            <Input defaultValue="10000" type="number" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Partner Share (%)</Label>
            <Input defaultValue="2" type="number" className="h-11" />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="font-semibold text-foreground">Security</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-foreground">
                Require email verification
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Users must verify email before withdrawing
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-foreground">
                Two-factor authentication
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Require 2FA for all admin accounts
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      {/* Desktop Save Button */}
      {!isMobile && (
        <Button variant="hero" onClick={handleSave} className="h-11">
          <Save className="w-4 h-4 mr-2" /> Save Settings
        </Button>
      )}

      {/* Mobile Sticky Save Button */}
      {isMobile && (
        <StickyFooter className="p-4">
          <Button variant="hero" onClick={handleSave} className="w-full h-12">
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </StickyFooter>
      )}
    </div>
  );
}
