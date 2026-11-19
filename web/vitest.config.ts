import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["test/**/*.test.ts"], testTimeout: 60_000 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Next's server-only guard throws outside the react-server condition; tests run server code directly.
      "server-only": path.resolve(__dirname, "test/server-only-stub.ts"),
    },
  },
});
