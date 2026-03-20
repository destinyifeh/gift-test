'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {Textarea} from '@/components/ui/textarea';
import {useMyCampaigns} from '@/hooks/use-campaigns';
import {updateCampaign} from '@/lib/server/actions/campaigns';
import {ChevronRight, Clock, Edit, Loader2, Plus} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';
import {getDaysLeft, statusColor} from './utils';

export function MyCampaignsTab() {
  const {data: campaigns, isLoading} = useMyCampaigns();
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [editCampaignTitle, setEditCampaignTitle] = useState('');
  const [editCampaignEndDate, setEditCampaignEndDate] = useState('');
  const [editCampaignDesc, setEditCampaignDesc] = useState('');

  const handleUpdate = async (id: string) => {
    const result = await updateCampaign(id, {
      title: editCampaignTitle,
      description: editCampaignDesc,
      end_date: editCampaignEndDate,
    });
    if (result.success) {
      toast.success('Campaign updated!');
      setEditingCampaign(null);
    } else {
      toast.error(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-50">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p>Loading your campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
        <p className="text-muted-foreground mb-4">No campaigns yet.</p>
        <Link href="/create-campaign">
          <Button variant="hero">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Campaign
          </Button>
        </Link>
      </div>
    );
  }

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
      {campaigns.map(c => (
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
                    onClick={() => handleUpdate(c.id)}>
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
                      src={c.image_url || '/default-campaign.png'}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <Link href={`/campaign/${c.slug}`} className="block">
                        <p className="font-semibold text-foreground">
                          {c.title}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColor(c.status) as any}>
                          {c.status}
                        </Badge>
                        {getDaysLeft(c.end_date) > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {getDaysLeft(c.end_date)}d left
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCampaign(c.id);
                            setEditCampaignTitle(c.title);
                            setEditCampaignEndDate(
                              c.end_date ? c.end_date.split('T')[0] : '',
                            );
                            setEditCampaignDesc(c.description || '');
                          }}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {c.goal_amount > 0 && (
                      <Progress
                        value={(c.current_amount / c.goal_amount) * 100}
                        className="h-2 mb-2"
                      />
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${c.current_amount || 0} raised of ${c.goal_amount || 0}
                      </span>
                      <span className="text-muted-foreground">
                        0 contributors
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
