'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useUserStore} from '@/lib/store/useUserStore';
import {Camera, Link as LinkIcon} from 'lucide-react';

export function SettingsTab() {
  const user = useUserStore(state => state.user);
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Account Settings</h3>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 sm:w-16 h-14 sm:h-16 border-2 border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user?.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="w-4 h-4" /> Change Photo
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input defaultValue={user?.display_name || ''} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input defaultValue={user?.username || ''} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Email</Label>
              <Input defaultValue={user?.email || ''} type="email" />
            </div>
          </div>
          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Social Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Twitter / X</Label>
                <Input defaultValue="@destiny_dev" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instagram</Label>
                <Input defaultValue="@destiny.dev" />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Website</Label>
                <Input defaultValue="https://destiny.dev" />
              </div>
            </div>
          </div>
          <Button variant="hero">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
