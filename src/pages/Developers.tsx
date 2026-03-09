import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Download, BookOpen, Copy, CheckCircle, Terminal, Puzzle, Globe, Smartphone } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useState } from "react";

const codeSnippets = {
  widget: `<!-- GiftTogether Widget -->
<script src="https://cdn.gifttogether.com/widget.js"></script>
<div id="gift-widget" data-key="YOUR_API_KEY"></div>`,
  npm: `npm install @gifttogether/sdk

import { GiftTogether } from '@gifttogether/sdk';

const gt = new GiftTogether({ apiKey: 'YOUR_API_KEY' });
await gt.createCampaign({
  title: 'Birthday Gift for Sarah',
  goalAmount: 100,
  category: 'birthday'
});`,
  api: `curl -X POST https://api.gifttogether.com/v1/campaigns \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Birthday Gift","goal":100}'`,
};

const Developers = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Developer Portal</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
              Build with <span className="text-gradient">GiftTogether</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Integrate gifting into your platform with our APIs, SDKs, and embeddable widgets.
            </p>
          </div>

          {/* API Key section */}
          <Card className="border-border mb-10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Key className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Your API Key</h3>
                  <p className="text-sm text-muted-foreground">Use this key to authenticate your requests</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-sm text-foreground">gt_live_••••••••••••••••••••</code>
                <Button variant="outline" size="sm">Reveal</Button>
                <Button variant="outline" size="sm">Regenerate</Button>
              </div>
            </CardContent>
          </Card>

          {/* Integration options */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Globe, title: "Website Widget", desc: "Embed a gifting widget on any website in minutes" },
              { icon: Smartphone, title: "Mobile SDK", desc: "Native SDKs for iOS and Android apps" },
              { icon: Puzzle, title: "NPM Package", desc: "Full JavaScript/TypeScript SDK for web apps" },
            ].map((item) => (
              <Card key={item.title} className="border-border hover:shadow-card transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Code examples */}
          <Tabs defaultValue="widget" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="widget">Widget</TabsTrigger>
              <TabsTrigger value="npm">NPM / SDK</TabsTrigger>
              <TabsTrigger value="api">REST API</TabsTrigger>
            </TabsList>

            {Object.entries(codeSnippets).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <Card className="border-border">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{key === "widget" ? "HTML" : key === "npm" ? "JavaScript" : "cURL"}</span></div>
                      <Button variant="ghost" size="sm" onClick={() => copyCode(key, code)}>
                        {copiedSection === key ? <><CheckCircle className="w-3.5 h-3.5 mr-1 text-secondary" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                      </Button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground"><code>{code}</code></pre>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-12 text-center">
            <Button variant="hero" size="lg"><BookOpen className="w-4 h-4 mr-2" /> View Full Documentation</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Developers;
