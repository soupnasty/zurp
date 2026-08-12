import { defineConfig } from "vitest/config";
import path from "path";

// Production (Vercel) runs in UTC, and the engine's date math is sensitive to
// the runtime timezone. Pin tests to UTC so results don't depend on the
// machine they run on.
process.env.TZ = "UTC";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
