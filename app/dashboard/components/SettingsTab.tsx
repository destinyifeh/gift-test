import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {useProfile} from '@/hooks/use-profile';
import {PAYSTACK_COUNTRIES} from '@/lib/currencies';
import {updateProfile} from '@/lib/server/actions/auth';
import {useQueryClient} from '@tanstack/react-query';
import {Camera, Globe, Link as LinkIcon, Loader2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

export function SettingsTab() {
  const {data: profile, isLoading: isProfileLoading} = useProfile();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from profile
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
        // Invalidate queries to ensure real-time updates
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Account Settings</h3>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 sm:w-16 h-14 sm:h-16 border-2 border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold uppercase">
                {displayName?.charAt(0) || email?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-2">
              <Camera className="w-4 h-4" /> Change Photo
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Display Name</Label>
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="capitalize"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="pl-7"
                  placeholder="username"
                />
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Country of Residence</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
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
              <p className="text-[10px] text-muted-foreground mt-1">
                Changing your country of residence will affect your currency and
                payout options.
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Email (Cannot be changed here)</Label>
              <Input
                value={email}
                type="email"
                disabled
                className="bg-muted/50"
              />
            </div>
          </div>
          <div className="border-t border-border pt-4 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Social Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Twitter / X</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    x.com/
                  </span>
                  <Input
                    value={twitter
                      .replace('https://x.com/', '')
                      .replace('https://twitter.com/', '')}
                    onChange={e => setTwitter(e.target.value)}
                    className="pl-14"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Instagram</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ig.com/
                  </span>
                  <Input
                    value={instagram
                      .replace('https://instagram.com/', '')
                      .replace('https://www.instagram.com/', '')}
                    onChange={e => setInstagram(e.target.value)}
                    className="pl-14"
                    placeholder="username"
                  />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs">Website</Label>
                <Input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
          <Button
            variant="hero"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
