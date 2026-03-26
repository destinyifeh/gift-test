'use client';

import Navbar from '@/components/landing/Navbar';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {CheckCircle, Copy, Link as LinkIcon} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';

interface SendGiftSuccessProps {
  slug: string;
  isClaimLink: boolean;
}

export function SendGiftSuccess({slug, isClaimLink}: SendGiftSuccessProps) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const claimUrl = `${origin}/claim/${slug}`;

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
                🎉 Gift Created Successfully!
              </h2>
              <p className="text-muted-foreground text-sm">
                {isClaimLink
                  ? 'Your claim link has been generated. Anyone with the link can claim this gift.'
                  : 'Your gift has been processed successfully! The recipient will be notified via email.'}
              </p>
            </div>

            <div className="space-y-6">
              {isClaimLink && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Claim Link
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 bg-muted rounded-lg px-4 py-3 flex items-center gap-2 border border-border overflow-hidden">
                      <LinkIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-sm text-foreground truncate flex-1">
                        {claimUrl}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-11 transition-all ${
                        copied ? 'border-green-500 text-green-500' : ''
                      }`}
                      onClick={() => {
                        navigator.clipboard.writeText(claimUrl);
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
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link href="/send-gift" onClick={() => window.location.reload()} className="flex-1">
                  <Button variant="hero" className="w-full h-12">
                    Send Another Gift
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
