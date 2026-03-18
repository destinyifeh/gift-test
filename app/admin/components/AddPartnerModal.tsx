'use client';

import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

interface AddPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  partner: {
    name: string;
    email: string;
    owner: string;
    share: number;
  };
  setPartner: (partner: any) => void;
}

export function AddPartnerModal({
  open,
  onOpenChange,
  onAdd,
  partner,
  setPartner,
}: AddPartnerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Partner</DialogTitle>
          <DialogDescription>
            Register a new integration partner. They will be granted an API key
            for access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Partner Name</Label>
            <Input
              id="name"
              placeholder="e.g. My Awesome App"
              value={partner.name}
              onChange={e => setPartner({...partner, name: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Partner Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. contact@awesomeapp.com"
              value={partner.email}
              onChange={e => setPartner({...partner, email: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner">Owner / Organization</Label>
            <Input
              id="owner"
              placeholder="e.g. Alex Tech Inc."
              value={partner.owner}
              onChange={e => setPartner({...partner, owner: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="share">Revenue Share (%)</Label>
            <Input
              id="share"
              type="number"
              placeholder="5"
              value={partner.share}
              onChange={e =>
                setPartner({...partner, share: Number(e.target.value)})
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="hero" onClick={onAdd}>
            Create Partner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
