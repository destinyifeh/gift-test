'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground">General Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Platform Name</Label>
              <Input defaultValue="Gifthance" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Support Email</Label>
              <Input defaultValue="support@gifthance.com" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Payment Providers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Stripe', 'Paystack', 'Flutterwave'].map(p => (
              <div
                key={p}
                className="p-3 rounded-xl border-2 border-border text-center">
                <p className="text-sm font-medium text-foreground">{p}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  Connected
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground">
            Platform Fees & Limits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Platform Fee (%)</Label>
              <Input defaultValue="5" type="number" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Minimum Withdrawal</Label>
              <Input defaultValue="10" type="number" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Maximum Gift Amount</Label>
              <Input defaultValue="10000" type="number" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Partner Revenue Share (%)</Label>
              <Input defaultValue="2" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardContent className="p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Require email verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Users must verify email before withdrawing
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Two-factor authentication for admins
                </p>
                <p className="text-xs text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
      <Button variant="hero">Save Settings</Button>
    </div>
  );
}
