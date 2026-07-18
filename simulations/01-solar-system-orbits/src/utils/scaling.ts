export function scaleOrbitRadius(semiMajorAxisAu: number) {
  return Math.log1p(semiMajorAxisAu) / Math.log1p(30.07);
}

export function scaleAuCoordinate(valueAu: number) {
  return scaleOrbitRadius(Math.abs(valueAu)) * Math.sign(valueAu);
}

export function scalePlanetRadius(radiusEarth: number) {
  return Math.max(3, Math.sqrt(radiusEarth) * 4);
}
