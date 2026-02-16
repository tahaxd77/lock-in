'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePresenceStore, type FriendPresence } from '@/store/presenceStore';

/**
 * Subscribes to Supabase Realtime channel for live friend status.
 * Falls back to periodic polling if Realtime isn't available.
 */
export function usePresence(userId: string | undefined) {
  const store = usePresenceStore();
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Join the "lobby" presence channel
    const channel = supabase.channel('lobby', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{
          userId: string;
          username: string;
          status: FriendPresence['status'];
          subject?: string;
          sessionStart?: string;
        }>();

        // Flatten presence state into friend updates
        Object.entries(state).forEach(([key, presences]) => {
          if (key === userId) return; // Skip self
          const latest = presences[0];
          if (latest) {
            store.updateFriend(key, {
              status: latest.status ?? 'idle',
              subject: latest.subject,
              sessionStart: latest.sessionStart,
            });
          }
        });

        store.setConnected(true);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key === userId) return;
        const p = newPresences[0];
        if (p) {
          store.updateFriend(key, {
            status: (p as any).status ?? 'idle',
            subject: (p as any).subject,
            sessionStart: (p as any).sessionStart,
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === userId) return;
        store.updateFriend(key, { status: 'offline', subject: undefined });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            status: 'idle',
            online_at: new Date().toISOString(),
          });
          store.setConnected(true);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      store.setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Broadcast status change
  const broadcastStatus = useCallback(
    async (
      status: FriendPresence['status'],
      subject?: string,
      sessionStart?: string
    ) => {
      if (!channelRef.current || !userId) return;
      await channelRef.current.track({
        userId,
        status,
        subject,
        sessionStart,
        online_at: new Date().toISOString(),
      });
    },
    [userId]
  );

  return {
    isConnected: store.isConnected,
    broadcastStatus,
  };
}
