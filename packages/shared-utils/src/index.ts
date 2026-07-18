export type SimulationStatus = "planned" | "in-progress" | "implemented";
export type SimulationDifficulty = "beginner" | "intermediate" | "advanced";
export type SimulationDimension = "2D" | "3D" | "2D/3D";

export interface SimulationMetadata {
  order: number;
  slug: string;
  name: string;
  category: string;
  difficulty: SimulationDifficulty;
  status: SimulationStatus;
  dimension: SimulationDimension;
  description: string;
  plannedTech: string[];
}

export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en", { maximumFractionDigits }).format(value);
}
