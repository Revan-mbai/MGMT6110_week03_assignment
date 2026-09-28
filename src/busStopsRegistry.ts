/**
 * Centralized Bus Stop Registry & Normalization Helpers
 * Derived directly from authoritative BUS_STOPS_DATA in src/data.ts
 */

import { BUS_STOPS_DATA, BUS_STOPS_MAP } from './data';
import { BusStop } from './types';

export interface RegistryBusStop {
  code: string;
  name: string;
  road: string;
  postalCode?: string;
  busServices: string[];
}

export const KNOWN_SINGAPORE_BUS_STOPS: RegistryBusStop[] = BUS_STOPS_DATA.map((s) => ({
  code: s.code,
  name: s.name,
  road: s.road,
  postalCode: s.postalCode,
  busServices: s.busServices,
}));

export const SINGAPORE_BUS_STOPS_MAP: Record<string, RegistryBusStop> = {};
for (const s of KNOWN_SINGAPORE_BUS_STOPS) {
  SINGAPORE_BUS_STOPS_MAP[s.code] = s;
}

/**
 * Normalizes user input into a Singapore 5-digit bus stop code format:
 * - Trims whitespace
 * - Strips non-digit characters
 * - Pads 4-digit codes with a leading zero (e.g. '4121' -> '04121')
 */
export function normalizeStopCode(input: string): string {
  if (!input) return '';
  const digitsOnly = input.trim().replace(/\D/g, '');
  if (digitsOnly.length === 4) {
    return `0${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Validates whether the input adheres to the strict 5-digit Singapore bus stop code format.
 */
export function isValidStopCodeFormat(code: string): boolean {
  return /^\d{5}$/.test(code);
}

/**
 * Checks whether a bus stop code exists in our authoritative directory.
 */
export function doesStopExistInRegistry(code: string): boolean {
  const norm = normalizeStopCode(code);
  return Boolean(BUS_STOPS_MAP[norm]);
}

/**
 * Retrieves human-readable name, road, and address for any 5-digit bus stop code.
 */
export function lookupBusStopDetails(code: string): { name: string; road: string; address: string } {
  const norm = normalizeStopCode(code);
  const existing = BUS_STOPS_MAP[norm];
  if (existing) {
    return {
      name: existing.name,
      road: existing.road,
      address: `${existing.road}, Singapore ${existing.postalCode || ''}`.trim(),
    };
  }

  return {
    name: `Bus Stop ${norm || code}`,
    road: 'Singapore Public Bus Network',
    address: `Bus Stop Code ${norm || code}, Singapore`,
  };
}

/**
 * Retrieves or constructs a BusStop object from the authoritative registry.
 */
export function buildBusStopObject(code: string): BusStop {
  const norm = normalizeStopCode(code);
  const existing = BUS_STOPS_MAP[norm];
  if (existing) {
    return existing;
  }

  // Graceful fallback for unknown stop code
  return {
    id: `stop-${norm}`,
    code: norm,
    name: `Bus Stop ${norm}`,
    road: 'Singapore Road Network',
    postalCode: '',
    latitude: 1.3025,
    longitude: 103.825,
    distanceMeters: 200,
    walkingTimeMins: 3,
    busServices: ['14', '65', '106'],
    buses: [
      {
        busNumber: '14',
        destination: 'Bedok Int',
        isDelayed: false,
        nextBus: {
          arrivalMinutes: 3,
          load: 'Seats Available',
          type: 'Double Deck',
          wheelchairAccessible: true,
        },
        subsequentBus: {
          arrivalMinutes: 10,
          load: 'Standing Available',
          type: 'Single Deck',
          wheelchairAccessible: true,
        },
        thirdBus: {
          arrivalMinutes: 18,
          load: 'Seats Available',
          type: 'Double Deck',
          wheelchairAccessible: true,
        },
      },
    ],
  };
}
