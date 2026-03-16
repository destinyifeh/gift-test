'use client';

import Navbar from '@/components/landing/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  Copy,
  CreditCard,
  Gamepad2,
  Gift,
  Globe,
  Heart,
  Link as LinkIcon,
  Loader2,
  Lock,
  Plus,
  SendHorizontal,
  Sun,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {useRef, useState} from 'react';

const steps = ['Category', 'Details', 'Visibility', 'Review'];
const categories = [
  {
    id: 'personal',
    label: 'Personal Gift',
    icon: Gift,
    desc: 'Birthday, anniversary, or special occasion',
  },
  {
    id: 'group',
    label: 'Group Gift',
    icon: Users,
    desc: 'Pool contributions from friends and family',
  },
  {
    id: 'claimable',
    label: 'Claimable / Prepaid',
    icon: CreditCard,
    desc: 'Send a gift the recipient claims later',
  },
  {
    id: 'appreciation',
    label: 'Appreciation Gifts',
    icon: Heart,
    desc: 'Thank teachers, mentors, coworkers, friends',
  },
  {
    id: 'hobby',
    label: 'Hobby & Interest Gifts',
    icon: Gamepad2,
    desc: 'For gamers, artists, sports fans, music lovers',
  },
  {
    id: 'project',
    label: 'Gift for Projects',
    icon: Briefcase,
    desc: "Support someone's creative or personal project",
  },
  {
    id: 'support',
    label: 'Support & Care Gifts',
    icon: Sun,
    desc: 'Get well soon, encouragement, tough times',
  },
  {
    id: 'holiday',
    label: 'Holiday & Seasonal Gifts',
    icon: Calendar,
    desc: "Christmas, Valentine's Day, Easter, Thanksgiving",
  },
];

