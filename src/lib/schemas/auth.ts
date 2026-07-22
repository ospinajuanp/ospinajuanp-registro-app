import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Identificador requerido"),
  password: z.string().min(1, "Contraseña requerida"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().trim().min(2).max(64),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
