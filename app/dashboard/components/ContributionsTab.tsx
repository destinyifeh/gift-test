'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';

import {contributions} from './mock';

export function ContributionsTab() {
  return (
    <div className="space-y-4">
      {contributions.map(c => (
        <Card key={c.id} className="border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-foreground">{c.campaign}</p>
              <span className="text-sm text-muted-foreground">
                {c.contributors} contributors
              </span>
            </div>
            <Progress value={c.progress} className="h-2 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                You contributed:{' '}
                <span className="text-primary font-semibold">
                  ${c.contributed}
                </span>
              </span>
              <span className="text-muted-foreground">
                {c.progress}% of ${c.goal}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
