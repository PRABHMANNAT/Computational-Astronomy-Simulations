export interface ViewportTransform {
  centerX: number;
  centerY: number;
  pixelsPerAu: number;
  rotationRadians: number;
}

export function projectAuToScreen(xAu: number, yAu: number, transform: ViewportTransform) {
  const cos = Math.cos(transform.rotationRadians);
  const sin = Math.sin(transform.rotationRadians);
  const rotatedX = xAu * cos - yAu * sin;
  const rotatedY = xAu * sin + yAu * cos;

  return {
    x: transform.centerX + rotatedX * transform.pixelsPerAu,
    y: transform.centerY + rotatedY * transform.pixelsPerAu
  };
}

export function calculateLogOrbitScale(width: number, height: number, zoom: number) {
  return (Math.min(width, height) / 2.4) * zoom;
}
