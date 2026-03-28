'use client';

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
import {Textarea} from '@/components/ui/textarea';
import {Bell, Mail, Send} from 'lucide-react';
import {toast} from 'sonner';

export function NotificationsTab() {
  const handlePush = () => {
    toast.success('Broadcast message queued for delivery!');
  };

  return (
    <div className="space-y-6">
      {/* Send Announcement */}
      <div className="rounded-xl bg-card border border-border p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Send Platform Announcement</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Audience</Label>
            <Select defaultValue="all">
              <SelectTrigger className="h-11">
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">Subject</Label>
            <Input placeholder="Announcement subject" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Message</Label>
            <Textarea placeholder="Write your announcement..." rows={4} className="resize-none" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="hero" onClick={handlePush} className="h-11 flex-1 sm:flex-none">
              <Mail className="w-4 h-4 mr-2" /> Send Email
            </Button>
            <Button variant="outline" onClick={handlePush} className="h-11 flex-1 sm:flex-none">
              <Bell className="w-4 h-4 mr-2" /> Push Notification
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="rounded-xl bg-card border border-border p-4 md:p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Notifications Sent</h3>
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <Send className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">
            No recent notifications found
          </p>
        </div>
      </div>
    </div>
  );
}
