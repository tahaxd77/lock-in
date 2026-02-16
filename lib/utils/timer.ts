/**
 * Format seconds into MM:SS display string.
 */
export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Check if a session qualifies as "Deep Work" (> 50 minutes).
 */
export function isDeepWork(durationMinutes: number): boolean {
  return durationMinutes > 50;
}

/**
 * Convert minutes to seconds.
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Calculate session duration in minutes from start/end timestamps.
 */
export function calculateDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 60000);
}

/**
 * Duration presets in minutes for the timer controls.
 */
export const DURATION_PRESETS = [
  { label: '25 min', minutes: 25 },
  { label: '50 min', minutes: 50 },
  { label: '90 min', minutes: 90 },
] as const;
