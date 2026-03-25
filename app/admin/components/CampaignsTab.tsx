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
import {getCurrencyByCountry, getCurrencySymbol} from '@/lib/currencies';
import {
  fetchAdminCampaigns,
  updateCampaignAdmin,
} from '@/lib/server/actions/admin';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  Download,
  Eye,
  MoreVertical,
  Pause,
  Play,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {handleExport, statusBadge} from './utils';
import {InfiniteScroll} from '@/components/ui/infinite-scroll';

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
      <div className="text-muted-foreground p-4">Loading campaigns...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{campaigns.length} campaigns loaded</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv', 'Campaigns')}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Campaign</th>
              <th className="text-left py-2 font-medium">Creator</th>
              <th className="text-left py-2 font-medium">Category</th>
              <th className="text-right py-2 font-medium">Goal</th>
              <th className="text-right py-2 font-medium">Raised</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c: any) => (
              <tr
                key={c.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {c.title || 'Untitled'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ID: {c.id.split('-')[0]}
                  </p>
                </td>
                <td className="py-3 text-foreground capitalize">
                  {c.vendor?.display_name ||
                    c.vendor?.username ||
                    'Unknown'}
                </td>
                <td className="py-3">
                  <Badge variant="outline" className="text-[10px] uppercase">
                    {c.category}
                  </Badge>
                </td>
                <td className="py-3 text-right text-foreground font-mono">
                  {c.goal_amount
                    ? `${getCurrencySymbol(getCurrencyByCountry(c.vendor?.country))}${c.goal_amount}`
                    : '-'}
                </td>
                <td className="py-3 text-right text-secondary pr-6 font-mono">
                  {getCurrencySymbol(getCurrencyByCountry(c.vendor?.country))}
                  {c.current_amount || 0}
                </td>
                <td className="py-3 pl-6">
                  <Badge
                    variant={statusBadge(c.status) as any}
                    className="capitalize">
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleFeatured(c.id, false, c.title)
                          }>
                          <Star className="w-4 h-4 mr-2" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            onToggleStatus(c.id, c.status, c.title)
                          }>
                          {c.status === 'active' ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" /> Pause Campaign
                            </>
                          ) : c.status === 'paused' ? (
                            <>
                              <Play className="w-4 h-4 mr-2" /> Resume Campaign
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-4 h-4 mr-2" /> Reactivate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() =>
                            handleAdvancedAction(
                              'delete',
                              'campaign',
                              c.id,
                              c.title,
                            )
                          }>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Campaign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
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
    </div>
  );
}
