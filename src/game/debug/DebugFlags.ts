function getFlag(name: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const val = params.get(name);
  return val !== null && val !== '0' && val !== 'false';
}

export const DebugFlags = {
  /** God mode — player cannot die or take damage. Enable with ?god=1 or ?god=true */
  get godMode() {
    return getFlag('god');
  },
} as const;
