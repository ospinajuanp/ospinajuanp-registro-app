import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import bcrypt from "bcryptjs";

const redis = Redis.fromEnv();

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const userKey = `user:${email}`;

    // 1. Validar si el email ya existe
    const exists = await redis.exists(userKey);
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Guardar en Redis como Hash
    // Guardamos isAuthorized como false por defecto
    await redis.hset(userKey, {
      username,
      email,
      password: hashedPassword,
      isAuthorized: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: "Registro exitoso. Esperando aprobación." 
    }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
