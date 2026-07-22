import { describe, it, expect } from "vitest";
import {
  buscarSchema,
  kidSchema,
  importSchema,
  cacheSettingsSchema,
} from "@/lib/schemas/kids";

describe("buscarSchema", () => {
  it("requires non-empty id", () => {
    expect(buscarSchema.parse({ id: "1001" })).toEqual({ id: "1001" });
    expect(() => buscarSchema.parse({ id: "" })).toThrow();
    expect(() => buscarSchema.parse({ id: "   " })).toThrow();
  });

  it("trims whitespace", () => {
    expect(buscarSchema.parse({ id: "  42  " }).id).toBe("42");
  });
});

describe("kidSchema", () => {
  it("accepts minimal payload and fills defaults", () => {
    const result = kidSchema.parse({
      "Número de documento del niño": "1001",
      "Nombre completo del niño": "Ana",
    });
    expect(result["Número de documento del niño"]).toBe("1001");
    expect(result["Nombre completo del niño"]).toBe("Ana");
    expect(result["Sede"]).toBe("");
    expect(result["Recibe paquete"]).toBe("");
  });

  it("rejects when document or name is missing", () => {
    expect(() => kidSchema.parse({ "Número de documento del niño": "1" })).toThrow();
    expect(() => kidSchema.parse({ "Nombre completo del niño": "x" })).toThrow();
  });
});

describe("importSchema", () => {
  it("accepts records with merge mode default", () => {
    const result = importSchema.parse({
      records: [{ "Número de documento del niño": "1", "Nombre completo del niño": "x" }],
    });
    expect(result.mode).toBe("merge");
  });

  it("accepts replace mode", () => {
    const result = importSchema.parse({
      records: [{ a: 1 }],
      mode: "replace",
    });
    expect(result.mode).toBe("replace");
  });

  it("rejects empty records", () => {
    expect(() => importSchema.parse({ records: [] })).toThrow();
  });

  it("rejects unknown mode", () => {
    expect(() =>
      importSchema.parse({ records: [{ a: 1 }], mode: "drop" })
    ).toThrow();
  });
});

describe("cacheSettingsSchema", () => {
  it("requires a boolean", () => {
    expect(cacheSettingsSchema.parse({ forceUpdate: true })).toEqual({ forceUpdate: true });
    expect(cacheSettingsSchema.parse({ forceUpdate: false })).toEqual({ forceUpdate: false });
    expect(() => cacheSettingsSchema.parse({ forceUpdate: "yes" })).toThrow();
  });
});
