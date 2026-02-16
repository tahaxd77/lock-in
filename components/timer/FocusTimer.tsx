'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { formatTime, DURATION_PRESETS, minutesToSeconds } from '@/lib/utils/timer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface FocusTimerProps {
  userId: string;
}

export function FocusTimer({ userId }: FocusTimerProps) {
  const timer = useTimer(userId);
  const [inputSubject, setInputSubject] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleStart = () => {
    const subject = inputSubject.trim() || 'Focus Session';
    timer.start(subject);
  };

  const handleStop = () => {
    timer.stop();
    setInputSubject('');
  };

  const handleSelectSubject = (subject: string) => {
    setInputSubject(subject);
    setShowSuggestions(false);
  };

  const isIdle = timer.status === 'idle';
  const isRunning = timer.status === 'running';
  const isPaused = timer.status === 'paused';

  // Determine timer ring colour class
  const timerColorClass = isRunning
    ? 'text-accent-focus'
    : isPaused
      ? 'text-yellow-400'
      : 'text-accent-focus';

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle>Focus Timer</CardTitle>
          <span className="text-2xl">
            {isRunning ? '🎯' : isPaused ? '⏸️' : '⏱️'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Timer Display ────────────────────────────────── */}
        <div className="text-center">
          <div
            className={cn(
              'timer-display text-6xl font-bold sm:text-7xl transition-colors duration-300',
              timerColorClass,
              isRunning && 'animate-pulse'
            )}
          >
            {formatTime(timer.timeRemaining)}
          </div>
          <p className="mt-2 text-muted-foreground">
            {isRunning
              ? `Focusing on: ${timer.subject}`
              : isPaused
                ? 'Session paused'
                : 'Pomodoro Focus Session'}
          </p>
        </div>

        {/* ── Subject Input (visible when idle) ────────────── */}
        {isIdle && (
          <div className="relative" ref={suggestionsRef}>
            <Input
              placeholder="What are you working on?"
              value={inputSubject}
              onChange={(e) => {
                setInputSubject(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleStart();
                  setShowSuggestions(false);
                }
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && timer.recentSubjects.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-lg border bg-card shadow-lg overflow-hidden">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  Recent subjects
                </div>
                {timer.recentSubjects
                  .filter((s) =>
                    s.toLowerCase().includes(inputSubject.toLowerCase())
                  )
                  .map((subject) => (
                    <button
                      key={subject}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                      onClick={() => handleSelectSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── Controls ─────────────────────────────────────── */}
        <div className="flex gap-3">
          {isIdle && (
            <Button
              className="flex-1 bg-accent-focus text-black font-semibold hover:bg-accent-focus/90"
              onClick={handleStart}
            >
              Start Focus Session 🚀
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={timer.pause}
              >
                ⏸️ Pause
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleStop}
              >
                ⏹️ Stop
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                className="flex-1 bg-accent-focus text-black font-semibold hover:bg-accent-focus/90"
                onClick={timer.resume}
              >
                ▶️ Resume
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleStop}
              >
                ⏹️ Stop
              </Button>
            </>
          )}
        </div>

        {/* ── Duration Presets (visible when idle) ──────────── */}
        {isIdle && (
          <div className="grid grid-cols-3 gap-3">
            {DURATION_PRESETS.map((preset) => {
              const presetSeconds = minutesToSeconds(preset.minutes);
              const isActive = timer.duration === presetSeconds;
              return (
                <Button
                  key={preset.label}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    isActive &&
                      'bg-accent-focus text-black hover:bg-accent-focus/90'
                  )}
                  onClick={() => timer.setDuration(presetSeconds)}
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
