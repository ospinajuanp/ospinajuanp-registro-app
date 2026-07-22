import { z } from "zod";

export const buscarSchema = z.object({
  id: z.string().trim().min(1, "ID requerido"),
});

export type BuscarInput = z.infer<typeof buscarSchema>;

export const kidSchema = z.object({
  "Tipo de documento del niño": z.string().optional().default(""),
  "Número de documento del niño": z.string().trim().min(1),
  "Nombre completo del niño": z.string().trim().min(1),
  "Sede": z.string().optional().default(""),
  "Tipo de paquete": z.string().optional().default(""),
  "Recibe paquete": z.string().optional().default(""),
  "fecha": z.string().optional().default(""),
  "hora": z.string().optional().default(""),
});

export type KidInput = z.infer<typeof kidSchema>;

const kidRecord = z.record(z.string(), z.unknown());

export const importSchema = z.object({
  records: z.array(kidRecord).min(1, "No se recibieron registros válidos."),
  mode: z.enum(["merge", "replace"]).default("merge"),
});

export type ImportInput = z.infer<typeof importSchema>;

export const cacheSettingsSchema = z.object({
  forceUpdate: z.boolean(),
});

export type CacheSettingsInput = z.infer<typeof cacheSettingsSchema>;
