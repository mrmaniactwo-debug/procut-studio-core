// Utilities for industry-standard timecode formatting/parsing (HH:MM:SS:FF)

export const DEFAULT_FPS = 30;
export const TIMECODE_PLACEHOLDER = "--:--:--:--";

// Clamp number to integer range safely
const clampInt = (n: number, min: number, max: number) => {
  const v = Math.floor(n);
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
};
/**
 * Format seconds as HH:MM:SS:FF given an fps.
 * - seconds can be fractional; frames are derived from the fractional part.
 */
export function formatTimecode(seconds: number, fps: number = DEFAULT_FPS): string {
  if (!Number.isFinite(seconds) || seconds < 0) return TIMECODE_PLACEHOLDER;

  const totalFrames = Math.round(seconds * fps);
  const frames = totalFrames % fps;
  const totalSeconds = Math.floor(totalFrames / fps);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  const ff = String(frames).padStart(2, "0");
  return `${hh}:${mm}:${ss}:${ff}`;
}

/**
 * Parse a time string into seconds (float) using fps for frame conversion.
 * Supports:
 * - HH:MM:SS:FF (frames)
 * - HH:MM:SS
 * - MM:SS
 */
export function parseTimecode(input: string, fps: number = DEFAULT_FPS): number | undefined {
  if (!input) return undefined;
  const parts = input.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "")) return undefined;

  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return undefined;

  if (nums.length === 4) {
    const [hh, mm, ss, ff] = nums;
    const h = clampInt(hh, 0, 99);
    const m = clampInt(mm, 0, 59);
    const s = clampInt(ss, 0, 59);
    const f = clampInt(ff, 0, fps - 1);
    return h * 3600 + m * 60 + s + f / fps;
  }
  if (nums.length === 3) {
    const [hh, mm, ss] = nums;
    const h = clampInt(hh, 0, 99);
    const m = clampInt(mm, 0, 59);
    const s = clampInt(ss, 0, 59);
    return h * 3600 + m * 60 + s;
  }
  if (nums.length === 2) {
    const [mm, ss] = nums;
    const m = clampInt(mm, 0, 99);
    const s = clampInt(ss, 0, 59);
    return m * 60 + s;
  }
  return undefined;
}
