import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import bcrypt from "bcryptjs";
import type { StoredUser } from "@/lib/types/user";
import { registerSchema } from "@/lib/schemas/auth";
import { parseBody } from "@/lib/http/parseBody";

export async function POST(req: Request) {
  const parsed = await parseBody(req, registerSchema);
  if (!parsed.ok) return parsed.response;

  const { username, email, password } = parsed.data;

  try {
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
