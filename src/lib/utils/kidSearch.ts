import type { Kid } from "@/lib/types/kid";

/**
 * Substring search across the two columns the user can see in the UI.
 *
 * Excel imports auto-coerce numeric document IDs to `number`; Redis
 * round-trips them as-is. We must stringify before calling `.includes`
 * or `.toLowerCase` to avoid `TypeError: x.includes is not a function`.
 *
 * Lives outside the page component so it can be unit-tested without
 * pulling in server-action / Redis modules.
 */
export function kidMatchesSearch(kid: Kid, term: string): boolean {
  const trimmed = term.trim();
  if (trimmed === "") return true;
  const lowerTerm = trimmed.toLowerCase();
  const name = String(kid["Nombre completo del niño"] ?? "").toLowerCase();
  const doc = String(kid["Número de documento del niño"] ?? "");
  return name.includes(lowerTerm) || doc.includes(trimmed);
}