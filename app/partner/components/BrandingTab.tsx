'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Globe, Layout, Palette, ShieldCheck, Upload} from 'lucide-react';

export function BrandingTab() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                White Label Enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Your platform is currently on the Pro Plan
              </p>
            </div>
          </div>
          <Badge variant="secondary">Active</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Layout className="w-4 h-4 text-secondary" />
              General Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">
                Remove Gifthance Branding
              </Label>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Platform Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm">
                  Upload Logo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent" />
              Color Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Brand Color</Label>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded bg-primary border border-border" />
                <Input defaultValue="#7C3AED" className="bg-muted" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This color will be used for buttons, links, and highlights.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Domain URL</Label>
            <Input
              defaultValue="support.blogsite.com"
              placeholder="support.yourdomain.com"
            />
          </div>
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs font-bold text-foreground mb-2">
              DNS Instructions
            </p>
            <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
              Point your CNAME record to{' '}
              <code className="text-primary">cname.gifthance.com</code> and wait
              for DNS propagation.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button variant="hero" size="lg" className="px-8 shadow-glow">
          Apply Branding
        </Button>
      </div>
    </div>
  );
}

import {Badge} from '@/components/ui/badge';
