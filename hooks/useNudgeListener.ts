'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToastStore } from '@/store/toastStore';

const NUDGE_CONFIG: Record<string, { icon: string; verb: string }> = {
  'coffee-break': { icon: '☕', verb: 'suggested a break for' },
  'focus-up': { icon: '🔥', verb: 'encouraged' },
  'high-five': { icon: '✋', verb: 'high-fived' },
};

/**
 * Listens for incoming nudges via Supabase Realtime and
 * pushes toast notifications into the toast store.
 */
export function useNudgeListener(userId: string | undefined) {
  const addToast = useToastStore((s) => s.addToast);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('nudge-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'nudges',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const nudge = payload.new as {
            id: string;
            sender_id: string;
            type: string;
          };

          // Fetch sender username
          const { data: sender } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', nudge.sender_id)
            .single() as { data: { username: string } | null };

          const senderName = sender?.username ?? 'Someone';
          const cfg = NUDGE_CONFIG[nudge.type] ?? { icon: '👋', verb: 'nudged' };

          addToast({
            icon: cfg.icon,
            senderName,
            message: `${senderName} ${cfg.verb} you!`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
}
