'use client';

import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {Input} from '@/components/ui/input';
import {Progress} from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {usePublicCampaigns} from '@/hooks/use-campaigns';
import {CAMPAIGN_CATEGORY_IDS} from '@/lib/constants/campaigns';
import {formatCurrency} from '@/lib/utils/currency';
import {getDaysLeft} from '@/lib/utils/date';
import {motion} from 'framer-motion';
import {Clock, Globe, Loader2, Plus, Search, Users} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {generateSlug} from '@/lib/utils/slugs';

export default function CampaignsPage() {
  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} =
    usePublicCampaigns();

  const campaigns = data?.pages.flatMap(page => page.data || []) || [];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = (campaigns || []).filter(c => {
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
                {CAMPAIGN_CATEGORY_IDS.map(c => (
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

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
              <p className="text-xl font-medium">Fetching campaigns...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: i * 0.05}}>
                  <Link href={`/campaign/${c.campaign_short_id}/${c.campaign_slug || generateSlug(c.title)}`}>
                    <Card className="border-border hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer h-full overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        <img
                          src={c.image_url || '/default-campaign.png'}
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
                          {c.description || 'No description provided.'}
                        </p>
                        {Number(c.goal_amount) > 0 ? (
                          <>
                            <Progress
                              value={
                                (Number(c.current_amount) /
                                  Number(c.goal_amount)) *
                                100
                              }
                              className="h-2 mb-3"
                            />
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-bold text-foreground">
                                {formatCurrency(c.current_amount, c.currency)}{' '}
                                <span className="font-normal text-muted-foreground">
                                  of {formatCurrency(c.goal_amount, c.currency)}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {Math.round(
                                  (Number(c.current_amount) /
                                    Number(c.goal_amount)) *
                                    100,
                                )}
                                %
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-sm mb-5">
                            <span className="font-bold text-foreground text-base">
                              {formatCurrency(c.current_amount, c.currency)}{' '}
                              <span className="font-normal text-sm text-muted-foreground">
                                raised
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />{' '}
                            {c.contributions?.length || 0} contributors
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{' '}
                            {getDaysLeft(c.end_date)} days left
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 capitalize">
                          by{' '}
                          {c.profiles?.display_name ||
                            c.profiles?.username ||
                            'Organizer'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && campaigns.length > 0 && (
            <InfiniteScroll
              hasMore={!!hasNextPage}
              isLoading={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          )}

          {!isLoading && filtered.length === 0 && (
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
