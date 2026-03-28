'use client';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import {cn} from '@/lib/utils';
import {Building, Check, Loader2, Search} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';

interface Bank {
  id: number | string;
  name: string;
  code: string;
  slug?: string;
}

interface BankPickerProps {
  banks: Bank[];
  value: string;
  onChange: (bank: Bank) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function BankPicker({
  banks,
  value,
  onChange,
  isLoading = false,
  placeholder = 'Select bank',
  disabled = false,
  className,
}: BankPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedBank = useMemo(
    () => banks.find(b => b.code === value),
    [banks, value],
  );

  const filteredBanks = useMemo(() => {
    if (!search.trim()) return banks;
    const query = search.toLowerCase();
    return banks.filter(
      b =>
        b.name.toLowerCase().includes(query) ||
        b.code.toLowerCase().includes(query),
    );
  }, [banks, search]);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = (bank: Bank) => {
    onChange(bank);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled || isLoading}
        className={cn(
          'w-full h-11 justify-start font-normal',
          !selectedBank && 'text-muted-foreground',
          className,
        )}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Building className="w-4 h-4 mr-2 text-muted-foreground" />
        )}
        {selectedBank ? selectedBank.name : placeholder}
      </Button>

      <ResponsiveModal open={open} onOpenChange={setOpen}>
        <ResponsiveModalContent className="sm:max-w-md">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Select Bank</ResponsiveModalTitle>
          </ResponsiveModalHeader>

          <div className="px-4 md:px-6 py-2">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search banks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11"
                autoFocus
              />
            </div>

            {/* Bank List */}
            <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Loading banks...</p>
                </div>
              ) : filteredBanks.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {search ? 'No banks found' : 'No banks available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredBanks.map(bank => {
                    const isSelected = bank.code === value;
                    return (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => handleSelect(bank)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted active:bg-muted/80',
                        )}>
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                            isSelected ? 'bg-primary/10' : 'bg-muted',
                          )}>
                          <Building
                            className={cn(
                              'w-4 h-4',
                              isSelected ? 'text-primary' : 'text-muted-foreground',
                            )}
                          />
                        </div>
                        <span
                          className={cn(
                            'flex-1 text-sm font-medium truncate',
                            isSelected ? 'text-primary' : 'text-foreground',
                          )}>
                          {bank.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full h-11">
              Cancel
            </Button>
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
