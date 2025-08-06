import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    testTimeout: 60000,
    hookTimeout: 15000,
    slowTestThreshold: 30000,
  },
});
