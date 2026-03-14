/**
 * Debug flags parsed from URL search params.
 * Usage: ?god=1  (or ?god=true)
 *
 * These are read once at import time so they're always synchronous.
 */
const params = new URLSearchParams(
  typeof window !== 'undefined' ? window.location.search : '',
);

function flag(name: string): boolean {
  const val = params.get(name);
  return val !== null && val !== '0' && val !== 'false';
}

export const DebugFlags = {
  /** God mode — player cannot die or take damage. Enable with ?god=1 */
  godMode: flag('god'),
} as const;
