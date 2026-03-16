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
import {Download, Eye, MoreVertical} from 'lucide-react';
import {useState} from 'react';
import {mockTransactions} from './mock';
import {handleExport, statusBadge} from './utils';

interface TransactionsTabProps {
  searchQuery: string;
  setViewDetailsModal: (modal: any) => void;
}

export function TransactionsTab({
  searchQuery,
  setViewDetailsModal,
}: TransactionsTabProps) {
  const [transactions] = useState(mockTransactions);
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txProviderFilter, setTxProviderFilter] = useState('all');
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      txTypeFilter === 'all' || t.type.toLowerCase() === txTypeFilter;
    const matchesProvider =
      txProviderFilter === 'all' ||
      t.provider.toLowerCase() === txProviderFilter;
    return matchesSearch && matchesType && matchesProvider;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-muted-foreground">
          {filteredTransactions.length} transactions
        </p>
        <div className="flex gap-2">
          <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="gift">Gift</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
          <Select value={txProviderFilter} onValueChange={setTxProviderFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paystack">Paystack</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleExport('csv', 'Transactions')}>
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('excel', 'Transactions')}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport('pdf', 'Transactions')}>
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
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-left py-2 font-medium">From</th>
              <th className="text-left py-2 font-medium">To</th>
              <th className="text-right py-2 font-medium">Amount</th>
              <th className="text-right py-2 font-medium pr-6">Fee</th>
              <th className="text-left py-2 font-medium">Provider</th>
              <th className="text-left py-2 font-medium pl-6">Status</th>
              <th className="text-right py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="py-3 font-mono text-xs text-muted-foreground">
                  {t.id}
                </td>
                <td className="py-3">
                  <Badge variant="outline" className="text-xs">
                    {t.type}
                  </Badge>
                </td>
                <td className="py-3 text-foreground">{t.sender}</td>
                <td className="py-3 text-foreground">{t.recipient}</td>
                <td className="py-3 text-right text-foreground">${t.amount}</td>
                <td className="py-3 text-right text-muted-foreground pr-6">
                  ${t.fee}
                </td>
                <td className="py-3 pl-6">
                  <Badge variant="outline" className="text-xs">
                    {t.provider}
                  </Badge>
                </td>
                <td className="py-3 pl-6">
                  <Badge variant={statusBadge(t.status) as any}>
                    {t.status}
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
                              title: 'Transaction Details',
                              data: t,
                            })
                          }>
                          <Eye className="w-4 h-4 mr-2" /> View Details
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
    </div>
  );
}
