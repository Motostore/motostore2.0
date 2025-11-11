'use client';

// Defaults inyectados por Next (build-time)
export const ENV_ANNOUNCEMENT_HEADER =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_HEADER ?? '';
export const ENV_ANNOUNCEMENT_HEADER_ENABLED =
  (process.env.NEXT_PUBLIC_ANNOUNCEMENT_HEADER_ENABLED ?? '1') !== '0';

export const ENV_ANNOUNCEMENT_MARQUEE =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_MARQUEE ?? '';
export const ENV_ANNOUNCEMENT_MARQUEE_ENABLED =
  (process.env.NEXT_PUBLIC_ANNOUNCEMENT_MARQUEE_ENABLED ?? '1') !== '0';

// Helpers para leer override en runtime (localStorage)
export function getRuntimeString(key: string, fallback: string) {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(key);
    if (v !== null) return v;
  }
  return fallback;
}
export function getRuntimeBool(key: string, fallback: boolean) {
  if (typeof window !== 'undefined') {
    const v = localStorage.getItem(key);
    if (v === '1') return true;
    if (v === '0') return false;
  }
  return fallback;
}
