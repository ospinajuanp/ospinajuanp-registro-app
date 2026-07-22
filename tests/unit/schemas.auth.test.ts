import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";

describe("loginSchema", () => {
  it("accepts identifier and password", () => {
    const result = loginSchema.parse({ identifier: "user", password: "secret" });
    expect(result.identifier).toBe("user");
    expect(result.password).toBe("secret");
    expect(result.rememberMe).toBe(false);
  });

  it("rejects empty identifier (frontend guarantees non-empty)", () => {
    expect(() => loginSchema.parse({ identifier: "", password: "x" })).toThrow();
    expect(() => loginSchema.parse({ identifier: "   ", password: "x" })).toThrow();
  });

  it("trims identifier whitespace", () => {
    const result = loginSchema.parse({ identifier: "  user  ", password: "secret" });
    expect(result.identifier).toBe("user");
  });

  it("sets rememberMe=true when provided", () => {
    const result = loginSchema.parse({
      identifier: "u",
      password: "p",
      rememberMe: true,
    });
    expect(result.rememberMe).toBe(true);
  });

  it("rejects empty password", () => {
    expect(() => loginSchema.parse({ identifier: "u", password: "" })).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => loginSchema.parse({})).toThrow();
  });
});

describe("registerSchema", () => {
  const valid = { username: "juan", email: "juan@example.com", password: "secret123" };

  it("accepts a valid payload", () => {
    const result = registerSchema.parse(valid);
    expect(result.email).toBe("juan@example.com");
    expect(result.username).toBe("juan");
  });

  it("normalizes email to lowercase", () => {
    const result = registerSchema.parse({ ...valid, email: "JUAN@Example.COM" });
    expect(result.email).toBe("juan@example.com");
  });

  it("rejects invalid emails", () => {
    expect(() => registerSchema.parse({ ...valid, email: "not-an-email" })).toThrow();
  });

  it("rejects short passwords (<6)", () => {
    expect(() => registerSchema.parse({ ...valid, password: "abc" })).toThrow();
  });

  it("rejects very short usernames (<2)", () => {
    expect(() => registerSchema.parse({ ...valid, username: "a" })).toThrow();
  });
});
