'use client';

import {Avatar, AvatarFallback} from '@/components/ui/avatar';
import {Card, CardContent} from '@/components/ui/card';

import {supporters} from './mock';

export function SupportersTab() {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        {supporters.length} total supporters
      </p>
      {supporters.map(s => (
        <Card key={s.id} className="border-border">
          <CardContent className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-muted text-xs">
                  {s.name === 'Anonymous' ? '?' : s.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                {s.message && (
                  <p className="text-xs text-muted-foreground">"{s.message}"</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">${s.amount}</p>
              <p className="text-xs text-muted-foreground">{s.date}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
