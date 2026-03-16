'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {Textarea} from '@/components/ui/textarea';
import {ChevronRight, Clock, Edit, Plus} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {myCampaigns} from './mock';
import {getDaysLeft, statusColor} from './utils';

export function MyCampaignsTab() {
  const [editingCampaign, setEditingCampaign] = useState<number | null>(null);
  const [editCampaignTitle, setEditCampaignTitle] = useState('');
  const [editCampaignEndDate, setEditCampaignEndDate] = useState('');
  const [editCampaignDesc, setEditCampaignDesc] = useState('');
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Your campaigns</p>
        <Link href="/create-campaign">
          <Button variant="hero" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Campaign
          </Button>
        </Link>
      </div>
      {myCampaigns.map(c => (
        <Card key={c.id} className="border-border">
          <CardContent className="p-3 sm:p-4">
            {editingCampaign === c.id ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input
                    value={editCampaignTitle}
                    onChange={e => setEditCampaignTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editCampaignDesc}
                    onChange={e => setEditCampaignDesc(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editCampaignEndDate}
                    onChange={e => setEditCampaignEndDate(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => setEditingCampaign(null)}>
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCampaign(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 hidden sm:block">
                    <img
                      src={c.image || '/default-campaign.png'}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <Link
                        href={`/campaign/${c.slug}`}
                        className="hover:underline">
                        <p className="font-semibold text-foreground">
                          {c.title}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColor(c.status) as any}>
                          {c.status}
                        </Badge>
                        {getDaysLeft(c.endDate) > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {getDaysLeft(c.endDate)}d left
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCampaign(c.id);
                            setEditCampaignTitle(c.title);
                            setEditCampaignEndDate(c.endDate);
                            setEditCampaignDesc(c.description);
                          }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={(c.raised / c.goal) * 100}
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${c.raised} raised of ${c.goal}
                      </span>
                      <span className="text-muted-foreground">
                        {c.contributors} contributors
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
      <Link href="/campaigns">
        <Button variant="outline" className="w-full mt-2">
          Browse All Public Campaigns <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
