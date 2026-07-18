import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { SimulationMetadata } from "@astro-sim/shared-utils";

function resolveSimulationsDirectory() {
  const candidates = [
    path.resolve(process.cwd(), "simulations"),
    path.resolve(process.cwd(), "..", "..", "simulations")
  ];

  return candidates.find((candidate) => {
    try {
      readdirSync(candidate);
      return true;
    } catch {
      return false;
    }
  });
}

export function getSimulationMetadata(): SimulationMetadata[] {
  const simulationsDirectory = resolveSimulationsDirectory();

  if (!simulationsDirectory) {
    return [];
  }

  return readdirSync(simulationsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const metadataPath = path.join(simulationsDirectory, entry.name, "metadata.json");
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as SimulationMetadata;
      return metadata;
    })
    .sort((a, b) => a.order - b.order);
}
