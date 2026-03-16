'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Palette, Settings, Smartphone, Type} from 'lucide-react';
import {useState} from 'react';

export function WidgetTab() {
  const [btnColor, setBtnColor] = useState('#7C3AED');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5 text-primary" />
            Widget Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 font-body">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Button Text
            </Label>
            <Input defaultValue="Support Creator" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Button Color
            </Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={btnColor}
                onChange={e => setBtnColor(e.target.value)}
                className="w-12 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={btnColor}
                readOnly
                className="max-w-[100px] bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Suggested Amounts</Label>
            <div className="flex gap-2">
              {['5', '10', '25', 'Custom'].map(amt => (
                <div
                  key={amt}
                  className="flex-1 text-center py-2 bg-muted rounded border border-border text-sm font-medium">
                  {amt !== 'Custom' ? `$${amt}` : amt}
                </div>
              ))}
            </div>
          </div>

          <Button variant="hero" className="w-full mt-4">
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground mb-4">
          <Smartphone className="w-5 h-5 text-secondary" />
          Preview
        </h3>
        <Card className="border-border overflow-hidden bg-muted/30 p-8 flex items-center justify-center min-h-[400px]">
          <div className="w-[320px] bg-background border border-border rounded-3xl shadow-elevated p-6 space-y-6 relative">
            <div className="w-16 h-1 w-full bg-border rounded-full mb-4 mx-auto max-w-[60px]" />
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto" />
              <h4 className="font-bold">John Writer</h4>
              <p className="text-xs text-muted-foreground font-body">
                Author of "The Future of Tech"
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['$5', '$10', '$25'].map(a => (
                <div
                  key={a}
                  className="p-2 border border-border rounded-lg text-center text-sm font-semibold">
                  {a}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Input placeholder="Custom Amount" className="h-10 text-center" />
              <Button
                className="w-full h-12 rounded-xl text-white font-bold tracking-wide"
                style={{backgroundColor: btnColor}}>
                Support Creator
              </Button>
            </div>
            <div className="pt-4 text-center">
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 font-body">
                Powered by{' '}
                <span className="font-bold text-foreground">Gatherly</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
