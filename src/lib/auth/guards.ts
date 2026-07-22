import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
  JWT_SECRET,
  ADMIN_COOKIE_NAME,
  type SessionJwtPayload,
} from "./jwt";

export type AdminSession = {
  email: string;
  role: "admin";
  isAuthorized: true;
};

export type AuthorizationResult =
  | { ok: true; session: AdminSession }
  | { ok: false; reason: "missing" | "invalid" | "insufficient"; status: 401 | 403 };

export function asAdminSession(payload: SessionJwtPayload): AdminSession | null {
  const isAuthorized = payload.isAuthorized === true || payload.isAuthorized === "true";
  if (!isAuthorized) return null;
  if (typeof payload.email !== "string" || payload.email.length === 0) return null;
  return { email: payload.email, role: "admin", isAuthorized: true };
}

/**
 * Verifica que la petición actual trae un JWT de admin autorizado.
 * Usar DENTRO de un Route Handler o Server Action antes de cualquier
 * mutación o lectura privilegiada.
 */
export async function requireAdmin(): Promise<AuthorizationResult> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return { ok: false, reason: "missing", status: 401 };

  try {
    const { payload } = await jwtVerify<SessionJwtPayload>(token, JWT_SECRET);
    const admin = asAdminSession(payload);
    if (!admin) return { ok: false, reason: "insufficient", status: 403 };
    return { ok: true, session: admin };
  } catch (error) {
    console.error("requireAdmin verification failed:", error);
    return { ok: false, reason: "invalid", status: 401 };
  }
}
