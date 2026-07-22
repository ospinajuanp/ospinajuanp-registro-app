import { describe, it, expect, vi, beforeEach } from "vitest";

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode("test-jwt-secret-for-vitest-only-32bytes-long-pad");

async function signToken(payload: Record<string, unknown>, secret = SECRET): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .setIssuedAt()
    .sign(secret);
}

function makeRequest(pathname: string, token?: string): NextRequest {
  const headers = new Headers();
  if (token) headers.set("cookie", `auth-token=${token}`);
  const req = new NextRequest(`http://test${pathname}`, { headers });
  if (token) req.cookies.set("auth-token", token);
  return req;
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("non-protected paths", () => {
    it("lets any request through", async () => {
      const req = makeRequest("/");
      const res = await middleware(req as never);
      expect(res.status).toBe(200);
    });

    it("lets through /login without token", async () => {
      const req = makeRequest("/login");
      const res = await middleware(req as never);
      expect(res.status).toBe(200);
    });
  });

  describe("/dashboard without token", () => {
    it("redirects to /login", async () => {
      const req = makeRequest("/dashboard");
      const res = await middleware(req as never);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    });

    it("redirects nested /dashboard/manage to /login", async () => {
      const req = makeRequest("/dashboard/manage");
      const res = await middleware(req as never);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    });
  });

  describe("/admin without token", () => {
    it("redirects to /login", async () => {
      const req = makeRequest("/admin");
      const res = await middleware(req as never);
      expect(res.headers.get("location")).toMatch(/\/login$/);
    });
  });

  describe("/dashboard with valid admin token", () => {
    it("lets the request through when role=admin", async () => {
      const token = await signToken({ email: "a@x.com", role: "admin", isAuthorized: true });
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req as never);
      expect(res.status).toBe(200);
    });

    it("lets through when role=user but isAuthorized=true", async () => {
      const token = await signToken({ email: "u@x.com", role: "user", isAuthorized: true });
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req as never);
      expect(res.status).toBe(200);
    });
  });

  describe("/dashboard with authorized but not-admin user", () => {
    it("redirects to /espera-aprobacion when isAuthorized=false", async () => {
      const token = await signToken({ email: "p@x.com", role: "user", isAuthorized: false });
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req as never);
      expect(res.headers.get("location")).toMatch(/\/espera-aprobacion$/);
    });

    it("redirects when isAuthorized is missing", async () => {
      const token = await signToken({ email: "p@x.com", role: "user" });
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req as never);
      expect(res.headers.get("location")).toMatch(/\/espera-aprobacion$/);
    });

    it("accepts isAuthorized as string 'true'", async () => {
      const token = await signToken({ email: "p@x.com", role: "user", isAuthorized: "true" });
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req as never);
      expect(res.status).toBe(200);
    });
  });

  describe("/dashboard with invalid token", () => {
    it("redirects to /login when JWT signature is wrong", async () => {
      const wrongSecret = new TextEncoder().encode("a-completely-different-secret-32-bytes");
      const token = await signToken({ email: "a@x.com", role: "admin", isAuthorized: true }, wrongSecret);
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const req = makeRequest("/dashboard", token);
      const res = await middleware(req);
      expect(res.headers.get("location")).toMatch(/\/login$/);
      consoleSpy.mockRestore();
    });

    it("redirects to /login when token is malformed", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const req = makeRequest("/dashboard", "not.a.jwt");
      const res = await middleware(req);
      expect(res.headers.get("location")).toMatch(/\/login$/);
      consoleSpy.mockRestore();
    });
  });
});