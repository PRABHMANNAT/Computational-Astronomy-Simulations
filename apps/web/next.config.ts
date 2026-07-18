import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../..")
  },
  transpilePackages: [
    "@astro-sim/astronomy-data",
    "@astro-sim/orbital-mechanics",
    "@astro-sim/physics-engine",
    "@astro-sim/shared-utils",
    "@astro-sim/solar-system-orbits",
    "@astro-sim/visualization-engine"
  ]
};

export default nextConfig;
