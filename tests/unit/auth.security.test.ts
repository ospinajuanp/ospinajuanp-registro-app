import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timingSafeEqual } from "node:crypto";

function isAdminPassword(password: string, admin: string): boolean {
  if (!admin) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(admin);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

describe("isAdminPassword (timingSafeEqual helper)", () => {
  it("matches equal strings", () => {
    expect(isAdminPassword("s3cret!", "s3cret!")).toBe(true);
  });

  it("rejects different strings of same length", () => {
    expect(isAdminPassword("aaaaaa", "bbbbbb")).toBe(false);
  });

  it("rejects strings of different length", () => {
    expect(isAdminPassword("short", "muchlongerstring")).toBe(false);
    expect(isAdminPassword("muchlongerstring", "short")).toBe(false);
  });

  it("rejects when ADMIN_PASSWORD is empty", () => {
    expect(isAdminPassword("any", "")).toBe(false);
  });
});

describe("JWT_SECRET loader rejects insecure values", () => {
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalEnv;
    }
  });

  it("throws when JWT_SECRET is missing", async () => {
    delete process.env.JWT_SECRET;
    await expect(import("@/lib/auth/jwt")).rejects.toThrow(/JWT_SECRET no está definido/);
  });

  it("throws when JWT_SECRET is the placeholder", async () => {
    process.env.JWT_SECRET = "fallback-secret-for-dev-only";
    await expect(import("@/lib/auth/jwt")).rejects.toThrow(/valor inseguro/);
  });

  it("throws when JWT_SECRET looks like a bcrypt hash", async () => {
    process.env.JWT_SECRET = "$2a$12$phrezAEly0FS/hx5Xrlppuc6/KMNGkWdRkgAKIH9M.KhQxkKf69MC";
    await expect(import("@/lib/auth/jwt")).rejects.toThrow(/valor inseguro/);
  });

  it("accepts a real random secret", async () => {
    process.env.JWT_SECRET = "a".repeat(64);
    const mod = await import("@/lib/auth/jwt");
    expect(mod.JWT_SECRET).toBeInstanceOf(Uint8Array);
  });
});
