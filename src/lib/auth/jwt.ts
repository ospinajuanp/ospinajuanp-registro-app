import type { JWTPayload } from "jose";

const PLACEHOLDER = "fallback-secret-for-dev-only";
const SECRET_PATTERN = /^\$2[aby]\$/;

function loadSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error(
      "JWT_SECRET no está definido. Genera uno con `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` y configúralo en tu archivo .env."
    );
  }
  if (raw === PLACEHOLDER || SECRET_PATTERN.test(raw)) {
    throw new Error(
      "JWT_SECRET tiene un valor inseguro (placeholder o hash de bcrypt). Reemplázalo por una clave aleatoria de al menos 32 bytes."
    );
  }
  return new TextEncoder().encode(raw);
}

export const JWT_SECRET = loadSecret();

export const ADMIN_COOKIE_NAME = "auth-token";

export interface SessionJwtPayload extends JWTPayload {
  email?: string;
  role?: "admin" | "user";
  isAuthorized?: boolean | string;
}
