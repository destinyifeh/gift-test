'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';
import {useIsMobile} from '@/hooks/use-mobile';
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminCampaigns,
  updateCampaignAdmin,
} from '@/lib/server/actions/admin';
import {cn} from '@/lib/utils';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {adminUpdateCampaign, uploadCampaignImage} from '@/lib/server/actions/campaigns';
import {ImageUpload} from '@/components/ui/image-upload';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {
  Download,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Pause,
  Play,
  RotateCcw,
  Star,
  Target,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';

interface CampaignsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function CampaignsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: CampaignsTabProps) {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const {
    data: infiniteData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['admin-campaigns', searchQuery],
    queryFn: ({pageParam = 0}) => fetchAdminCampaigns({search: searchQuery, pageParam}),
    getNextPageParam: lastPage => lastPage.nextPage,
    initialPageParam: 0,
  });

  const campaigns = infiniteData?.pages.flatMap(page => page.data || []) || [];

  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type:
      | 'pause'
      | 'resume'
      | 'feature'
      | 'unfeature'
      | 'delete'
      | 'reactivate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'pause',
    targetId: '',
    targetName: '',
  });

  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    goal_amount: 0,
    image_url: '',
    status: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const mutation = useMutation({
    mutationFn: ({id, updates}: {id: string; updates: any}) =>
      updateCampaignAdmin(id, updates),
    onSuccess: (res, vars) => {
      if (!res.success) {
        toast.error(res.error || 'Failed to update campaign');
        return;
      }
      queryClient.invalidateQueries({queryKey: ['admin-campaigns']});
      toast.success('Campaign updated successfully');
      addLog(
        `Updated campaign ${vars.id.slice(0, 8)}… → status: "${vars.updates.status || 'updated'}"`,
      );
    },
    onError: () => toast.error('Error updating campaign'),
  });

  const handleAdvancedAction = (
    type: any,
    targetType: string,
    targetId: string,
    targetName: string,
  ) => {
    setAdvancedModal({
      isOpen: true,
      type,
      targetId,
      targetName,
    });
  };

  const onConfirmAdvancedAction = (data: {days?: string; reason: string}) => {
    const {type, targetId} = advancedModal;

    if (type === 'pause') {
      mutation.mutate({id: targetId, updates: {status: 'paused'}});
    } else if (type === 'resume') {
      mutation.mutate({id: targetId, updates: {status: 'active'}});
    } else if (type === 'reactivate') {
      mutation.mutate({id: targetId, updates: {status: 'active'}});
    } else if (type === 'feature' || type === 'unfeature') {
      toast.info('Feature campaign function mock-triggered');
    } else if (type === 'delete') {
      toast.info('Delete functionality disabled for data retention policies');
    }

    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onToggleFeatured = (id: string, current: boolean, title: string) => {
    const action = current ? 'unfeature' : 'feature';
    handleAdvancedAction(action, 'campaign', id, title);
  };

  const onToggleStatus = (id: string, status: string, title: string) => {
    let action = 'pause';
    if (status === 'paused') action = 'resume';
    if (status === 'completed') action = 'reactivate';

    handleAdvancedAction(action, 'campaign', id, title);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground">Loading campaigns...</p>
      </div>
    );
  }

  const CampaignActions = ({c}: {c: any}) => {
    const status = c.status?.trim().toLowerCase();
    const isFinalized = status === 'completed' || status === 'cancelled' || status === 'inactive';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              setViewDetailsModal({
                isOpen: true,
                title: 'Campaign Details',
                data: {
                  ...c,
                  shop_name: c.vendor?.shop_name || 'N/A',
                  shop_address: c.vendor?.shop_address || 'N/A',
                },
              })
            }>
            <Eye className="w-4 h-4 mr-2" /> View Details
          </DropdownMenuItem>

          {!isFinalized && (
            <>
              <DropdownMenuItem onClick={() => onToggleFeatured(c.id, false, c.title)}>
                <Star className="w-4 h-4 mr-2" /> Feature
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setEditingCampaign(c);
                  setEditForm({
                    title: c.title || '',
                    description: c.description || '',
                    goal_amount: c.goal_amount || 0,
                    image_url: c.image_url || c.imageUrl || '',
                    status: c.status || '',
                  });
                }}>
                <Edit className="w-4 h-4 mr-2" /> Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(c.id, c.status, c.title)}>
                {status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Resume
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => handleAdvancedAction('delete', 'campaign', c.id, c.title)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const getCurrency = (country: string) => getCurrencySymbol(getCurrencyByCountry(country));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{campaigns.length} campaigns loaded</p>
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => handleExport('csv', 'Campaigns')}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-2">
          {campaigns.map((c: any) => (
            <div
              key={c.id}
              className={cn(
                'p-4 rounded-xl bg-card border border-border',
                'active:bg-muted/50 transition-colors',
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">
                        {c.title || 'Untitled'}
                      </p>
                      <Badge
                        variant={statusBadge(c.status) as any}
                        className="capitalize text-[10px]">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      by {c.vendor?.display_name || c.vendor?.username || 'Unknown'}
                    </p>
                  </div>
                </div>
                <CampaignActions c={c} />
              </div>

              {/* Progress bar */}
              {c.goal_amount && (
                <div className="mt-3">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.min(((c.current_amount || 0) / c.goal_amount) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {c.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-secondary">
                    {getCurrency(c.vendor?.country)}{c.current_amount || 0}
                  </p>
                  {c.goal_amount && (
                    <p className="text-xs text-muted-foreground font-mono">
                      of {getCurrency(c.vendor?.country)}{c.goal_amount}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Campaign</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Creator</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Goal</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Raised</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c: any) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{c.title || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground">ID: {c.id.split('-')[0]}</p>
                  </td>
                  <td className="py-3 px-4 text-foreground capitalize">
                    {c.vendor?.display_name || c.vendor?.username || 'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {c.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right text-foreground font-mono">
                    {c.goal_amount ? `${getCurrency(c.vendor?.country)}${c.goal_amount}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-secondary font-mono">
                    {getCurrency(c.vendor?.country)}{c.current_amount || 0}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={statusBadge(c.status) as any} className="capitalize">
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <CampaignActions c={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {campaigns.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No campaigns found</p>
        </div>
      )}
      
      <InfiniteScroll
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />

      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type as any}
        targetType="campaign"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />

      <ResponsiveModal
        open={!!editingCampaign}
        onOpenChange={open => !open && setEditingCampaign(null)}>
        <ResponsiveModalContent className="sm:max-w-[500px]">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Edit Campaign (Admin)</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                value={editForm.title}
                onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Amount</label>
                <input
                  type="number"
                  value={editForm.goal_amount}
                  onChange={e => setEditForm(prev => ({...prev, goal_amount: Number(e.target.value)}))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  disabled={editingCampaign.status === 'completed' || editingCampaign.status === 'cancelled'}
                  value={editForm.status}
                  onChange={e => setEditForm(prev => ({...prev, status: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-muted disabled:opacity-75">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {(editingCampaign.status === 'completed' || editingCampaign.status === 'cancelled') && (
                  <p className="text-[10px] text-destructive font-bold uppercase mt-1 italic">
                    {editingCampaign.status} campaigns cannot be reopened.
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Image</label>
              <ImageUpload
                value={editForm.image_url}
                onChange={url => setEditForm(prev => ({...prev, image_url: url}))}
                onUpload={uploadCampaignImage}
                placeholder="Replace campaign image"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingCampaign(null)} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                disabled={isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await adminUpdateCampaign(editingCampaign.id, editForm);
                    if (res.success) {
                      toast.success('Campaign updated by admin');
                      setEditingCampaign(null);
                      queryClient.invalidateQueries({queryKey: ['admin-campaigns']});
                    } else {
                      toast.error(res.error || 'Update failed');
                    }
                  } catch (err) {
                    toast.error('Error during update');
                  } finally {
                    setIsSaving(false);
                  }
                }}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  );
}
