import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { timingSafeEqual } from "node:crypto";
import type { StoredUser } from "@/lib/types/user";
import { loginSchema } from "@/lib/schemas/auth";
import { parseBody } from "@/lib/http/parseBody";
import { JWT_SECRET, ADMIN_COOKIE_NAME } from "@/lib/auth/jwt";

function isAdminPassword(password: string): boolean {
  const admin = process.env.ADMIN_PASSWORD ?? "";
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

interface UserShape {
  email: string;
  isAuthorized: boolean;
  role: "admin" | "user";
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, loginSchema);
  if (!parsed.ok) return parsed.response;

  const { identifier, password, rememberMe } = parsed.data;

  try {
    let user: UserShape;

    if (isAdminPassword(password)) {
      user = {
        email: identifier || "admin",
        isAuthorized: true,
        role: "admin",
      };
    } else {
      const usersData = await redis.get<StoredUser[]>("users") ?? [];
      const found = usersData.find(
        (u) => u.email === identifier || u.username === identifier
      );

      if (!found || !found.password) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, found.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      user = {
        email: found.email,
        isAuthorized: found.isAuthorized === true || found.isAuthorized === "true",
        role: "user",
      };
    }

    const expiration = rememberMe ? "30d" : "24h";
    const token = await new SignJWT({
      email: user.email,
      role: user.role,
      isAuthorized: user.isAuthorized,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiration)
      .setIssuedAt()
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, isAuthorized: user.isAuthorized });

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined;

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(maxAge !== undefined ? { maxAge } : {}),
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error en el login" }, { status: 500 });
  }
}
