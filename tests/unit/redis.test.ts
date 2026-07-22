import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("redis singleton", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when KV env is missing", async () => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await expect(import("@/lib/redis")).rejects.toThrow(/Upstash Redis/);
  });

  it("builds a client when env vars are present", async () => {
    process.env.KV_REST_API_URL = "https://example.upstash.io";
    process.env.KV_REST_API_TOKEN = "token";
    const mod = await import("@/lib/redis");
    expect(mod.redis).toBeDefined();
    expect(typeof (mod.redis as { get?: unknown }).get).toBe("function");
  });
});
