'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Progress} from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {motion} from 'framer-motion';
import {Clock, Globe, Plus, Search, Users} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';

const campaigns = [
  {
    id: 1,
    slug: 'birthday-gift-for-sarah',
    title: 'Birthday Gift for Sarah 🎂',
    description: "Let's surprise Sarah with an amazing birthday gift!",
    category: 'personal',
    raised: 340,
    goal: 500,
    contributors: 12,
    endDate: '2026-03-17',
    creator: 'John D.',
  },
  {
    id: 2,
    slug: 'wedding-gift-alex-kim',
    title: 'Wedding Gift for Alex & Kim 💍',
    description: 'Help us celebrate their special day with a group gift.',
    category: 'group',
    raised: 450,
    goal: 500,
    contributors: 18,
    endDate: '2026-03-24',
    creator: 'Mary K.',
  },
  {
    id: 3,
    slug: 'team-appreciation',
    title: 'Team Appreciation Fund 🌟',
    description: 'Show some love to our amazing team members.',
    category: 'appreciation',
    raised: 200,
    goal: 300,
    contributors: 8,
    endDate: '2026-04-01',
    creator: 'Sarah L.',
  },
  {
    id: 4,
    slug: 'graduation-gift-tom',
    title: 'Graduation Gift for Tom 🎓',
    description: "Tom just graduated! Let's celebrate this milestone.",
    category: 'personal',
    raised: 120,
    goal: 200,
    contributors: 6,
    endDate: '2026-03-20',
    creator: 'Lisa M.',
  },
  {
    id: 5,
    slug: 'teacher-appreciation',
    title: 'Teacher Appreciation - Ms. Johnson 📚',
    description: 'Thank Ms. Johnson for an incredible year.',
    category: 'appreciation',
    raised: 180,
    goal: 250,
    contributors: 15,
    endDate: '2026-03-15',
    creator: 'Parent Group',
  },
  {
    id: 6,
    slug: 'charity-run-fund',
    title: 'Charity Run Fundraiser 🏃',
    description: 'Support our team running for a great cause.',
    category: 'group',
    raised: 890,
    goal: 1000,
    contributors: 35,
    endDate: '2026-03-27',
    creator: 'RunTeam',
  },
];

const categories = [
  'all',
  'personal',
  'group',
  'appreciation',
  'hobby',
  'holiday',
  'support',
  'project',
];

const getDaysLeft = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil(
    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff > 0 ? diff : 0;
};

export default function CampaignsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = campaigns.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (category !== 'all' && c.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
              Public <span className="text-gradient">Campaigns</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse and contribute to gift campaigns from the community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>
                    {c === 'all'
                      ? 'All Categories'
                      : c.charAt(0).toUpperCase() + c.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/create-campaign">
              <Button variant="hero">
                <Plus className="w-4 h-4 mr-1" /> Create
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: i * 0.05}}>
                <Link href={`/campaign/${c.slug}`}>
                  <Card className="border-border hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer h-full overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={(c as any).image || '/default-campaign.png'}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{c.category}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <Globe className="w-3 h-3" /> public
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground text-lg mb-2">
                        {c.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {c.description}
                      </p>
                      <Progress
                        value={(c.raised / c.goal) * 100}
                        className="h-2 mb-3"
                      />
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-foreground">
                          ${c.raised}{' '}
                          <span className="font-normal text-muted-foreground">
                            of ${c.goal}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          {Math.round((c.raised / c.goal) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {c.contributors}{' '}
                          contributors
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {getDaysLeft(c.endDate)}{' '}
                          days left
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        by {c.creator}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No campaigns found.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
