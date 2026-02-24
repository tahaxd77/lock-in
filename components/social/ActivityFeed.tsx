'use client';

import React from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';

interface ActivityFeedProps {
  currentUserId: string;
}

export function ActivityFeed({ currentUserId }: ActivityFeedProps) {
  const { events, loading } = useActivityFeed(currentUserId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Recent Activity</CardTitle>
          <span className="text-lg">📰</span>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="py-6 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-accent-focus" />
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          </div>
        )}

        {!loading && events.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Start your first session to see activity here! 📊
          </p>
        )}

        {!loading && events.length > 0 && (
          <div className="max-h-[280px] -mx-1 space-y-1 overflow-y-auto pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent/40"
              >
                <span className="mt-0.5 text-base shrink-0">{event.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">{event.message}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(event.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
