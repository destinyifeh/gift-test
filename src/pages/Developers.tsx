import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, BookOpen, Copy, CheckCircle, Terminal, Puzzle, Globe, Smartphone, ChevronRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";

const codeSnippets = {
  widget: `<!-- GiftTogether Widget -->
<script src="https://cdn.gifttogether.com/widget.js"></script>
<div id="gift-widget" data-key="YOUR_API_KEY"></div>`,
  react: `npm install @gifttogether/react

import { GiftButton } from '@gifttogether/react';

function App() {
  return (
    <GiftButton
      apiKey="YOUR_API_KEY"
      recipientId="user_123"
      theme="light"
    />
  );
}`,
  reactNative: `npm install @gifttogether/react-native

import { GiftModal } from '@gifttogether/react-native';

export default function App() {
  return (
    <GiftModal
      apiKey="YOUR_API_KEY"
      recipientId="user_123"
      onSuccess={(gift) => console.log(gift)}
    />
  );
}`,
  flutter: `# pubspec.yaml
dependencies:
  gifttogether: ^1.0.0

import 'package:gifttogether/gifttogether.dart';

final gt = GiftTogether(apiKey: 'YOUR_API_KEY');
await gt.sendGift(
  recipientId: 'user_123',
  amount: 25.00,
);`,
  api: `curl -X POST https://api.gifttogether.com/v1/campaigns \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Birthday Gift","goal":100}'`,
};

