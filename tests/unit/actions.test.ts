import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/redis", () => {
  const store = {
    lpush: vi.fn(),
    lrange: vi.fn(),
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  };
  return { redis: store };
});

import { redis } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth/guards";
import {
  logVisit,
  getVisits,
  deleteAllVisits,
  getCacheSettings,
  setCacheSettings,
} from "@/app/actions";

const mockedRedis = redis as unknown as {
  lpush: ReturnType<typeof vi.fn>;
  lrange: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};
const mockedRequireAdmin = requireAdmin as unknown as ReturnType<typeof vi.fn>;

describe("actions.ts — Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logVisit", () => {
    it("stores the visit as JSON in the visits list", async () => {
      mockedRedis.lpush.mockResolvedValueOnce(1);

      const result = await logVisit({
        id: "abc-123",
        name: "Juan",
        userAgent: "Mozilla/5.0",
      });

      expect(result.success).toBe(true);
      expect(mockedRedis.lpush).toHaveBeenCalledTimes(1);
      const [key, payload] = mockedRedis.lpush.mock.calls[0] as [string, string];
      expect(key).toBe("visits");
      const parsed = JSON.parse(payload);
      expect(parsed.id).toBe("abc-123");
      expect(parsed.name).toBe("Juan");
      expect(parsed.device).toBe("Mozilla/5.0");
      expect(parsed.uniqueId).toMatch(/^[0-9a-f-]{36}$/i);
      expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("returns success false when redis throws", async () => {
      mockedRedis.lpush.mockRejectedValueOnce(new Error("boom"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await logVisit({
        id: "x",
        userAgent: "ua",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to log visit");
      consoleSpy.mockRestore();
    });
  });

  describe("getVisits", () => {
    it("throws when caller is not admin", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({ ok: false, reason: "missing", status: 401 });
      await expect(getVisits()).rejects.toThrow("UNAUTHORIZED");
      expect(mockedRedis.lrange).not.toHaveBeenCalled();
    });

    it("parses JSON entries returned by redis", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({
        ok: true,
        session: { email: "admin@x.com", role: "admin", isAuthorized: true },
      });
      mockedRedis.lrange.mockResolvedValueOnce([
        JSON.stringify({ id: "1", uniqueId: "u1", timestamp: "t", device: "d" }),
        JSON.stringify({ id: "2", uniqueId: "u2", timestamp: "t", device: "d" }),
      ]);

      const visits = await getVisits();
      expect(visits).toHaveLength(2);
      expect(visits[0].id).toBe("1");
      expect(mockedRedis.lrange).toHaveBeenCalledWith("visits", 0, -1);
    });

    it("returns [] and logs when redis throws", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({
        ok: true,
        session: { email: "admin@x.com", role: "admin", isAuthorized: true },
      });
      mockedRedis.lrange.mockRejectedValueOnce(new Error("down"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const visits = await getVisits();
      expect(visits).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("deleteAllVisits", () => {
    it("throws when caller is not admin", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({ ok: false, reason: "invalid", status: 401 });
      await expect(deleteAllVisits()).rejects.toThrow("UNAUTHORIZED");
      expect(mockedRedis.del).not.toHaveBeenCalled();
    });

    it("deletes the visits key on success", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({
        ok: true,
        session: { email: "admin@x.com", role: "admin", isAuthorized: true },
      });
      mockedRedis.del.mockResolvedValueOnce(1);

      const result = await deleteAllVisits();
      expect(result.success).toBe(true);
      expect(mockedRedis.del).toHaveBeenCalledWith("visits");
    });

    it("returns success false when redis throws", async () => {
      mockedRequireAdmin.mockResolvedValueOnce({
        ok: true,
        session: { email: "admin@x.com", role: "admin", isAuthorized: true },
      });
      mockedRedis.del.mockRejectedValueOnce(new Error("fail"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await deleteAllVisits();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete visits");
      consoleSpy.mockRestore();
    });
  });

  describe("getCacheSettings", () => {
    it("returns stored settings", async () => {
      mockedRedis.get.mockResolvedValueOnce({ forceUpdate: true });
      const result = await getCacheSettings();
      expect(result).toEqual({ forceUpdate: true });
      expect(mockedRedis.get).toHaveBeenCalledWith("settings:cache");
    });

    it("returns default when no settings stored", async () => {
      mockedRedis.get.mockResolvedValueOnce(null);
      const result = await getCacheSettings();
      expect(result).toEqual({ forceUpdate: false });
    });

    it("returns default and logs when redis throws", async () => {
      mockedRedis.get.mockRejectedValueOnce(new Error("x"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await getCacheSettings();
      expect(result).toEqual({ forceUpdate: false });
      consoleSpy.mockRestore();
    });
  });

  describe("setCacheSettings", () => {
    it("writes the settings object", async () => {
      mockedRedis.set.mockResolvedValueOnce("OK");
      const result = await setCacheSettings(true);
      expect(result.success).toBe(true);
      expect(mockedRedis.set).toHaveBeenCalledWith("settings:cache", { forceUpdate: true });
    });

    it("returns success false when redis throws", async () => {
      mockedRedis.set.mockRejectedValueOnce(new Error("x"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const result = await setCacheSettings(false);
      expect(result.success).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});