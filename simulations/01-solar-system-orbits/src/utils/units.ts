import { ASTRONOMICAL_UNIT_M, DAY_SECONDS, JULIAN_YEAR_DAYS } from "../data/constants";
import type { AngleUnit, DistanceUnit, SpeedUnit, TimeUnit } from "../types/simulation";

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function auToMetres(au: number): number {
  return au * ASTRONOMICAL_UNIT_M;
}

export function metresToAu(metres: number): number {
  return metres / ASTRONOMICAL_UNIT_M;
}

export function daysToSeconds(days: number): number {
  return days * DAY_SECONDS;
}

export function secondsToDays(seconds: number): number {
  return seconds / DAY_SECONDS;
}

export function daysToYears(days: number): number {
  return days / JULIAN_YEAR_DAYS;
}

export function msToKms(metresPerSecond: number): number {
  return metresPerSecond / 1000;
}

export function convertDistance(metres: number, unit: DistanceUnit): number {
  switch (unit) {
    case "m":
      return metres;
    case "km":
      return metres / 1000;
    case "au":
      return metresToAu(metres);
  }
}

export function convertTimeFromDays(days: number, unit: TimeUnit): number {
  switch (unit) {
    case "hours":
      return days * 24;
    case "days":
      return days;
    case "years":
      return daysToYears(days);
  }
}

export function convertSpeed(metresPerSecond: number, unit: SpeedUnit): number {
  return unit === "km/s" ? msToKms(metresPerSecond) : metresPerSecond;
}

export function convertAngle(radians: number, unit: AngleUnit): number {
  return unit === "deg" ? radToDeg(radians) : radians;
}

export const DISTANCE_UNIT_LABEL: Record<DistanceUnit, string> = {
  m: "m",
  km: "km",
  au: "AU"
};

export const TIME_UNIT_LABEL: Record<TimeUnit, string> = {
  hours: "h",
  days: "d",
  years: "yr"
};
