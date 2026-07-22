import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import type { StoredUser } from "@/lib/types/user";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-for-dev-only"
);

interface UserShape {
  email: string;
  isAuthorized: boolean | "true";
  role: "admin" | "user";
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const payload = (body ?? {}) as Record<string, unknown>;
    const identifier = typeof payload.identifier === "string" ? payload.identifier : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const rememberMe = payload.rememberMe === true;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    let user: UserShape | null = null;

    if (password === process.env.ADMIN_PASSWORD) {
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
      name: "auth-token",
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
