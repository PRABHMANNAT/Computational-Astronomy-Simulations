/**
 * Centralized physical constants for the Solar System Orbit Simulator.
 * All values are SI unless the name states otherwise.
 * Do not redefine these constants elsewhere in the codebase.
 */

/** Newtonian constant of gravitation, m^3 kg^-1 s^-2 (CODATA 2018). */
export const GRAVITATIONAL_CONSTANT = 6.6743e-11;

/** Mass of the Sun, kg. */
export const SOLAR_MASS_KG = 1.98847e30;

/** Astronomical unit, metres (IAU 2012 definition). */
export const ASTRONOMICAL_UNIT_M = 1.495978707e11;

/** Seconds in one day. */
export const DAY_SECONDS = 86400;

/** Standard gravitational parameter of the Sun, mu = G * M_sun, m^3 s^-2. */
export const SOLAR_MU = GRAVITATIONAL_CONSTANT * SOLAR_MASS_KG;

/** Radius of the Sun, km (for visualization scaling only). */
export const SOLAR_RADIUS_KM = 695700;

/** Days in one Julian year. */
export const JULIAN_YEAR_DAYS = 365.25;

/** Full turn in radians. */
export const TWO_PI = 2 * Math.PI;

/** Safe epsilon used as a denominator floor in relative-error calculations. */
export const RELATIVE_ERROR_EPSILON = 1e-30;

/** Default Newton-Raphson tolerance for the Kepler solver. */
export const KEPLER_TOLERANCE = 1e-12;

/** Maximum Newton-Raphson iterations for the Kepler solver. */
export const KEPLER_MAX_ITERATIONS = 30;

/** Conservative inner/outer edges of the optimistic habitable zone, AU (visual overlay only). */
export const HABITABLE_ZONE_INNER_AU = 0.95;
export const HABITABLE_ZONE_OUTER_AU = 1.67;
