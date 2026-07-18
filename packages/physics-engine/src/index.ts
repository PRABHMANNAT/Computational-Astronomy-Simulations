export const ASTRONOMICAL_UNIT_KM = 149_597_870.7;
export const EARTH_YEAR_DAYS = 365.256;
export const TWO_PI = Math.PI * 2;

export function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
