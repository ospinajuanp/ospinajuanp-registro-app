import { describe, it, expect } from "vitest";
import { formatTime } from "@/lib/utils/formatTime";

describe("formatTime", () => {
  it("returns empty string for null/undefined/empty", () => {
    expect(formatTime(null)).toBe("");
    expect(formatTime(undefined)).toBe("");
    expect(formatTime("")).toBe("");
  });

  it("formats a Date object to 12-hour am/pm", () => {
    // 15:00 UTC → "3:00 p.m."
    expect(formatTime(new Date(Date.UTC(2024, 0, 1, 15, 0)))).toBe("3:00 p.m.");
    // 00:00 UTC → "12:00 a.m."
    expect(formatTime(new Date(Date.UTC(2024, 0, 1, 0, 0)))).toBe("12:00 a.m.");
    // 12:00 UTC → "12:00 p.m."
    expect(formatTime(new Date(Date.UTC(2024, 0, 1, 12, 0)))).toBe("12:00 p.m.");
    // 08:05 UTC → "8:05 a.m."
    expect(formatTime(new Date(Date.UTC(2024, 0, 1, 8, 5)))).toBe("8:05 a.m.");
  });

  it("parses ISO strings", () => {
    expect(formatTime("1899-12-30T15:00:00Z")).toBe("3:00 p.m.");
    expect(formatTime("1899-12-30T08:05:00Z")).toBe("8:05 a.m.");
  });

  it("returns string lower-cased when it cannot be parsed", () => {
    expect(formatTime("8:00 a.m.")).toBe("8:00 a.m.");
    expect(formatTime("ALREADY UPPER")).toBe("already upper");
  });
});
