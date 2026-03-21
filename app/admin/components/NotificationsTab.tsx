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
import {Textarea} from '@/components/ui/textarea';
import {Bell, Mail} from 'lucide-react';
import {toast} from 'sonner';

export function NotificationsTab() {
  const handlePush = () => {
    toast.success('Broadcast message queued for delivery!');
  };

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
              <Button variant="hero" onClick={handlePush}>
                <Mail className="w-4 h-4 mr-1" /> Send Email Broadcast
              </Button>
              <Button variant="outline" onClick={handlePush}>
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
          <div className="p-4 text-center border-dashed border-2 border-border text-muted-foreground text-sm rounded-lg">
            No recent system-bound push notifications found.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
