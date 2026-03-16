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
import {
  Download,
  Eye,
  MoreVertical,
  Pause,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {mockCampaigns} from './mock';
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
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'pause' | 'resume' | 'feature' | 'unfeature' | 'delete';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'pause',
    targetId: '',
    targetName: '',
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
    const {type, targetName, targetId} = advancedModal;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
    const logMessage = `${formattedType}ed campaign ${targetName}. Reason: ${data.reason}`;

    if (type === 'pause') {
      setCampaigns(prev =>
        prev.map(c => (c.id === targetId ? {...c, status: 'paused'} : c)),
      );
    } else if (type === 'resume') {
      setCampaigns(prev =>
        prev.map(c => (c.id === targetId ? {...c, status: 'active'} : c)),
      );
    } else if (type === 'feature' || type === 'unfeature') {
      setCampaigns(prev =>
        prev.map(c =>
          c.id === targetId ? {...c, featured: type === 'feature'} : c,
        ),
      );
    } else if (type === 'delete') {
      setCampaigns(prev => prev.filter(c => c.id !== targetId));
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onToggleFeatured = (id: string, current: boolean, title: string) => {
    const action = current ? 'unfeature' : 'feature';
    handleAdvancedAction(action, 'campaign', id, title);
  };

  const onToggleStatus = (id: string, status: string, title: string) => {
    const action = status === 'active' ? 'pause' : 'resume';
    handleAdvancedAction(action, 'campaign', id, title);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{campaigns.length} campaigns</p>
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
            <DropdownMenuItem
              onClick={() => handleExport('excel', 'Campaigns')}>
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf', 'Campaigns')}>
              PDF
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
            {campaigns
              .filter(
                c =>
                  c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.creator.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(c => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{c.title}</p>
                      {c.featured && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1 py-0 h-4">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.contributors} contributors
                    </p>
                  </td>
                  <td className="py-3 text-foreground">{c.creator}</td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {c.category}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-foreground">${c.goal}</td>
                  <td className="py-3 text-right text-secondary pr-6">
                    ${c.raised}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(c.status) as any}>
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
                                data: c,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleFeatured(c.id, c.featured, c.title)
                            }>
                            <Star
                              className={`w-4 h-4 mr-2 ${c.featured ? 'fill-amber-500 text-amber-500' : ''}`}
                            />{' '}
                            {c.featured ? 'Unfeature' : 'Feature'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              onToggleStatus(c.id, c.status, c.title)
                            }>
                            {c.status === 'active' ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" /> Pause
                                Campaign
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" /> Resume
                                Campaign
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
      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type}
        targetType="campaign"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}
