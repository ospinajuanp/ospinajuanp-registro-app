import { describe, it, expect } from "vitest";
import { asAdminSession } from "@/lib/auth/guards";
import type { SessionJwtPayload } from "@/lib/auth/jwt";

const basePayload: SessionJwtPayload = {
  email: "admin@example.com",
  role: "admin",
  isAuthorized: true,
};

describe("asAdminSession", () => {
  it("returns admin session when role=admin and isAuthorized=true", () => {
    const result = asAdminSession(basePayload);
    expect(result).toEqual({
      email: "admin@example.com",
      role: "admin",
      isAuthorized: true,
    });
  });

  it("accepts any role when isAuthorized=true (aligned with middleware)", () => {
    expect(asAdminSession({ ...basePayload, role: "user" })).toEqual({
      email: "admin@example.com",
      role: "admin",
      isAuthorized: true,
    });
  });

  it("returns null when isAuthorized is false", () => {
    expect(asAdminSession({ ...basePayload, isAuthorized: false })).toBeNull();
  });

  it("returns null when isAuthorized is missing", () => {
    const { isAuthorized: _isAuthorized, ...rest } = basePayload;
    expect(asAdminSession(rest)).toBeNull();
  });

  it("accepts isAuthorized as string 'true'", () => {
    expect(asAdminSession({ ...basePayload, isAuthorized: "true" })).not.toBeNull();
  });

  it("returns null when email is empty", () => {
    expect(asAdminSession({ ...basePayload, email: "" })).toBeNull();
  });
});
