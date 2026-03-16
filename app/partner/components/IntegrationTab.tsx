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
import {ExternalLink, Globe, Key, RefreshCcw, UserPlus} from 'lucide-react';
import {useState} from 'react';

export function IntegrationTab() {
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Credentials
          </CardTitle>
          <Button variant="outline" size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" /> Rotate Keys
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-body">
              API Key
            </Label>
            <div className="flex gap-2">
              <Input
                value="pk_test_51MzS2I2s6o9P8A"
                readOnly
                className="bg-muted font-mono"
              />
              <Button variant="secondary">Copy</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-body">
              Secret Key
            </Label>
            <div className="flex gap-2">
              <Input
                type={showSecret ? 'text' : 'password'}
                value="sk_test_8s7d9f8a7s9d8f7a9s8d7f8"
                readOnly
                className="bg-muted font-mono"
              />
              <Button
                variant="ghost"
                onClick={() => setShowSecret(!showSecret)}>
                {showSecret ? 'Hide' : 'Show'}
              </Button>
              <Button variant="secondary">Copy</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-secondary" />
              Webhook Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="https://your-api.com/webhooks/gifthance" />
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" className="flex-1">
                Save Endpoint
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Test Webhook
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              Creator Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Onboarding Method</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto Create Accounts</SelectItem>
                  <SelectItem value="manual">Manual Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" /> Invite New Creators
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="link" className="text-primary font-semibold">
          View Documentation <ExternalLink className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
