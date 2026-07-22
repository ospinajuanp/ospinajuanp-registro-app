import "@testing-library/jest-dom/vitest";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "fallback-secret-for-dev-only") {
  process.env.JWT_SECRET = "test-jwt-secret-for-vitest-only-32bytes-long-pad";
}
