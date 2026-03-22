'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {useUserStore} from '@/lib/store/useUserStore';
import {CheckCircle, ChevronRight, Copy, Key} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

export function IntegrationsTab() {
  const user = useUserStore(state => state.user);
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const mockApiKey = 'gh_live_********************';

  const copyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };
  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Your API Key</h3>
              <p className="text-sm text-muted-foreground">
                Use this key to authenticate your requests
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <code className="flex-1 bg-muted rounded-lg px-3 sm:px-4 py-3 font-mono text-xs sm:text-sm text-foreground min-w-0 truncate">
              {apiKeyRevealed ? mockApiKey : 'gt_live_••••••••••••••••••••'}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setApiKeyRevealed(!apiKeyRevealed)}>
              {apiKeyRevealed ? 'Hide' : 'Reveal'}
            </Button>
            <Button variant="outline" size="sm" onClick={copyApiKey}>
              {apiKeyCopied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-secondary" />{' '}
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive">
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Embed Gift Widget</h3>
          <p className="text-sm text-muted-foreground">
            Add a gifting widget to your website
          </p>
          <pre className="bg-muted rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-mono text-foreground overflow-x-auto">
            {`<script src="https://cdn.gifttogether.com/widget.js"></script>\n<div id="gift-widget" data-user="${user?.username || 'username'}"></div>`}
          </pre>
          <Button variant="outline" size="sm">
            Copy Code
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h3 className="font-semibold text-foreground">SDK Packages</h3>
          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">React (NPM)</p>
              <pre className="text-xs font-mono text-muted-foreground mt-1">
                npm install @gifttogether/react
              </pre>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">
                React Native (NPM)
              </p>
              <pre className="text-xs font-mono text-muted-foreground mt-1">
                npm install @gifttogether/react-native
              </pre>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Flutter (Pub)
              </p>
              <pre className="text-xs font-mono text-muted-foreground mt-1">
                flutter pub add gifttogether
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
      <Link href="/developers">
        <Button variant="outline">
          View Full Developer Docs <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
