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
  AlertTriangle,
  Ban,
  BarChart3,
  CheckCircle,
  Download,
  Eye,
  Key,
  MoreVertical,
  Pause,
  Plus,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {AddPartnerModal} from './AddPartnerModal';
import {PartnerAnalyticsModal} from './PartnerAnalyticsModal';
import {mockPartners} from './mock';
import {handleExport, statusBadge} from './utils';

interface PartnersTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function PartnersTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: PartnersTabProps) {
  const [partners, setPartners] = useState(mockPartners);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [analyticsPartner, setAnalyticsPartner] = useState<any>(null);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'warn' | 'suspend' | 'ban' | 'delete' | 'activate' | 'generate';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'warn',
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
    const logMessage = `${formattedType}ed partner ${targetName}. Reason: ${data.reason}`;

    if (type === 'suspend' || type === 'ban') {
      setPartners(prev =>
        prev.map(p => (p.id === targetId ? {...p, status: 'suspended'} : p)),
      );
    } else if (type === 'delete') {
      setPartners(prev => prev.filter(p => p.id !== targetId));
    } else if (type === 'activate') {
      setPartners(prev =>
        prev.map(p => (p.id === targetId ? {...p, status: 'active'} : p)),
      );
    } else if (type === 'generate') {
      toast.info(`New API Key generated for ${targetName}`);
      // In a real app, we'd update the key in the state/DB
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    owner: '',
    share: 5, // Default 5%
    status: 'active' as const,
  });

  const handleAddPartner = () => {
    if (!newPartner.name || !newPartner.owner || !newPartner.email) {
      toast.error('Please fill in all fields');
      return;
    }
    const partnerToAdd = {
      ...newPartner,
      id: `P00${partners.length + 1}`,
      users: 0,
      gifts: 0,
      revenue: 0,
      joined: new Date().toISOString().split('T')[0],
    };
    setPartners([partnerToAdd, ...partners]);
    setIsAddModalOpen(false);
    setNewPartner({
      name: '',
      email: '',
      owner: '',
      share: 5,
      status: 'active',
    });
    toast.success('Partner added successfully');
    addLog(`Added new partner: ${newPartner.name}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {partners.length} platform partners
        </p>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Partners')}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('excel', 'Partners')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'Partners')}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="hero"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Partner
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">Partner</th>
              <th className="text-right py-2 font-medium">Users</th>
              <th className="text-right py-2 font-medium">Gifts</th>
              <th className="text-right py-2 font-medium">Revenue</th>
              <th className="text-right py-2 font-medium pr-6">Share</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners
              .filter(
                p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.owner.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(p => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.email || p.owner}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 italic">
                      Joined: {p.joined}
                    </p>
                  </td>
                  <td className="py-3 text-right text-foreground font-mono">
                    {p.users.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-foreground font-mono">
                    {p.gifts.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-foreground font-mono font-bold">
                    ${p.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-secondary pr-6 font-bold">
                    ${p.share.toLocaleString()}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(p.status) as any}>
                      {p.status}
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>
                            Partner Management
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              setViewDetailsModal({
                                isOpen: true,
                                title: 'Partner Details',
                                data: p,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setAnalyticsPartner(p)}>
                            <BarChart3 className="w-4 h-4 mr-2" /> Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'generate',
                                'partner',
                                p.id,
                                p.name,
                              )
                            }>
                            <Key className="w-4 h-4 mr-2" /> Generate Key
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground py-1">
                            Moderation
                          </DropdownMenuLabel>

                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'warn',
                                'partner',
                                p.id,
                                p.name,
                              )
                            }>
                            <AlertTriangle className="w-4 h-4 mr-2" /> Warn
                            Partner
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                p.status === 'suspended'
                                  ? 'activate'
                                  : 'suspend',
                                'partner',
                                p.id,
                                p.name,
                              )
                            }>
                            {p.status === 'suspended' ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />{' '}
                                Activate
                              </>
                            ) : (
                              <>
                                <Pause className="w-4 h-4 mr-2" /> Suspend
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleAdvancedAction(
                                'ban',
                                'partner',
                                p.id,
                                p.name,
                              )
                            }>
                            <Ban className="w-4 h-4 mr-2" /> Ban Partner
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleAdvancedAction(
                                'delete',
                                'partner',
                                p.id,
                                p.name,
                              )
                            }>
                            <Trash2 className="w-4 h-4 mr-2" /> Remove Partner
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

      <AddPartnerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddPartner}
        partner={newPartner}
        setPartner={setNewPartner}
      />

      <PartnerAnalyticsModal
        open={!!analyticsPartner}
        onOpenChange={open => !open && setAnalyticsPartner(null)}
        partner={analyticsPartner}
      />

      <ActionAdvancedModal
        isOpen={advancedModal.isOpen}
        onOpenChange={open =>
          setAdvancedModal(prev => ({...prev, isOpen: open}))
        }
        type={advancedModal.type as any}
        targetType="partner"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}
