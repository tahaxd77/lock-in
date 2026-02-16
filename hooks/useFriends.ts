'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePresenceStore, type FriendPresence, type UserStatus } from '@/store/presenceStore';

const STATUS_ORDER: Record<UserStatus, number> = {
  focusing: 0,
  break: 1,
  idle: 2,
  offline: 3,
};

interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  current_status: string | null;
  total_focus_hours: number;
}

/**
 * Fetches all user profiles (except self), subscribes to real-time
 * profile changes, and keeps the presenceStore in sync.
 */
export function useFriends(currentUserId: string | undefined) {
  const { friends, setFriends, updateFriend } = usePresenceStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Initial fetch
  useEffect(() => {
    if (!currentUserId) return;

    async function fetchFriends() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, current_status, total_focus_hours')
        .neq('id', currentUserId!) as { data: ProfileRow[] | null; error: any };

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const mapped: FriendPresence[] = (data ?? []).map((p) => ({
        id: p.id,
        username: p.username ?? 'Unknown',
        avatarUrl: p.avatar_url,
        status: (p.current_status as UserStatus) ?? 'offline',
        totalFocusHours: Number(p.total_focus_hours) || 0,
      }));

      // Sort by status priority
      mapped.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

      setFriends(mapped);
      setLoading(false);
    }

    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Subscribe to real-time profile status changes
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          const updated = payload.new as {
            id: string;
            current_status: string;
            total_focus_hours: number;
          };
          if (updated.id === currentUserId) return;  // Skip self

          updateFriend(updated.id, {
            status: (updated.current_status as UserStatus) ?? 'idle',
            totalFocusHours: Number(updated.total_focus_hours) || 0,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // Return sorted friends
  const sorted = [...friends].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  return { friends: sorted, loading, error };
}
