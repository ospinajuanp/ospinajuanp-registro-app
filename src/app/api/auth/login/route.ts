import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const redis = Redis.fromEnv();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-dev-only");

export async function POST(req: Request) {
  try {
    const { identifier, password, rememberMe } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 });
    }

    let role = "user";
    let isAuthorized = false;
    let emailForToken = identifier;

    // 1. Verificación de la contraseña "maestra" del .env
    if (password === process.env.ADMIN_PASSWORD) {
      role = "admin";
      isAuthorized = true; // Permiso garantizado por la contraseña
    } else {
      // 2. Verificación estándar contra la colección 'users'
      const usersData = await redis.get<any[]>("users") || [];
      const user = usersData.find(u => u.email === identifier || u.username === identifier);

      if (!user || !user.password) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      const isValidPassword = await bcrypt.compare(password, user.password as string);
      if (!isValidPassword) {
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      }

      isAuthorized = user.isAuthorized === true || user.isAuthorized === "true";
      emailForToken = user.email; // Usar siempre el email interno para el JWT
    }

    // 3. Generar el JWT con isAuthorized incluido
    const expiration = rememberMe ? "30d" : "24h";
    const token = await new SignJWT({ 
      email: emailForToken, 
      role,
      isAuthorized 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(expiration)
      .setIssuedAt()
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true, isAuthorized });

    // 4. Guardar token en las cookies
    // MaxAge in seconds: 30 days = 30 * 24 * 60 * 60 = 2592000
    const maxAge = rememberMe ? 2592000 : undefined;
    
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge,
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json({ error: "Error en el login" }, { status: 500 });
  }
}