export default function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [contributorsSeeEachOther, setContributorsSeeEachOther] =
    useState(true);
  const [endDate, setEndDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    // Simulate API call
    setTimeout(() => {
      setIsLaunching(false);
      setSubmitted(true);
    }, 2000);
  };

  const next = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  if (submitted) {
    const slug = title.toLowerCase().replace(/\s+/g, '-') || 'my-campaign';
    const campaignLink = `https://gifthance.com/c/${slug}`;

    const shareText = `Check out my gift campaign: ${title}`;
    const shareUrl = campaignLink;

    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: title || 'Gift Campaign',
            text: shareText,
            url: shareUrl,
          });
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert(
          'Sharing not supported on this browser. Link copied to clipboard!',
        );
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 flex flex-col items-center justify-center px-4">
          <Card className="max-w-xl w-full border-border shadow-elevated">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                  🎉 Campaign Created Successfully!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Your campaign is now live. Share it with friends and start
                  receiving gifts.
                </p>
              </div>

              <div className="space-y-6">
                {/* Link Sharing */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Campaign Link
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 bg-muted rounded-lg px-4 py-3 flex items-center gap-2 border border-border overflow-hidden">
                      <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-sm text-foreground truncate flex-1">
                        {campaignLink}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 sm:flex-none h-11 transition-all ${copied ? 'border-green-500 text-green-500' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText(campaignLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}>
                        {copied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" /> Copy link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Sharing */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Quick Share
                  </Label>
                  <Button
                    onClick={handleShare}
                    variant="hero"
                    className="w-full h-11">
                    <Plus className="w-4 h-4 mr-2" /> Share Campaign
                  </Button>
                </div>

                {/* Invite Section */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Invite Contributors
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter emails (e.g. sarah@mail.com, john@mail.com)"
                      className="bg-muted border-border"
                    />
                    <Button
                      variant="hero"
                      className="shrink-0 w-full sm:w-auto">
                      <SendHorizontal className="w-4 h-4 mr-2" /> Send Invites
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href={`/campaign/${slug}`} className="flex-1">
                    <Button variant="hero" className="w-full h-12">
                      View Campaign
                    </Button>
                  </Link>
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full h-12">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold font-display text-foreground mb-2">
            Create Campaign
          </h1>
          <p className="text-muted-foreground mb-8">
            Set up your gift campaign in a few simple steps
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    i <= step
                      ? 'bg-gradient-hero text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    i <= step
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}>
                  {s}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${i < step ? 'bg-primary' : 'bg-muted'}`}
                  />
                )}
              </div>
            ))}
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Select Gift Type
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          category === c.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}>
                        <c.icon
                          className={`w-6 h-6 mb-2 ${
                            category === c.id
                              ? 'text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <p className="font-semibold text-foreground">
                          {c.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Campaign Details
                  </h2>
                  <div>
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g., Birthday Gift for Sarah"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tell people about this gift campaign..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goal">Goal Amount (optional)</Label>
                      <Input
                        id="goal"
                        type="number"
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Recipient Email (optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={recipientEmail}
                        onChange={e => setRecipientEmail(e.target.value)}
                        placeholder="recipient@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="end-date">
                        Campaign Duration / End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Campaign Image</Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/30 transition-colors cursor-pointer min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
                      {image ? (
                        <>
                          <img
                            src={image}
                            alt="Campaign Preview"
                            className="absolute inset-0 w-full h-full object-contain opacity-20"
                          />
                          <div className="relative z-10 flex flex-col items-center">
                            <CheckCircle className="w-8 h-8 text-secondary mb-2" />
                            <p className="text-sm font-medium text-foreground">
                              Image Uploaded
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 text-center max-w-[200px]">
                              Click to change campaign cover
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-1">
                            PNG, JPG, or GIF (max. 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Campaign Visibility
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => setVisibility('public')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        visibility === 'public'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}>
                      <Globe
                        className={`w-6 h-6 mt-0.5 ${
                          visibility === 'public'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          Public Campaign
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Anyone can see this campaign and contributions
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => setVisibility('private')}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${
                        visibility === 'private'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      }`}>
                      <Lock
                        className={`w-6 h-6 mt-0.5 ${
                          visibility === 'private'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          Private Campaign
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Only invited people or link holders can see this
                          campaign
                        </p>
                      </div>
                    </button>
                  </div>

                  {visibility === 'private' && (
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                      <p className="font-medium text-foreground text-sm">
                        Privacy Settings
                      </p>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="see-each-other"
                          checked={contributorsSeeEachOther}
                          onCheckedChange={v =>
                            setContributorsSeeEachOther(!!v)
                          }
                        />
                        <div>
                          <Label
                            htmlFor="see-each-other"
                            className="cursor-pointer font-medium">
                            Contributors see each other
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Invite-only social campaign — contributors can see
                            who else contributed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="no-see-each-other"
                          checked={!contributorsSeeEachOther}
                          onCheckedChange={v => setContributorsSeeEachOther(!v)}
                        />
                        <div>
                          <Label
                            htmlFor="no-see-each-other"
                            className="cursor-pointer font-medium">
                            Contributors cannot see each other
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Strictly private — no one can see who else
                            contributed
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Review & Launch
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="secondary">{category || '—'}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Title</span>
                      <span className="text-foreground font-medium">
                        {title || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Goal</span>
                      <span className="text-foreground font-medium">
                        {goal ? `$${goal}` : 'No goal'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Recipient</span>
                      <span className="text-foreground font-medium">
                        {recipientEmail || 'Public'}
                      </span>
                    </div>
                    {endDate && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="text-foreground font-medium">
                          {endDate}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Visibility</span>
                      <span className="text-foreground font-medium flex items-center gap-1">
                        {visibility === 'public' ? (
                          <Globe className="w-3 h-3" />
                        ) : (
                          <Lock className="w-3 h-3" />
                        )}
                        {visibility === 'public' ? 'Public' : 'Private'}
                      </span>
                    </div>
                    {image && (
                      <div className="space-y-2 pt-2">
                        <span className="text-muted-foreground text-sm">
                          Campaign Image
                        </span>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/50">
                          <img
                            src={image}
                            alt="Campaign Preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                    {visibility === 'private' && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">
                          Contributors
                        </span>
                        <span className="text-foreground font-medium text-sm">
                          {contributorsSeeEachOther
                            ? 'Can see each other'
                            : 'Cannot see each other'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prev} disabled={step === 0}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                {step < steps.length - 1 ? (
                  <Button variant="hero" onClick={next}>
                    {' '}
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    onClick={handleLaunch}
                    disabled={isLaunching}>
                    {isLaunching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Launching...
                      </>
                    ) : (
                      'Launch Campaign 🚀'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
