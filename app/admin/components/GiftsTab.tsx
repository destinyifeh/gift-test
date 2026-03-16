'use client';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Download, Eye, Flag, MoreVertical} from 'lucide-react';
import {useState} from 'react';
import {toast} from 'sonner';
import {ActionAdvancedModal} from './ActionAdvancedModal';
import {mockGifts} from './mock';
import {handleExport, statusBadge} from './utils';

interface GiftsTabProps {
  searchQuery: string;
  addLog: (action: string) => void;
  setViewDetailsModal: (modal: any) => void;
}

export function GiftsTab({
  searchQuery,
  addLog,
  setViewDetailsModal,
}: GiftsTabProps) {
  const [gifts, setGifts] = useState(mockGifts);
  const [advancedModal, setAdvancedModal] = useState<{
    isOpen: boolean;
    type: 'flag';
    targetId: string;
    targetName: string;
  }>({
    isOpen: false,
    type: 'flag',
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
    const logMessage = `${formattedType}ged gift ${targetName}. Reason: ${data.reason}`;

    if (type === 'flag') {
      setGifts(prev =>
        prev.map(g => (g.id === targetId ? {...g, status: 'flagged'} : g)),
      );
    }

    toast.success(`${formattedType} action confirmed for ${targetName}`);
    addLog(logMessage);
    setAdvancedModal(prev => ({...prev, isOpen: false}));
  };

  const onFlag = (id: string) => {
    handleAdvancedAction('flag', 'gift', id, id);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{gifts.length} gifts</p>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="money">Money</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="giftcard">Gift Card</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv', 'Gifts')}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel', 'Gifts')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf', 'Gifts')}>
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 font-medium">ID</th>
              <th className="text-left py-2 font-medium">Sender</th>
              <th className="text-left py-2 font-medium">Recipient</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium pr-6">Fee</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {gifts
              .filter(
                g =>
                  g.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  g.recipient
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  g.id.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map(g => (
                <tr key={g.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-xs text-muted-foreground">
                    {g.id}
                  </td>
                  <td className="py-3 text-foreground">{g.sender}</td>
                  <td className="py-3 text-foreground">{g.recipient}</td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      {g.type}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-foreground">
                    ${g.amount}
                  </td>
                  <td className="py-3 text-right text-muted-foreground pr-6">
                    ${g.fee}
                  </td>
                  <td className="py-3 pl-6">
                    <Badge variant={statusBadge(g.status) as any}>
                      {g.status}
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
                                title: 'Gift Details',
                                data: g,
                              })
                            }>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onFlag(g.id)}>
                            <Flag className="w-4 h-4 mr-2" /> Flag Gift
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
        targetType="gift"
        targetName={advancedModal.targetName}
        onConfirm={onConfirmAdvancedAction}
      />
    </div>
  );
}
