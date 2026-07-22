import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/fixtures/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/lib/**", "src/app/api/**", "src/app/actions.ts", "src/middleware.ts"],
      exclude: ["**/*.d.ts", "**/types/**", "src/lib/redis.ts"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
