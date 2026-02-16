'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/presence/StatusBadge';
import type { FriendPresence } from '@/store/presenceStore';
import { createClient } from '@/lib/supabase/client';

interface FriendCardProps {
  friend: FriendPresence;
  currentUserId: string;
}

// Elapsed timer that ticks every second for active sessions
function LiveSessionTimer({ sessionStart }: { sessionStart: string }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    function update() {
      const diff = Math.floor(
        (Date.now() - new Date(sessionStart).getTime()) / 1000
      );
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [sessionStart]);

  return (
    <span className="timer-display text-xs text-accent-focus">{elapsed}</span>
  );
}

type NudgeType = 'coffee-break' | 'focus-up' | 'high-five';

const NUDGE_TYPES = [
  { type: 'coffee-break' as NudgeType, icon: '☕', title: 'Suggest a break' },
  { type: 'focus-up' as NudgeType, icon: '🔥', title: 'Encourage focus' },
  { type: 'high-five' as NudgeType, icon: '✋', title: 'High five!' },
] as const;

export function FriendCard({ friend, currentUserId }: FriendCardProps) {
  const supabase = createClient();
  const [nudgeSent, setNudgeSent] = useState<string | null>(null);

  const handleNudge = async (type: NudgeType) => {
    const { error } = await supabase.from('nudges').insert({
      sender_id: currentUserId,
      receiver_id: friend.id,
      type,
    } as any);

    if (!error) {
      setNudgeSent(type);
      setTimeout(() => setNudgeSent(null), 2000);
    }
  };

  const ringColor =
    friend.status === 'focusing'
      ? 'ring-accent-focus'
      : friend.status === 'break'
        ? 'ring-accent-break'
        : 'ring-border';

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50',
        friend.status === 'offline' && 'opacity-50'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2',
          ringColor,
          friend.status === 'focusing' ? 'bg-accent-focus/15 text-accent-focus' :
          friend.status === 'break' ? 'bg-accent-break/15 text-accent-break' :
          'bg-muted text-muted-foreground'
        )}
      >
        {friend.username.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">
            {friend.username}
          </span>
          <StatusBadge status={friend.status} size="sm" showLabel={false} />
        </div>

        {friend.status === 'focusing' && (
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {friend.subject && (
              <>
                <span className="truncate">{friend.subject}</span>
                <span>·</span>
              </>
            )}
            {friend.sessionStart && (
              <LiveSessionTimer sessionStart={friend.sessionStart} />
            )}
          </div>
        )}

        {friend.status === 'break' && (
          <p className="mt-0.5 text-xs text-muted-foreground">On break ☕</p>
        )}

        {friend.status === 'idle' && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {friend.totalFocusHours}h total
          </p>
        )}
      </div>

      {/* Nudge buttons */}
      <div className="flex gap-0.5 shrink-0">
        {NUDGE_TYPES.map((n) => (
          <Button
            key={n.type}
            variant="ghost"
            size="icon-xs"
            title={n.title}
            className={cn(
              'text-base',
              nudgeSent === n.type && 'animate-bounce'
            )}
            onClick={() => handleNudge(n.type)}
            disabled={nudgeSent !== null}
          >
            {n.icon}
          </Button>
        ))}
      </div>
    </div>
  );
}
