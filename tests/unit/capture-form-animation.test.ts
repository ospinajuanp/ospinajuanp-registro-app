import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  CAPTURE_FORM_STORAGE_KEY,
  getLastSeenTimestamp,
  setLastSeenTimestamp,
  isSameLocalDay,
  shouldAnimateCaptureForm,
} from "@/lib/utils/captureFormAnimation";

describe("captureFormAnimation", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isSameLocalDay", () => {
    it("returns true for two timestamps on the same calendar day", () => {
      const morning = new Date(2026, 6, 22, 8, 0, 0).getTime();
      const evening = new Date(2026, 6, 22, 22, 30, 0).getTime();
      expect(isSameLocalDay(morning, evening)).toBe(true);
    });

    it("returns false for two timestamps on different calendar days", () => {
      const day1 = new Date(2026, 6, 22, 23, 59, 0).getTime();
      const day2 = new Date(2026, 6, 23, 0, 1, 0).getTime();
      expect(isSameLocalDay(day1, day2)).toBe(false);
    });

    it("returns true for the exact same timestamp", () => {
      const t = new Date(2026, 0, 1, 12, 0, 0).getTime();
      expect(isSameLocalDay(t, t)).toBe(true);
    });

    it("returns false across month boundary", () => {
      const lastOfMonth = new Date(2026, 0, 31, 23, 59, 59).getTime();
      const firstOfNext = new Date(2026, 1, 1, 0, 0, 1).getTime();
      expect(isSameLocalDay(lastOfMonth, firstOfNext)).toBe(false);
    });

    it("returns false across year boundary", () => {
      const dec31 = new Date(2026, 11, 31, 23, 59, 59).getTime();
      const jan1 = new Date(2027, 0, 1, 0, 0, 1).getTime();
      expect(isSameLocalDay(dec31, jan1)).toBe(false);
    });
  });

  describe("getLastSeenTimestamp / setLastSeenTimestamp", () => {
    it("returns null when no value is stored", () => {
      expect(getLastSeenTimestamp()).toBeNull();
    });

    it("round-trips a timestamp through localStorage", () => {
      const ts = 1700000000000;
      setLastSeenTimestamp(ts);
      expect(getLastSeenTimestamp()).toBe(ts);
    });

    it("uses the canonical storage key", () => {
      setLastSeenTimestamp(123);
      expect(localStorage.getItem(CAPTURE_FORM_STORAGE_KEY)).toBe("123");
    });

    it("returns null for a corrupt (non-numeric) stored value", () => {
      localStorage.setItem(CAPTURE_FORM_STORAGE_KEY, "not-a-number");
      expect(getLastSeenTimestamp()).toBeNull();
    });
  });

  describe("shouldAnimateCaptureForm", () => {
    it("returns true when no previous timestamp exists", () => {
      expect(shouldAnimateCaptureForm(null, Date.now())).toBe(true);
    });

    it("returns false when the stored timestamp is from today", () => {
      const now = new Date(2026, 6, 22, 12, 0, 0).getTime();
      const earlier = new Date(2026, 6, 22, 8, 0, 0).getTime();
      expect(shouldAnimateCaptureForm(earlier, now)).toBe(false);
    });

    it("returns true when the stored timestamp is from yesterday", () => {
      const now = new Date(2026, 6, 22, 0, 1, 0).getTime();
      const yesterday = new Date(2026, 6, 21, 23, 59, 0).getTime();
      expect(shouldAnimateCaptureForm(yesterday, now)).toBe(true);
    });

    it("returns true when the stored timestamp is from many days ago", () => {
      const now = new Date(2026, 6, 22, 12, 0, 0).getTime();
      const longAgo = new Date(2025, 0, 1, 12, 0, 0).getTime();
      expect(shouldAnimateCaptureForm(longAgo, now)).toBe(true);
    });
  });
});
