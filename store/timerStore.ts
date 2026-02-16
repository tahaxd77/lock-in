'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  status: TimerStatus;
  timeRemaining: number;
  duration: number;
  subject: string;
  sessionId: string | null;
  startedAt: string | null;
  recentSubjects: string[];
}

interface TimerActions {
  start: (subject: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  setDuration: (seconds: number) => void;
  setSubject: (subject: string) => void;
  setSessionId: (id: string) => void;
  reset: () => void;
  addRecentSubject: (subject: string) => void;
}

const DEFAULT_DURATION = 25 * 60; // 25 minutes

export const useTimerStore = create<TimerState & TimerActions>()(
  persist(
    (set, get) => ({
      // State
      status: 'idle',
      timeRemaining: DEFAULT_DURATION,
      duration: DEFAULT_DURATION,
      subject: '',
      sessionId: null,
      startedAt: null,
      recentSubjects: [
        'Compiler Design',
        'Data Structures',
        'Final Year Project',
        'Web Development',
      ],

      // Actions
      start: (subject: string) => {
        const state = get();
        set({
          status: 'running',
          subject,
          timeRemaining: state.duration,
          startedAt: new Date().toISOString(),
        });
        // Add to recent subjects
        get().addRecentSubject(subject);
      },

      pause: () => set({ status: 'paused' }),

      resume: () => set({ status: 'running' }),

      stop: () =>
        set({
          status: 'idle',
          timeRemaining: get().duration,
          subject: '',
          sessionId: null,
          startedAt: null,
        }),

      tick: () => {
        const { timeRemaining } = get();
        if (timeRemaining <= 0) return;
        set({ timeRemaining: timeRemaining - 1 });
      },

      setDuration: (seconds: number) =>
        set((state) => ({
          duration: seconds,
          // Only update remaining time if idle
          timeRemaining: state.status === 'idle' ? seconds : state.timeRemaining,
        })),

      setSubject: (subject: string) => set({ subject }),

      setSessionId: (id: string) => set({ sessionId: id }),

      reset: () =>
        set({
          status: 'idle',
          timeRemaining: get().duration,
          subject: '',
          sessionId: null,
          startedAt: null,
        }),

      addRecentSubject: (subject: string) => {
        if (!subject.trim()) return;
        const { recentSubjects } = get();
        const filtered = recentSubjects.filter(
          (s) => s.toLowerCase() !== subject.toLowerCase()
        );
        set({ recentSubjects: [subject, ...filtered].slice(0, 8) });
      },
    }),
    {
      name: 'focusfriends-timer',
      partialize: (state) => ({
        duration: state.duration,
        recentSubjects: state.recentSubjects,
      }),
    }
  )
);
