import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const redis = Redis.fromEnv();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only");

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    let role = "user";
    let isAuthorized = false;

    // 1. Verificación de la contraseña "maestra" del .env
    if (password === process.env.ADMIN_PASSWORD) {
      role = "admin";
      isAuthorized = true; // Permiso garantizado por la contraseña
    } else {
      // 2. Verificación estándar contra Upstash Redis
      const user = await redis.hgetall(`user:${email}`);

      if (!user || !user.password) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, user.password as string);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      // Validamos cómo Upstash guardó el booleano (puede retornar "true" o true)
      isAuthorized = user.isAuthorized === true || user.isAuthorized === "true";
    }

    // 3. Generar el JWT
    const token = await new SignJWT({ email, role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .setIssuedAt()
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, isAuthorized });

    // 4. Guardar token en las cookies
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error en el login" }, { status: 500 });
  }
}