const docSections = [
  {
    title: "Getting Started", items: [
      { name: "Authentication", content: "All API requests require authentication via Bearer token. Include your API key in the Authorization header:\n\nAuthorization: Bearer YOUR_API_KEY\n\nYou can generate API keys from your Dashboard → Integrations section." },
      { name: "API Keys", content: "API keys are scoped to your account. You can have multiple keys for different environments.\n\nTypes:\n- Live keys (gt_live_*): For production use\n- Test keys (gt_test_*): For development and testing\n\nManage keys from Dashboard → Integrations." },
      { name: "Quick Start Guide", content: "1. Sign up and get your API key\n2. Install the SDK for your platform\n3. Initialize with your API key\n4. Create your first gift or campaign\n\nExample:\nconst gt = new GiftTogether({ apiKey: 'gt_live_xxx' });\nawait gt.createGift({ amount: 25, recipient: 'user@email.com' });" },
      { name: "Rate Limits", content: "API rate limits:\n- Free: 100 requests/minute\n- Pro: 1,000 requests/minute\n- Platform Partner: 10,000 requests/minute\n\nRate limit headers are included in every response:\nX-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset" },
    ]
  },
  {
    title: "Core API", items: [
      { name: "Campaigns", content: "POST /api/v1/campaigns — Create a campaign\nGET /api/v1/campaigns/:id — Get campaign details\nPUT /api/v1/campaigns/:id — Update campaign\nDELETE /api/v1/campaigns/:id — Delete campaign\n\nQuery campaigns:\nGET /api/v1/campaigns?status=active&category=birthday" },
      { name: "Gifts", content: "POST /api/v1/gifts — Send a gift\nGET /api/v1/gifts/:id — Get gift details\nPOST /api/v1/gifts/:id/claim — Claim a gift\n\nGift types: money, vendor_gift, gift_card" },
      { name: "Users", content: "POST /api/v1/users — Create/register user\nGET /api/v1/users/:id — Get user profile\nPUT /api/v1/users/:id — Update profile\nGET /api/v1/users/:id/wallet — Get wallet balance" },
      { name: "Payments", content: "Supported providers: Stripe, Paystack, Flutterwave\n\nPOST /api/v1/payments/charge — Process payment\nPOST /api/v1/payments/payout — Send payout\nGET /api/v1/payments/transactions — List transactions" },
      { name: "Webhooks", content: "Register webhook endpoints to receive real-time events:\n\nPOST /api/v1/webhooks — Register endpoint\n\nEvents:\n- gift.created\n- gift.claimed\n- campaign.funded\n- payment.completed\n- withdrawal.processed" },
    ]
  },
  {
    title: "SDKs & Integrations", items: [
      { name: "Widget Embed", content: "Embed a gifting widget on any website:\n\n<script src=\"https://cdn.gifttogether.com/widget.js\"></script>\n<div id=\"gift-widget\" data-key=\"YOUR_KEY\"></div>\n\nCustomize with data attributes:\ndata-theme, data-color, data-position" },
      { name: "React SDK", content: "npm install @gifttogether/react\n\nComponents: <GiftButton />, <GiftModal />, <CampaignCard />, <SupporterList />\n\nHooks: useGift(), useCampaign(), useWallet()\n\nFull TypeScript support included." },
      { name: "React Native SDK", content: "npm install @gifttogether/react-native\n\nNative components for iOS and Android:\n<GiftModal />, <GiftButton />, <PaymentSheet />\n\nSupports deep linking for gift claims." },
      { name: "Flutter Package", content: "flutter pub add gifttogether\n\nWidgets: GiftButton, GiftModal, CampaignWidget\n\nFull Dart SDK for all API operations.\nSupports both Android and iOS." },
      { name: "White-Label Setup", content: "For Platform Partners:\n\n1. Register as Platform Partner\n2. Configure branding (logo, colors, name)\n3. Install SDK or widget\n4. Register users via API\n5. Enable gifting on user profiles\n\nWhite-label removes all GiftTogether branding." },
    ]
  },
  {
    title: "Platform Partners", items: [
      { name: "Partner Registration", content: "POST /api/v1/partners — Register as partner\n\nRequired fields:\n- company_name\n- website\n- contact_email\n- estimated_users\n- integration_type (widget/sdk/api)\n\nAfter approval, access the Platform Dashboard." },
      { name: "User Registration API", content: "Register your platform's users:\n\nPOST /api/v1/partners/users\n{\n  \"external_user_id\": \"1234\",\n  \"username\": \"john\",\n  \"email\": \"john@partner.com\"\n}\n\nUsers are scoped to your platform and cannot log in to gifttogether.com directly." },
      { name: "Revenue Sharing", content: "Default revenue split per gift:\n- Creator receives: 96%\n- Platform fee: 2%\n- Partner fee: 2%\n\nCustom splits available for enterprise partners.\n\nGET /api/v1/partners/revenue — View revenue reports" },
      { name: "White-Label Configuration", content: "Customize the gift experience:\n\nPUT /api/v1/partners/branding\n{\n  \"brand_name\": \"Community Gifts\",\n  \"primary_color\": \"#FF5500\",\n  \"logo_url\": \"https://...\"\n}\n\nAll gift modals and emails will use your branding." },
    ]
  },
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
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {[
              { icon: Globe, title: "Website Widget", desc: "Embed a gifting widget on any website in minutes" },
              { icon: Code, title: "React SDK", desc: "Full React components and hooks for web apps" },
              { icon: Smartphone, title: "React Native SDK", desc: "Native SDK for iOS and Android mobile apps" },
              { icon: Puzzle, title: "Flutter Package", desc: "Dart package for Flutter mobile applications" },
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
            <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
              <TabsTrigger value="widget">Widget</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="reactNative">React Native</TabsTrigger>
              <TabsTrigger value="flutter">Flutter</TabsTrigger>
              <TabsTrigger value="api">REST API</TabsTrigger>
            </TabsList>

            {Object.entries(codeSnippets).map(([key, code]) => (
              <TabsContent key={key} value={key}>
                <Card className="border-border">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {key === "widget" ? "HTML" : key === "react" ? "React / TypeScript" : key === "reactNative" ? "React Native" : key === "flutter" ? "Dart" : "cURL"}
                        </span>
                      </div>
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
                        <li key={item.name}>
                          <button
                            onClick={() => setActiveDocSection(activeDocSection === item.name ? null : item.name)}
                            className="w-full text-left text-sm text-muted-foreground hover:text-foreground flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            {item.name}
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeDocSection === item.name ? "rotate-90" : ""}`} />
                          </button>
                          {activeDocSection === item.name && (
                            <div className="ml-2 mt-1 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                              <p className="font-medium text-foreground mb-2">{item.name}</p>
                              <pre className="whitespace-pre-wrap font-mono text-xs">{item.content}</pre>
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
