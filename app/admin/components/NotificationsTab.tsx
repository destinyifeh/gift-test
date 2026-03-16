'use client';

import {Badge} from '@/components/ui/badge';
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
import {Textarea} from '@/components/ui/textarea';
import {Bell, Mail} from 'lucide-react';

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" /> Send Platform Announcement
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Audience</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="creators">Creators Only</SelectItem>
                  <SelectItem value="vendors">Vendors Only</SelectItem>
                  <SelectItem value="partners">Partners Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input placeholder="Announcement subject" />
            </div>
            <div className="space-y-1">
              <Label>Message</Label>
              <Textarea placeholder="Write your announcement..." rows={4} />
            </div>
            <div className="flex gap-2">
              <Button variant="hero">
                <Mail className="w-4 h-4 mr-1" /> Send Email Broadcast
              </Button>
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-1" /> Push Notification
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-body">
            Recent Notifications Sent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              subject: 'New Feature: Custom Domains',
              audience: 'Creators',
              date: '2026-03-08',
              type: 'Email',
            },
            {
              subject: 'System Maintenance — March 12',
              audience: 'All Users',
              date: '2026-03-05',
              type: 'Email + Push',
            },
            {
              subject: 'Holiday Gift Season Promo',
              audience: 'All Users',
              date: '2026-02-28',
              type: 'Email',
            },
          ].map((n, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {n.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  {n.audience} · {n.date}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {n.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
