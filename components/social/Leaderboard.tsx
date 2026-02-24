'use client';

import React from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';

const RANK_STYLES: Record<number, { medal: string; border: string; bg: string }> = {
  1: { medal: '🥇', border: 'border-yellow-500/40', bg: 'bg-yellow-500/5' },
  2: { medal: '🥈', border: 'border-gray-400/40', bg: 'bg-gray-400/5' },
  3: { medal: '🥉', border: 'border-amber-700/40', bg: 'bg-amber-700/5' },
};

export function Leaderboard() {
  const { rankings, loading } = useLeaderboard();

  const formatHours = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Weekly Leaderboard</CardTitle>
          <span className="text-lg">🏆</span>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="py-6 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-accent-focus" />
            <p className="mt-2 text-xs text-muted-foreground">Loading…</p>
          </div>
        )}

        {!loading && rankings.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-2xl mb-1">🏆</p>
            <p className="text-sm text-muted-foreground">
              No sessions this week yet.
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start focusing to claim the top spot!
            </p>
          </div>
        )}

        {!loading && rankings.length > 0 && (
          <div className="space-y-1.5">
            {rankings.map((entry) => {
              const style = RANK_STYLES[entry.rank];
              const isTop3 = entry.rank <= 3;

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                    isTop3 && style
                      ? `border ${style.border} ${style.bg}`
                      : 'hover:bg-accent/40'
                  )}
                >
                  {/* Rank */}
                  <span className="w-6 text-center text-sm font-bold shrink-0">
                    {isTop3 && style ? style.medal : `#${entry.rank}`}
                  </span>

                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                      isTop3
                        ? 'bg-accent-focus/15 text-accent-focus'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {entry.username.charAt(0).toUpperCase()}
                  </div>

                  {/* Name */}
                  <span
                    className={cn(
                      'flex-1 truncate text-sm',
                      isTop3 ? 'font-semibold' : 'font-medium'
                    )}
                  >
                    {entry.username}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center gap-2 shrink-0">
                    {entry.deepWorkSessions > 0 && (
                      <span className="text-[10px] text-accent-focus" title="Deep Work sessions">
                        🔥{entry.deepWorkSessions}
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-sm font-mono',
                        isTop3 ? 'text-accent-focus font-bold' : 'text-muted-foreground'
                      )}
                    >
                      {formatHours(entry.totalMinutes)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
