'use client';

import Navbar from '@/components/landing/Navbar';
import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {ArrowLeft, Camera, Eye, Link as LinkIcon, Save} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

export default function ProfileSettingsPage() {
  const [username, setUsername] = useState('destiny');
  const [name, setName] = useState('Destiny O.');
  const [bio, setBio] = useState(
    'Frontend developer. Appreciate your support! 🚀',
  );
  const [twitter, setTwitter] = useState('@destiny_dev');
  const [instagram, setInstagram] = useState('@destiny.dev');
  const [website, setWebsite] = useState('https://destiny.dev');
  const [showSupporters, setShowSupporters] = useState(true);
  const [showAmounts, setShowAmounts] = useState(true);
  const [suggestedAmounts, setSuggestedAmounts] = useState('5, 10, 20');
  const [acceptMoney, setAcceptMoney] = useState(true);
  const [acceptVendorGifts, setAcceptVendorGifts] = useState(true);
  const [acceptGiftCards, setAcceptGiftCards] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                Profile & Gift Page
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Set up your permanent gift profile page
              </p>
            </div>
            <Link href={`/u/${username}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" /> Preview
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="gifts">Gift Options</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 sm:w-20 h-16 sm:h-20 border-2 border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        D
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="w-4 h-4" /> Upload Photo
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-muted-foreground">
                        gifthance.com/
                      </span>
                      <Input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="pl-32 sm:pl-36"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="border-t border-border pt-4 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Social Links
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Twitter / X</Label>
                        <Input
                          value={twitter}
                          onChange={e => setTwitter(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Instagram</Label>
                        <Input
                          value={instagram}
                          onChange={e => setInstagram(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Website</Label>
                        <Input
                          value={website}
                          onChange={e => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gifts" className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-4 sm:p-6 space-y-5">
                  <h3 className="font-semibold text-foreground">
                    Gift Options
                  </h3>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        Accept money gifts
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        People can send you money directly
                      </p>
                    </div>
                    <Switch
                      checked={acceptMoney}
                      onCheckedChange={setAcceptMoney}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        Accept vendor gifts
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Gift cards and vouchers from vendors
                      </p>
                    </div>
                    <Switch
                      checked={acceptVendorGifts}
                      onCheckedChange={setAcceptVendorGifts}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        Accept gift cards
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Allow people to send digital gift cards
                      </p>
                    </div>
                    <Switch
                      checked={acceptGiftCards}
                      onCheckedChange={setAcceptGiftCards}
                    />
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="space-y-2">
                      <Label>Suggested Amounts</Label>
                      <Input
                        value={suggestedAmounts}
                        onChange={e => setSuggestedAmounts(e.target.value)}
                        placeholder="5, 10, 25"
                      />
                      <p className="text-xs text-muted-foreground">
                        Comma-separated values shown on your gift page
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <h3 className="font-semibold text-foreground">
                      Visibility
                    </h3>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Show supporters
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Display supporter names on your page
                        </p>
                      </div>
                      <Switch
                        checked={showSupporters}
                        onCheckedChange={setShowSupporters}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          Show amounts
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Display gift amounts publicly
                        </p>
                      </div>
                      <Switch
                        checked={showAmounts}
                        onCheckedChange={setShowAmounts}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button variant="hero" className="gap-2">
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
