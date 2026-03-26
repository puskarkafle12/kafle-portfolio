/**
 * No splash overlay — main UI is available on first paint.
 * Kept for a stable API if App expects `showContent`.
 */
export function useIntroLoader() {
  return { showContent: true }
}
