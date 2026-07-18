/** Number formatting helpers shared by every measurement and analysis panel. */

export function formatFixed(value: number, digits = 2): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0
  }).format(value);
}

/** Scientific notation such as 2.65e33 rendered as "2.65 × 10^33". */
export function formatScientific(value: number, digits = 3): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  if (value === 0) {
    return "0";
  }
  const [mantissa, exponent] = value.toExponential(digits).split("e");
  const cleanExponent = Number(exponent);
  return `${mantissa} × 10^${cleanExponent}`;
}

/** Uses fixed notation for human-scale magnitudes and scientific notation otherwise. */
export function formatAdaptive(value: number, digits = 3): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const magnitude = Math.abs(value);
  if (magnitude !== 0 && (magnitude >= 1e6 || magnitude < 1e-3)) {
    return formatScientific(value, digits);
  }
  return formatFixed(value, digits);
}

export function formatWithUnit(value: number, unit: string, digits = 3): string {
  return `${formatAdaptive(value, digits)} ${unit}`;
}

export function formatPercent(fraction: number, digits = 2): string {
  if (!Number.isFinite(fraction)) {
    return "—";
  }
  return `${formatFixed(fraction * 100, digits)}%`;
}

/** Formats simulated elapsed days as "Y yr D d" style text. */
export function formatSimulatedTime(elapsedDays: number): string {
  const sign = elapsedDays < 0 ? "-" : "";
  const total = Math.abs(elapsedDays);
  const years = Math.floor(total / 365.25);
  const days = total - years * 365.25;
  if (years === 0) {
    return `${sign}${formatFixed(days, 1)} d`;
  }
  return `${sign}${years} yr ${formatFixed(days, 0)} d`;
}
