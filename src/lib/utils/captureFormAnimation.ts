/**
 * Capture-form slide-down animation: daily gating via localStorage.
 *
 * The home page capture form (registration) plays a one-shot slide-down
 * animation the first time the user opens it each day. On any subsequent
 * visit on the same calendar day, the form is rendered already open.
 *
 * Storage key: "capture-form-last-seen" (Unix epoch ms as string).
 * Comparison is calendar-day in the user's local timezone.
 */

export const CAPTURE_FORM_STORAGE_KEY = "capture-form-last-seen";
export const CAPTURE_FORM_ANIMATION_MS = 700;

export function getLastSeenTimestamp(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CAPTURE_FORM_STORAGE_KEY);
  if (!raw) return null;
  const ts = parseInt(raw, 10);
  return Number.isFinite(ts) ? ts : null;
}

export function setLastSeenTimestamp(ts: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CAPTURE_FORM_STORAGE_KEY, String(ts));
}

export function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * True if the capture form should play its slide-down animation now.
 * Returns true when no timestamp has been stored yet, or when the
 * stored timestamp is from a previous calendar day.
 */
export function shouldAnimateCaptureForm(
  lastSeen: number | null,
  now: number,
): boolean {
  if (lastSeen === null) return true;
  return !isSameLocalDay(lastSeen, now);
}
