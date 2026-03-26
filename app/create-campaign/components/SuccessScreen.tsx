'use client';

import Navbar from '@/components/landing/Navbar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  CheckCircle,
  Copy,
  Link as LinkIcon,
  Plus,
  SendHorizontal,
} from 'lucide-react';
import Link from 'next/link';

import {useEffect, useState} from 'react';
import {generateSlug} from '@/lib/utils/slugs';

interface SuccessScreenProps {
  title: string;
  slug: string;
}

export function SuccessScreen({
  title,
  slug,
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const campaignLink = `${origin}/campaign/${slug}/${generateSlug(title)}`;

  const handleShare = async () => {
    const shareText = `Check out my gift campaign: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Gift Campaign',
          text: shareText,
          url: campaignLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(campaignLink);
      alert('Sharing not supported on this browser. Link copied to clipboard!');
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
                Your campaign is now live. Share it with friends and start receiving gifts.
              </p>
            </div>

            <div className="space-y-6">
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
                      className={`flex-1 sm:flex-none h-11 transition-all ${
                        copied ? 'border-green-500 text-green-500' : ''
                      }`}
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
                <Link href={`/campaign/${slug}/${generateSlug(title)}`} className="flex-1">
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
