import { describe, it, expect } from "vitest";
import { kidMatchesSearch } from "@/lib/utils/kidSearch";
import type { Kid } from "@/lib/types/kid";

function makeKid(overrides: Partial<Kid> = {}): Kid {
  return {
    "Tipo de documento del niño": "RC",
    "Número de documento del niño": "",
    "Nombre completo del niño": "",
    ...overrides,
  };
}

describe("kidMatchesSearch", () => {
  it("matches every record when search term is empty or whitespace", () => {
    expect(kidMatchesSearch(makeKid({ "Nombre completo del niño": "Ana" }), "")).toBe(true);
    expect(kidMatchesSearch(makeKid(), "   ")).toBe(true);
  });

  it("matches a substring of the full name (case-insensitive)", () => {
    const kid = makeKid({ "Nombre completo del niño": "Juan Pérez García" });
    expect(kidMatchesSearch(kid, "pérez")).toBe(true);
    expect(kidMatchesSearch(kid, "PÉREZ")).toBe(true);
    expect(kidMatchesSearch(kid, "garc")).toBe(true);
  });

  it("matches a substring of the document number when it is a string", () => {
    const kid = makeKid({ "Número de documento del niño": "1234567890" });
    expect(kidMatchesSearch(kid, "456")).toBe(true);
    expect(kidMatchesSearch(kid, "1234567890")).toBe(true);
    expect(kidMatchesSearch(kid, "999")).toBe(false);
  });

  it("does NOT crash when the document number is a number (Excel-imported)", () => {
    // Reproduces the reported runtime TypeError.
    const kid = {
      ...makeKid(),
      "Número de documento del niño": 1234567890 as unknown as string,
    };
    expect(() => kidMatchesSearch(kid, "1")).not.toThrow();
    expect(kidMatchesSearch(kid, "1")).toBe(true);
    expect(kidMatchesSearch(kid, "456")).toBe(true);
    expect(kidMatchesSearch(kid, "999")).toBe(false);
  });

  it("does NOT crash when the name is a number", () => {
    const kid = {
      ...makeKid(),
      "Nombre completo del niño": 12345 as unknown as string,
    };
    expect(() => kidMatchesSearch(kid, "123")).not.toThrow();
    expect(kidMatchesSearch(kid, "123")).toBe(true);
  });

  it("returns false when neither name nor document matches", () => {
    const kid = makeKid({
      "Nombre completo del niño": "Ana",
      "Número de documento del niño": "111",
    });
    expect(kidMatchesSearch(kid, "zzz")).toBe(false);
  });

  it("handles undefined name and document gracefully", () => {
    const kid = makeKid();
    delete (kid as Partial<Kid>)["Nombre completo del niño"];
    delete (kid as Partial<Kid>)["Número de documento del niño"];
    expect(() => kidMatchesSearch(kid as Kid, "x")).not.toThrow();
    expect(kidMatchesSearch(kid as Kid, "x")).toBe(false);
  });

  it("trims surrounding whitespace from the search term", () => {
    const kid = makeKid({ "Nombre completo del niño": "Ana López" });
    expect(kidMatchesSearch(kid, "  López  ")).toBe(true);
  });

  it("matches when searching by document even with leading zeros", () => {
    const kid = makeKid({ "Número de documento del niño": "00123456" });
    expect(kidMatchesSearch(kid, "0012")).toBe(true);
    expect(kidMatchesSearch(kid, "1234")).toBe(true);
  });

  it("searches the document number case-sensitively (digits)", () => {
    const kid = makeKid({ "Número de documento del niño": "ABC123" });
    expect(kidMatchesSearch(kid, "abc")).toBe(false);
    expect(kidMatchesSearch(kid, "ABC")).toBe(true);
  });
});