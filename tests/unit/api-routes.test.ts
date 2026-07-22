import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/redis", () => {
  const store = {
    get: vi.fn(),
    set: vi.fn(),
    lpush: vi.fn(),
    lrange: vi.fn(),
    del: vi.fn(),
  };
  return { redis: store };
});

vi.mock("@/lib/auth/guards", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

import { redis } from "@/lib/redis";
import { requireAdmin } from "@/lib/auth/guards";
import bcrypt from "bcryptjs";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as buscarPOST } from "@/app/api/buscar/route";
import { GET as cacheGET, POST as cachePOST } from "@/app/api/cache-settings/route";
import { POST as importPOST } from "@/app/api/import/route";

const mockedRedis = redis as unknown as {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
};
const mockedRequireAdmin = requireAdmin as unknown as ReturnType<typeof vi.fn>;
const mockedBcrypt = bcrypt as unknown as {
  hash: ReturnType<typeof vi.fn>;
  compare: ReturnType<typeof vi.fn>;
};

const originalAdminPassword = process.env.ADMIN_PASSWORD;

function jsonRequest(body: unknown): Request {
  return new Request("http://test/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const adminSession = {
  ok: true,
  session: { email: "admin@x.com", role: "admin", isAuthorized: true },
};

describe("API: /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_PASSWORD = "master-pass-123";
  });

  it("rejects invalid payload with 400", async () => {
    const res = await loginPOST(jsonRequest({ password: "" }));
    expect(res.status).toBe(400);
  });

  it("logs in with master password and sets admin cookie", async () => {
    const res = await loginPOST(jsonRequest({ identifier: "admin", password: "master-pass-123", rememberMe: false }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isAuthorized).toBe(true);

    const cookies = res.headers.get("set-cookie");
    expect(cookies).toMatch(/auth-token=/);
    expect(cookies).toMatch(/HttpOnly/);
    expect(cookies).toMatch(/SameSite=lax/i);
    expect(cookies).not.toMatch(/Max-Age=/);
  });

  it("applies 30d maxAge when rememberMe=true", async () => {
    const res = await loginPOST(jsonRequest({ identifier: "x", password: "master-pass-123", rememberMe: true }));
    expect(res.headers.get("set-cookie")).toMatch(/Max-Age=2592000/);
  });

  it("rejects wrong credentials when not master password", async () => {
    mockedRedis.get.mockResolvedValueOnce([]);
    const res = await loginPOST(jsonRequest({ identifier: "juan", password: "wrong", rememberMe: false }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/credenciales/i);
  });

  it("logs in an authorized stored user", async () => {
    mockedRedis.get.mockResolvedValueOnce([
      {
        username: "juan",
        email: "juan@x.com",
        password: "hashed",
        isAuthorized: true,
        createdAt: "2024-01-01",
      },
    ]);
    mockedBcrypt.compare.mockResolvedValueOnce(true);

    const res = await loginPOST(jsonRequest({ identifier: "juan", password: "pwd", rememberMe: false }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isAuthorized).toBe(true);
  });

  it("returns isAuthorized=false for an unauthorized stored user", async () => {
    mockedRedis.get.mockResolvedValueOnce([
      {
        username: "ana",
        email: "ana@x.com",
        password: "hashed",
        isAuthorized: false,
        createdAt: "2024-01-01",
      },
    ]);
    mockedBcrypt.compare.mockResolvedValueOnce(true);

    const res = await loginPOST(jsonRequest({ identifier: "ana", password: "pwd", rememberMe: false }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isAuthorized).toBe(false);
  });

  it("returns 500 on unexpected error", async () => {
    process.env.ADMIN_PASSWORD = originalAdminPassword;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedRedis.get.mockImplementationOnce(() => { throw new Error("boom"); });
    mockedBcrypt.compare.mockResolvedValueOnce(true);

    const res = await loginPOST(jsonRequest({ identifier: "ana", password: "pwd", rememberMe: false }));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe("API: /api/auth/logout", () => {
  it("clears the auth cookie with an expired date", async () => {
    const res = await logoutPOST();
    expect(res.status).toBe(200);
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toMatch(/auth-token=/);
    expect(cookies).toMatch(/Expires=Thu, 01 Jan 1970/i);
  });
});

describe("API: /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid payload with 400", async () => {
    const res = await registerPOST(jsonRequest({ email: "not-email", password: "123", username: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email or username with 409", async () => {
    mockedRedis.get.mockResolvedValueOnce([
      { username: "juan", email: "juan@x.com", password: "h", isAuthorized: false, createdAt: "x" },
    ]);
    const res = await registerPOST(jsonRequest({
      username: "juan",
      email: "new@x.com",
      password: "secret123",
    }));
    expect(res.status).toBe(409);
  });

  it("registers a new user with hashed password and stores isAuthorized=false", async () => {
    mockedRedis.get.mockResolvedValueOnce([]);
    mockedBcrypt.hash.mockResolvedValueOnce("HASHED");
    mockedRedis.set.mockResolvedValueOnce("OK");

    const res = await registerPOST(jsonRequest({
      username: "ana",
      email: "ana@x.com",
      password: "secret123",
    }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith("secret123", 10);
    expect(mockedRedis.set).toHaveBeenCalledTimes(1);
    const [key, payload] = mockedRedis.set.mock.calls[0] as [string, Array<{ username: string; isAuthorized: boolean; password: string }>];
    expect(key).toBe("users");
    expect(payload[0].password).toBe("HASHED");
    expect(payload[0].isAuthorized).toBe(false);
  });

  it("returns 500 on internal error", async () => {
    mockedRedis.get.mockImplementationOnce(() => { throw new Error("boom"); });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await registerPOST(jsonRequest({
      username: "ana",
      email: "ana@x.com",
      password: "secret123",
    }));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe("API: /api/buscar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 on invalid input", async () => {
    const res = await buscarPOST(jsonRequest({}));
    expect(res.status).toBe(400);
  });

  it("finds by document number field", async () => {
    mockedRedis.get.mockResolvedValueOnce([
      { "Número de documento del niño": "123", Nombre: "Ana" },
      { "Número de documento del niño": "456", Nombre: "Juan" },
    ]);

    const res = await buscarPOST(jsonRequest({ id: "456" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.Nombre).toBe("Juan");
  });

  it("finds by generic id field", async () => {
    mockedRedis.get.mockResolvedValueOnce([{ id: "X1", name: "Foo" }]);

    const res = await buscarPOST(jsonRequest({ id: "X1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Foo");
  });

  it("returns 404 when no record matches", async () => {
    mockedRedis.get.mockResolvedValueOnce([{ "Número de documento del niño": "999" }]);
    const res = await buscarPOST(jsonRequest({ id: "nope" }));
    expect(res.status).toBe(404);
  });

  it("returns 500 on internal error", async () => {
    mockedRedis.get.mockImplementationOnce(() => { throw new Error("down"); });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await buscarPOST(jsonRequest({ id: "1" }));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});

describe("API: /api/cache-settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("GET returns 401 when not admin", async () => {
    mockedRequireAdmin.mockResolvedValueOnce({ ok: false, reason: "missing", status: 401 });
    const res = await cacheGET();
    expect(res.status).toBe(401);
  });

  it("GET returns current settings when admin", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    mockedRedis.get.mockResolvedValueOnce({ forceUpdate: true });

    const res = await cacheGET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.forceUpdate).toBe(true);
  });

  it("POST returns 403 when not admin", async () => {
    mockedRequireAdmin.mockResolvedValueOnce({ ok: false, reason: "insufficient", status: 403 });
    const res = await cachePOST(jsonRequest({ forceUpdate: true }));
    expect(res.status).toBe(403);
  });

  it("POST persists new settings when admin", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    mockedRedis.set.mockResolvedValueOnce("OK");

    const res = await cachePOST(jsonRequest({ forceUpdate: true }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockedRedis.set).toHaveBeenCalledWith("settings:cache", { forceUpdate: true });
  });

  it("POST rejects invalid body with 400", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    const res = await cachePOST(jsonRequest({ forceUpdate: "yes" }));
    expect(res.status).toBe(400);
  });
});

describe("API: /api/import", () => {
  beforeEach(() => vi.clearAllMocks());

  const validRecord = { "Número de documento del niño": "111", Nombre: "A" };

  it("returns 401 when not admin", async () => {
    mockedRequireAdmin.mockResolvedValueOnce({ ok: false, reason: "missing", status: 401 });
    const res = await importPOST(jsonRequest({ records: [validRecord], mode: "merge" }));
    expect(res.status).toBe(401);
  });

  it("rejects records without document number with 400", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    const res = await importPOST(jsonRequest({
      records: [validRecord, { Nombre: "no-id" }],
      mode: "merge",
    }));
    expect(res.status).toBe(400);
  });

  it("replace mode overwrites the dataset", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    mockedRedis.set.mockResolvedValueOnce("OK");

    const res = await importPOST(jsonRequest({
      records: [validRecord],
      mode: "replace",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
    expect(body.mode).toBe("replace");
    expect(mockedRedis.set).toHaveBeenCalledWith("dataKids", [validRecord]);
  });

  it("merge mode dedupes by document number", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    mockedRedis.get.mockResolvedValueOnce([
      { "Número de documento del niño": "111", Nombre: "OLD" },
      { "Número de documento del niño": "222", Nombre: "OTHER" },
    ]);
    mockedRedis.set.mockResolvedValueOnce("OK");

    const res = await importPOST(jsonRequest({
      records: [
        { "Número de documento del niño": "111", Nombre: "NEW" },
        { "Número de documento del niño": "333", Nombre: "FRESH" },
      ],
      mode: "merge",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(3);

    const [, stored] = mockedRedis.set.mock.calls[0] as [string, Array<{ Nombre: string; "Número de documento del niño": string }>];
    const found = stored.find((r) => r["Número de documento del niño"] === "111");
    expect(found?.Nombre).toBe("NEW");
  });

  it("rejects invalid body with 400", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    const res = await importPOST(jsonRequest({ records: "not-array", mode: "merge" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 on redis error", async () => {
    mockedRequireAdmin.mockResolvedValueOnce(adminSession);
    mockedRedis.set.mockImplementationOnce(() => { throw new Error("fail"); });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await importPOST(jsonRequest({ records: [validRecord], mode: "replace" }));
    expect(res.status).toBe(500);
    consoleSpy.mockRestore();
  });
});