import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts", "simulations/**/*.test.{ts,tsx}"]
  },
  resolve: {
    alias: {
      "@astro-sim/astronomy-data": path.resolve(rootDirectory, "packages/astronomy-data/src"),
      "@astro-sim/orbital-mechanics": path.resolve(rootDirectory, "packages/orbital-mechanics/src"),
      "@astro-sim/physics-engine": path.resolve(rootDirectory, "packages/physics-engine/src"),
      "@astro-sim/shared-utils": path.resolve(rootDirectory, "packages/shared-utils/src"),
      "@astro-sim/visualization-engine": path.resolve(rootDirectory, "packages/visualization-engine/src"),
      "@astro-sim/solar-system-orbits": path.resolve(
        rootDirectory,
        "simulations/01-solar-system-orbits/src"
      )
    }
  }
});
