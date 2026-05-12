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

    // 1. Obtener la colección de usuarios actual
    const usersData = await redis.get<any[]>("users") || [];

    // 2. Validar si el email o usuario ya existe
    const exists = usersData.some(u => u.email === email || u.username === username);
    if (exists) {
      return NextResponse.json({ error: "El email o usuario ya está registrado" }, { status: 409 });
    }

    // 3. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Agregar a la colección y guardar
    // Guardamos isAuthorized como false por defecto
    usersData.push({
      username,
      email,
      password: hashedPassword,
      isAuthorized: false,
      createdAt: new Date().toISOString()
    });

    await redis.set("users", usersData);

    return NextResponse.json({ 
      success: true, 
      message: "Registro exitoso. Esperando aprobación." 
    }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
