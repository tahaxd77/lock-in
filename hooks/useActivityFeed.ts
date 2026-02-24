'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type EventKind = 'session_complete' | 'nudge' | 'user_joined';

export interface FeedEvent {
  id: string;
  kind: EventKind;
  message: string;
  icon: string;
  actorName: string;
  createdAt: string;
}

const NUDGE_ICONS: Record<string, string> = {
  'coffee-break': '☕',
  'focus-up': '🔥',
  'high-five': '✋',
};

/**
 * Merges completed sessions and nudges into a single
 * chronological activity feed, with live updates.
 */
export function useActivityFeed(currentUserId: string | undefined) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const mergeAndSort = useCallback(
    (incoming: FeedEvent[]) => {
      setEvents((prev) => {
        const map = new Map(prev.map((e) => [e.id, e]));
        incoming.forEach((e) => map.set(e.id, e));
        return [...map.values()]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
      });
    },
    []
  );

  // ── Initial fetch ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    async function load() {
      setLoading(true);

      // 1. Completed sessions from last 24h
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, user_id, subject, end_time, duration_minutes, created_at')
        .not('end_time', 'is', null)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(15) as { data: any[] | null };

      // Get usernames for session owners
      const userIds = [...new Set((sessions ?? []).map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds) as { data: any[] | null };

      const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.username]));

      const sessionEvents: FeedEvent[] = (sessions ?? []).map((s: any) => {
        const name = nameMap.get(s.user_id) ?? 'Someone';
        const dur = s.duration_minutes ?? 0;
        return {
          id: `session-${s.id}`,
          kind: 'session_complete' as EventKind,
          message: `${name} completed ${dur} min on ${s.subject} 🎯`,
          icon: dur > 50 ? '🔥' : '🎯',
          actorName: name,
          createdAt: s.end_time ?? s.created_at,
        };
      });

      // 2. Recent nudges
      const { data: nudges } = await supabase
        .from('recent_nudges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15) as { data: any[] | null };

      const nudgeEvents: FeedEvent[] = (nudges ?? []).map((n: any) => {
        const icon = NUDGE_ICONS[n.type] ?? '👋';
        return {
          id: `nudge-${n.id}`,
          kind: 'nudge' as EventKind,
          message: `${n.sender_username} ${icon} ${n.receiver_username}`,
          icon,
          actorName: n.sender_username,
          createdAt: n.created_at,
        };
      });

      mergeAndSort([...sessionEvents, ...nudgeEvents]);
      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Live subscription for new sessions ───────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions' },
        async (payload) => {
          const s = payload.new as any;
          if (!s.end_time) return; // Only care about completions

          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', s.user_id)
            .single() as { data: { username: string } | null };

          const name = profile?.username ?? 'Someone';
          const dur = s.duration_minutes ?? 0;

          mergeAndSort([
            {
              id: `session-${s.id}`,
              kind: 'session_complete',
              message: `${name} completed ${dur} min on ${s.subject} 🎯`,
              icon: dur > 50 ? '🔥' : '🎯',
              actorName: name,
              createdAt: s.end_time,
            },
          ]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nudges' },
        async (payload) => {
          const n = payload.new as any;

          const { data: senderData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', n.sender_id)
            .single() as { data: { username: string } | null };
          const { data: receiverData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', n.receiver_id)
            .single() as { data: { username: string } | null };

          const sender = senderData;
          const receiver = receiverData;

          const icon = NUDGE_ICONS[n.type] ?? '👋';
          mergeAndSort([
            {
              id: `nudge-${n.id}`,
              kind: 'nudge',
              message: `${sender?.username ?? 'Someone'} ${icon} ${receiver?.username ?? 'someone'}`,
              icon,
              actorName: sender?.username ?? 'Someone',
              createdAt: n.created_at,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  return { events, loading };
}
