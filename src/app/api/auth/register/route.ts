import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import type { StoredUser } from "@/lib/types/user";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const payload = (body ?? {}) as Record<string, unknown>;
    const username = typeof payload.username === "string" ? payload.username : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const usersData = await redis.get<StoredUser[]>("users") ?? [];

    const exists = usersData.some((u) => u.email === email || u.username === username);
    if (exists) {
      return NextResponse.json(
        { error: "El email o usuario ya está registrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    usersData.push({
      username,
      email,
      password: hashedPassword,
      isAuthorized: false,
      createdAt: new Date().toISOString(),
    });

    await redis.set("users", usersData);

    return NextResponse.json(
      {
        success: true,
        message: "Registro exitoso. Esperando aprobación.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
