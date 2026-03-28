'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {Textarea} from '@/components/ui/textarea';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalFooter,
} from '@/components/ui/responsive-modal';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useMyCampaigns} from '@/hooks/use-campaigns';
import {updateCampaign} from '@/lib/server/actions/campaigns';
import {formatCurrency} from '@/lib/utils/currency';
import {generateSlug} from '@/lib/utils/slugs';
import {cn} from '@/lib/utils';
import {ChevronRight, Clock, Edit, Loader2, Plus, Users} from 'lucide-react';
import Link from 'next/link';
import {useState} from 'react';
import {toast} from 'sonner';
import {DashboardEmptyState} from './shared';
import {getDaysLeft, statusColor} from './utils';

export function MyCampaignsTab() {
  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch} =
    useMyCampaigns();

  const campaigns = data?.pages.flatMap(page => page.data || []) || [];

  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editCampaignTitle, setEditCampaignTitle] = useState('');
  const [editCampaignEndDate, setEditCampaignEndDate] = useState('');
  const [editCampaignDesc, setEditCampaignDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenEdit = (c: any) => {
    setEditingCampaign(c);
    setEditCampaignTitle(c.title);
    setEditCampaignEndDate(c.end_date ? c.end_date.split('T')[0] : '');
    setEditCampaignDesc(c.description || '');
  };

  const handleUpdate = async () => {
    if (!editingCampaign) return;
    setIsSaving(true);
    const result = await updateCampaign(editingCampaign.id, {
      title: editCampaignTitle,
      description: editCampaignDesc,
      end_date: editCampaignEndDate,
    });
    setIsSaving(false);
    if (result.success) {
      toast.success('Campaign updated!');
      setEditingCampaign(null);
      refetch();
    } else {
      toast.error(result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading campaigns...</p>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Users className="w-8 h-8" />}
        title="No Campaigns Yet"
        description="Create your first campaign to start collecting gifts from friends and family."
        action={{label: 'Create Campaign', href: '/create-campaign'}}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
        </p>
        <Link href="/create-campaign">
          <Button variant="hero" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </Link>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map(c => (
          <div
            key={c.id}
            className={cn(
              'p-4 rounded-xl',
              'bg-card border border-border',
              'hover:border-primary/30 transition-colors',
            )}>
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <Link
                href={`/campaign/${c.campaign_short_id}/${c.campaign_slug || generateSlug(c.title)}`}
                className="flex-1 min-w-0">
                <p className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                  {c.title}
                </p>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusColor(c.status) as any} className="text-[10px]">
                  {c.status}
                </Badge>
                {getDaysLeft(c.end_date) > 0 && (
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {getDaysLeft(c.end_date)}d
                  </Badge>
                )}
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Progress */}
            {Number(c.goal_amount) > 0 && (
              <Progress
                value={(Number(c.current_amount) / Number(c.goal_amount)) * 100}
                className="h-2 mb-3"
              />
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {Number(c.goal_amount) > 0 ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(c.current_amount || 0, c.currency || 'NGN')}
                    </span>{' '}
                    of {formatCurrency(c.goal_amount || 0, c.currency || 'NGN')}
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(c.current_amount || 0, c.currency || 'NGN')}
                    </span>{' '}
                    raised
                  </>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.contributions?.length || 0} contributor{(c.contributions?.length || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <ResponsiveModal
        open={!!editingCampaign}
        onOpenChange={open => !open && setEditingCampaign(null)}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Edit Campaign</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="space-y-4 p-4 md:px-6">
            <div className="space-y-2">
              <Label>Campaign Title</Label>
              <Input
                value={editCampaignTitle}
                onChange={e => setEditCampaignTitle(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editCampaignDesc}
                onChange={e => setEditCampaignDesc(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={editCampaignEndDate}
                onChange={e => setEditCampaignEndDate(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <ResponsiveModalFooter>
            <Button
              variant="outline"
              onClick={() => setEditingCampaign(null)}
              className="flex-1">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleUpdate}
              disabled={isSaving}
              className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      {/* Infinite Scroll */}
      {!isLoading && campaigns.length > 0 && (
        <InfiniteScroll
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      )}

      {/* Browse link */}
      <Link href="/campaigns">
        <Button variant="outline" className="w-full mt-2">
          Browse All Public Campaigns
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
