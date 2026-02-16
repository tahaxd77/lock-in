'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { createClient } from '@/lib/supabase/client';

/**
 * Custom hook that wires the Zustand timer store to a real
 * setInterval countdown and handles Supabase session CRUD.
 */
export function useTimer(userId: string | undefined) {
  const store = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  // ── Tick interval ────────────────────────────────────────────────
  useEffect(() => {
    if (store.status === 'running') {
      intervalRef.current = setInterval(() => {
        const { timeRemaining, stop } = useTimerStore.getState();
        if (timeRemaining <= 1) {
          // Timer finished
          stop();
          handleTimerComplete();
        } else {
          useTimerStore.getState().tick();
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status]);

  // ── Focus-mode body attribute ────────────────────────────────────
  useEffect(() => {
    if (store.status === 'running') {
      document.body.dataset.focusMode = 'true';
    } else {
      delete document.body.dataset.focusMode;
    }
  }, [store.status]);

  // ── Supabase helpers ─────────────────────────────────────────────
  // Note: we cast supabase to `any` for mutation calls because the
  // auto-generated types resolve Insert/Update to `never` when RLS
  // policies restrict access. The operations work correctly at runtime.
  const db = supabase as any;

  const createSession = useCallback(
    async (subject: string) => {
      if (!userId) return null;

      const { data, error } = await db
        .from('sessions')
        .insert({
          user_id: userId,
          subject,
          is_public_now: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      // Update profile status
      await db
        .from('profiles')
        .update({ current_status: 'focusing' })
        .eq('id', userId);

      return data?.id ?? null;
    },
    [userId, db]
  );

  const endSession = useCallback(
    async (sessionId: string | null) => {
      if (!userId || !sessionId) return;

      const { error } = await db
        .from('sessions')
        .update({ end_time: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) console.error('Failed to end session:', error);

      // Revert profile status
      await db
        .from('profiles')
        .update({ current_status: 'idle' })
        .eq('id', userId);
    },
    [userId, db]
  );

  // ── Notification on completion ───────────────────────────────────
  const handleTimerComplete = useCallback(() => {
    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('FocusFriends', {
        body: 'Great work! Your focus session is complete. 🎉',
        icon: '/favicon.ico',
      });
    }

    // Play a short beep via Web Audio API (no mp3 file needed)
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio not available – silent fallback
    }
  }, []);

  // ── Public API ───────────────────────────────────────────────────
  const start = useCallback(
    async (subject: string) => {
      // Request notification permission lazily
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      store.start(subject);
      const sessionId = await createSession(subject);
      if (sessionId) store.setSessionId(sessionId);
    },
    [store, createSession]
  );

  const pause = useCallback(() => store.pause(), [store]);
  const resume = useCallback(() => store.resume(), [store]);

  const stop = useCallback(async () => {
    await endSession(store.sessionId);
    store.stop();
  }, [store, endSession]);

  return {
    // State
    status: store.status,
    timeRemaining: store.timeRemaining,
    duration: store.duration,
    subject: store.subject,
    recentSubjects: store.recentSubjects,

    // Actions
    start,
    pause,
    resume,
    stop,
    setDuration: store.setDuration,
    setSubject: store.setSubject,
  };
}
