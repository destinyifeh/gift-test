'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
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
import {StickyFooter} from '@/components/ui/sticky-footer';
import {useIsMobile} from '@/hooks/use-mobile';
import {useProfile} from '@/hooks/use-profile';
import {PAYSTACK_COUNTRIES} from '@/lib/currencies';
import {updateProfile} from '@/lib/server/actions/auth';
import {cn} from '@/lib/utils';
import {useQueryClient} from '@tanstack/react-query';
import {Camera, Globe, Link as LinkIcon, Loader2, User} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export function SettingsTab() {
  const {data: profile, isLoading: isProfileLoading} = useProfile();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setEmail(profile.email || '');

      const social = profile.social_links || {};
      setTwitter(social.twitter || '');
      setInstagram(social.instagram || '');
      setWebsite(social.website || '');
      setCountry(profile.country || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProfile({
        display_name: displayName,
        username: username.toLowerCase(),
        country,
        social_links: {
          twitter,
          instagram,
          website,
        },
      });

      if (result.success) {
        toast.success('Account updated successfully!');
        queryClient.invalidateQueries({queryKey: ['profile']});
      } else {
        toast.error(result.error || 'Failed to update account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Profile Section */}
      <div
        className={cn(
          'p-4 rounded-xl',
          'bg-card border border-border',
        )}>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Profile</h3>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16 border-2 border-border">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold uppercase">
              {displayName?.charAt(0) || email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" className="gap-2">
            <Camera className="w-4 h-4" /> Change Photo
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Display Name</Label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-11 capitalize"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="h-11 pl-7"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Country of Residence</Label>
            <Select value={country} onValueChange={setCountry} disabled>
              <SelectTrigger className="h-11 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Select your country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {PAYSTACK_COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              This is your payout region. It cannot be changed here.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input
              value={email}
              type="email"
              disabled
              className="h-11 bg-muted/50"
            />
            <p className="text-[10px] text-muted-foreground">
              Email cannot be changed here.
            </p>
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div
        className={cn(
          'p-4 rounded-xl',
          'bg-card border border-border',
        )}>
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground">Social Links</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Twitter / X</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  x.com/
                </span>
                <Input
                  value={twitter
                    .replace('https://x.com/', '')
                    .replace('https://twitter.com/', '')}
                  onChange={e => setTwitter(e.target.value)}
                  className="h-11 pl-14"
                  placeholder="username"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Instagram</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  ig.com/
                </span>
                <Input
                  value={instagram
                    .replace('https://instagram.com/', '')
                    .replace('https://www.instagram.com/', '')}
                  onChange={e => setInstagram(e.target.value)}
                  className="h-11 pl-14"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Website</Label>
            <Input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-11"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isMobile ? (
        <StickyFooter>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </StickyFooter>
      ) : (
        <Button
          variant="hero"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      )}
    </div>
  );
}
