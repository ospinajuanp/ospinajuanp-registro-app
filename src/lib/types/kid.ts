export interface Kid {
  "Tipo de documento del niño"?: string;
  "Número de documento del niño": string;
  "Nombre completo del niño": string;
  "Sede"?: string;
  "Tipo de paquete"?: string;
  "Recibe paquete"?: "Si" | "No" | "si" | "no" | string;
  "fecha"?: string;
  "hora"?: string;
}

export type KidUpdate = Partial<Kid>;

export interface ImportModePayload {
  records: ReadonlyArray<Record<string, unknown>>;
  mode: "merge" | "replace";
}

export interface ImportResult {
  success: boolean;
  count: number;
  total: number;
  mode: "merge" | "replace";
  message: string;
}

export const REQUIRED_KID_COLUMNS = [
  "Tipo de documento del niño",
  "Número de documento del niño",
  "Nombre completo del niño",
  "Sede",
  "Tipo de paquete",
  "Recibe paquete",
  "fecha",
  "hora",
] as const;
