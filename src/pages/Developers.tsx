import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, BookOpen, Copy, CheckCircle, Terminal, Puzzle, Globe, Smartphone, ArrowLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";

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

const docSections = [
  { title: "Getting Started", items: ["Authentication", "API Keys", "Quick Start Guide", "Rate Limits"] },
  { title: "Core API", items: ["Campaigns", "Gifts", "Users", "Payments", "Webhooks"] },
  { title: "Integrations", items: ["Widget Embed", "NPM SDK", "Mobile SDK", "White-Label Setup"] },
  { title: "Platform Partners", items: ["Partner Registration", "User Registration API", "Revenue Sharing", "White-Label Configuration"] },
];

const Developers = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeDocSection, setActiveDocSection] = useState<string | null>(null);

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

          {/* Full Documentation Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-display text-foreground mb-2 text-center">Documentation</h2>
            <p className="text-muted-foreground text-center mb-8">Everything you need to integrate GiftTogether into your platform.</p>

            <div className="grid md:grid-cols-2 gap-6">
              {docSections.map((section) => (
                <Card key={section.title} className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base font-body flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item}>
                          <button
                            onClick={() => setActiveDocSection(activeDocSection === item ? null : item)}
                            className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            {item}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDocSection === item ? "rotate-90" : ""}`} />
                          </button>
                          {activeDocSection === item && (
                            <div className="ml-2 mt-1 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                              <p className="font-medium text-foreground mb-1">{item}</p>
                              <p>Comprehensive documentation for {item.toLowerCase()} is available in the API reference. This section covers setup, configuration, usage examples, and best practices.</p>
                              <pre className="mt-2 p-2 bg-background rounded text-xs font-mono overflow-x-auto">
                                {`GET /api/v1/${item.toLowerCase().replace(/\s+/g, '-')}\nAuthorization: Bearer YOUR_API_KEY`}
                              </pre>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Partner Section */}
          <div className="mt-16">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold font-display text-foreground mb-2">Become a Platform Partner</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Integrate GiftTogether's gifting infrastructure into your platform. Earn revenue share on every transaction.</p>
                <Link to="/platforms">
                  <Button variant="hero" size="lg">Apply for Partnership <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Developers;
