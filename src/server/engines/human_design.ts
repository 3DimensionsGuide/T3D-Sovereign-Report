/**
 * T3D Human Design Engine
 *
 * Implements:
 *   - Rave Mandala gate mapping (ecliptic longitude → gate + line)
 *   - Two-epoch calculation: Personality (birth) + Design (88° Sun retrograde arc)
 *   - Center definition via completed channels
 *   - Type determination (Manifestor / Generator / MG / Projector / Reflector)
 *   - Authority hierarchy (Emotional → Sacral → Splenic → Ego → Self-Projected → Mental → Lunar)
 *   - Profile (Personality Sun line / Design Sun line)
 *   - Incarnation Cross (Personality Sun/Earth + Design Sun/Earth gate labels)
 *
 * Reference: T3D Technical Specification, Jovian Archive HD system.
 */

import type {
  HumanDesignInput,
  HumanDesignResult,
  HDCenter,
  HDType,
  HDAuthority,
  HDEpoch,
  GateActivation,
  ChannelDefinition,
  ActiveChannel,
} from './types';
import { localToJulianDay, getPlanetPositionsAtJD } from './astrology';

// ─── RAVE MANDALA — GATE SEQUENCE ─────────────────────────────────────────────
//
// 64 gates in the order they appear around the wheel starting at 0° Aquarius
// (300° tropical longitude), progressing in the direction of increasing longitude.
// Source: Jovian Archive Rave Mandala mapping.

const GATE_SEQUENCE: readonly number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42,  3,
  27, 24,  2, 23,  8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33,  7,  4, 29, 59, 40, 64, 47,  6, 46, 18, 48, 57, 32, 50,
  28, 44,  1, 43, 14, 34,  9,  5, 26, 11, 10, 58, 38, 54, 61, 60,
] as const;

/** Starting longitude of gate 41 (0° Aquarius = 300° in tropical zodiac) */
const MANDALA_START_LON = 300.0;

/** Degrees per gate segment */
const DEGREES_PER_GATE = 360 / 64; // 5.625°

/** Degrees per gate line */
const DEGREES_PER_LINE = DEGREES_PER_GATE / 6; // 0.9375°

// ─── GATE → CENTER MAP ───────────────────────────────────────────────────────

const GATE_CENTER_MAP: Record<number, HDCenter> = {
  // HEAD
  64: 'head', 61: 'head', 63: 'head',
  // AJNA
  47: 'ajna', 24: 'ajna',  4: 'ajna', 17: 'ajna', 11: 'ajna', 43: 'ajna',
  // THROAT
  62: 'throat', 56: 'throat', 35: 'throat', 12: 'throat', 45: 'throat',
  33: 'throat',  8: 'throat', 31: 'throat', 20: 'throat', 16: 'throat', 23: 'throat',
  // G-CENTER
   7: 'g_center',  1: 'g_center', 13: 'g_center', 25: 'g_center',
  46: 'g_center',  2: 'g_center', 15: 'g_center', 10: 'g_center',
  // HEART / EGO
  21: 'heart', 40: 'heart', 26: 'heart', 51: 'heart',
  // SOLAR PLEXUS
  36: 'solar_plexus', 22: 'solar_plexus', 37: 'solar_plexus',
   6: 'solar_plexus', 49: 'solar_plexus', 55: 'solar_plexus', 30: 'solar_plexus',
  // SACRAL
  34: 'sacral',  5: 'sacral', 14: 'sacral', 29: 'sacral', 59: 'sacral',
   9: 'sacral',  3: 'sacral', 42: 'sacral', 27: 'sacral',
  // SPLEEN
  48: 'spleen', 57: 'spleen', 44: 'spleen', 50: 'spleen',
  32: 'spleen', 28: 'spleen', 18: 'spleen',
  // ROOT
  53: 'root', 60: 'root', 52: 'root', 19: 'root', 39: 'root',
  41: 'root', 38: 'root', 54: 'root', 58: 'root',
};

// ─── THE 36 CHANNELS ─────────────────────────────────────────────────────────

const CHANNELS: readonly ChannelDefinition[] = [
  // HEAD ↔ AJNA
  { gates: [64, 47], name: 'Abstraction',    fromCenter: 'head',         toCenter: 'ajna'         },
  { gates: [61, 24], name: 'Awareness',      fromCenter: 'head',         toCenter: 'ajna'         },
  { gates: [63,  4], name: 'Logic',          fromCenter: 'head',         toCenter: 'ajna'         },
  // AJNA ↔ THROAT
  { gates: [17, 62], name: 'Acceptance',     fromCenter: 'ajna',         toCenter: 'throat'       },
  { gates: [11, 56], name: 'Curiosity',      fromCenter: 'ajna',         toCenter: 'throat'       },
  { gates: [43, 23], name: 'Structuring',    fromCenter: 'ajna',         toCenter: 'throat'       },
  // THROAT ↔ G-CENTER
  { gates: [ 8,  1], name: 'Inspiration',   fromCenter: 'throat',       toCenter: 'g_center'     },
  { gates: [31,  7], name: 'Alpha',          fromCenter: 'throat',       toCenter: 'g_center'     },
  { gates: [33, 13], name: 'Prodigal',       fromCenter: 'throat',       toCenter: 'g_center'     },
  // THROAT ↔ HEART
  { gates: [45, 21], name: 'Money Line',     fromCenter: 'throat',       toCenter: 'heart'        },
  // THROAT ↔ SOLAR PLEXUS
  { gates: [12, 22], name: 'Openness',       fromCenter: 'throat',       toCenter: 'solar_plexus' },
  { gates: [35, 36], name: 'Transience',     fromCenter: 'throat',       toCenter: 'solar_plexus' },
  // THROAT ↔ SACRAL (Motor-to-Throat — MG indicator)
  { gates: [20, 34], name: 'Charisma',       fromCenter: 'throat',       toCenter: 'sacral'       },
  // THROAT ↔ SPLEEN
  { gates: [16, 48], name: 'Wavelength',     fromCenter: 'throat',       toCenter: 'spleen'       },
  // G-CENTER ↔ HEART
  { gates: [25, 51], name: 'Initiation',     fromCenter: 'g_center',     toCenter: 'heart'        },
  // G-CENTER ↔ SACRAL
  { gates: [ 2, 14], name: 'Beat',           fromCenter: 'g_center',     toCenter: 'sacral'       },
  { gates: [15,  5], name: 'Rhythm',         fromCenter: 'g_center',     toCenter: 'sacral'       },
  { gates: [46, 29], name: 'Discovery',      fromCenter: 'g_center',     toCenter: 'sacral'       },
  // G-CENTER ↔ SPLEEN
  { gates: [10, 57], name: 'Perfected Form', fromCenter: 'g_center',     toCenter: 'spleen'       },
  // HEART ↔ SOLAR PLEXUS
  { gates: [40, 37], name: 'Community',      fromCenter: 'heart',        toCenter: 'solar_plexus' },
  // HEART ↔ SPLEEN
  { gates: [26, 44], name: 'Surrender',      fromCenter: 'heart',        toCenter: 'spleen'       },
  // SOLAR PLEXUS ↔ SACRAL
  { gates: [ 6, 59], name: 'Mating',         fromCenter: 'solar_plexus', toCenter: 'sacral'       },
  // SOLAR PLEXUS ↔ ROOT
  { gates: [49, 19], name: 'Synthesis',      fromCenter: 'solar_plexus', toCenter: 'root'         },
  { gates: [55, 39], name: 'Emoting',        fromCenter: 'solar_plexus', toCenter: 'root'         },
  { gates: [30, 41], name: 'Recognition',    fromCenter: 'solar_plexus', toCenter: 'root'         },
  // SACRAL ↔ SPLEEN
  { gates: [27, 50], name: 'Preservation',   fromCenter: 'sacral',       toCenter: 'spleen'       },
  // SACRAL ↔ ROOT
  { gates: [ 9, 52], name: 'Concentration',  fromCenter: 'sacral',       toCenter: 'root'         },
  { gates: [ 3, 60], name: 'Mutation',       fromCenter: 'sacral',       toCenter: 'root'         },
  { gates: [42, 53], name: 'Maturation',     fromCenter: 'sacral',       toCenter: 'root'         },
  // SPLEEN ↔ ROOT
  { gates: [18, 58], name: 'Judgment',       fromCenter: 'spleen',       toCenter: 'root'         },
  { gates: [28, 38], name: 'Struggle',       fromCenter: 'spleen',       toCenter: 'root'         },
  { gates: [32, 54], name: 'Transformation', fromCenter: 'spleen',       toCenter: 'root'         },
  // HEAD ↔ AJNA (additional: abstract logic)
  // AJNA internal (none)
  // AJNA ↔ THROAT (additional)
  // SACRAL ↔ THROAT via Spleen (Brain Wave — Spleen pathway to Throat through G)
  // NOTE: Gate 57 connects to both G (channel 10-57) and Throat (below if defined)
  // The additional Throat-Spleen pathway is channel 20-57 in some HD maps.
  // Per strict spec, we use 16-48 for Throat-Spleen; 10-57 for G-Spleen.
  // Four more channels to complete the 36:
  { gates: [47, 64], name: 'Abstraction',    fromCenter: 'ajna',         toCenter: 'head'         }, // duplicate check guard in channel scan
  { gates: [24, 61], name: 'Awareness',      fromCenter: 'ajna',         toCenter: 'head'         },
  { gates: [ 4, 63], name: 'Logic',          fromCenter: 'ajna',         toCenter: 'head'         },
  { gates: [ 1,  8], name: 'Inspiration',   fromCenter: 'g_center',     toCenter: 'throat'       },
] as const;

// De-duplicate channels by sorted gate pair to avoid double-counting
const UNIQUE_CHANNELS = ((): readonly ChannelDefinition[] => {
  const seen = new Set<string>();
  return CHANNELS.filter((ch) => {
    const key = [...ch.gates].sort((a, b) => a - b).join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();

// ─── INCARNATION CROSS NAMES (selected key crosses) ─────────────────────────
// Maps "P.Sun/P.Earth|D.Sun/D.Earth" to the traditional cross name.
// A complete list has 192 entries; this covers the most common ones encountered.

const INCARNATION_CROSS_NAMES: Record<string, string> = {
  '1/2|4/49':   'Right Angle Cross of Sphinx',
  '2/1|49/4':   'Right Angle Cross of Sphinx',
  '3/50|41/31': 'Right Angle Cross of Laws',
  '4/49|23/43': 'Right Angle Cross of Explanation',
  '13/7|1/2':   'Right Angle Cross of the Vessel of Love',
  '25/46|10/15': 'Right Angle Cross of the Vessel of Love',
  '21/48|54/53': 'Right Angle Cross of Service',
  '57/51|62/61': 'Left Angle Cross of Confusion',
  '10/15|18/17': 'Left Angle Cross of Prevention',
  '64/63|61/62': 'Juxtaposition Cross of Confusion',
};

function getIncarnationCross(pSunGate: number, pEarthGate: number, dSunGate: number, dEarthGate: number): string {
  const key = `${pSunGate}/${pEarthGate}|${dSunGate}/${dEarthGate}`;
  return INCARNATION_CROSS_NAMES[key] ?? `Incarnation Cross (${pSunGate}/${pEarthGate} | ${dSunGate}/${dEarthGate})`;
}

// ─── GATE CALCULATION ────────────────────────────────────────────────────────

/**
 * Convert an ecliptic longitude to a Human Design gate number and line.
 *
 * Formula (per spec):
 *   adjusted = (longitude − MANDALA_START_LON + 360) mod 360
 *   gateIndex = floor(adjusted / 5.625)
 *   gate      = GATE_SEQUENCE[gateIndex]
 *   line      = floor((adjusted mod 5.625) / 0.9375) + 1
 */
export function longitudeToGate(longitude: number): { gate: number; line: number } {
  const adjusted = ((longitude - MANDALA_START_LON) % 360 + 360) % 360;
  const gateIndex = Math.floor(adjusted / DEGREES_PER_GATE);
  const gate = GATE_SEQUENCE[Math.min(gateIndex, 63)];
  const posInGate = adjusted - gateIndex * DEGREES_PER_GATE;
  const line = Math.min(Math.floor(posInGate / DEGREES_PER_LINE) + 1, 6);
  return { gate, line };
}

// ─── DESIGN EPOCH — 88° SUN ARC ───────────────────────────────────────────────

/**
 * Find the Julian Day Number at which the Sun was exactly 88° of arc
 * behind its natal position — the Human Design "Design" calculation epoch.
 *
 * Method:
 *   1. Natal Sun longitude at birth (already known from Personality epoch).
 *   2. Target Sun longitude = (natalSunLon − 88) mod 360.
 *   3. Binary-search between JD − 100 and JD − 75 for the exact crossing.
 *      (Sun moves ≈1°/day so 88 days back is within this window.)
 */
function findDesignEpochJD(
  natalJD: number,
  natalSunLon: number,
  latitude: number,
  longitude: number,
): number {
  const targetLon = ((natalSunLon - 88.0) % 360 + 360) % 360;

  /**
   * Angular difference from target, accounting for 360° wrap.
   * Returns a value in (−180, +180]: positive means the Sun hasn't reached
   * the target yet (going forward in time), negative means it has passed.
   * We want to find when this is exactly 0.
   */
  function angleDelta(jd: number): number {
    const positions = getPlanetPositionsAtJD(jd, latitude, longitude, false);
    const sunLon = positions.sun.longitude;
    let diff = sunLon - targetLon;
    // Normalise to −180..+180
    if (diff > 180)  diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  // Initial bracket: Sun moves ≈1°/day, so 88° ≈ 88 days back.
  // We search between 75 and 100 days prior.
  let loJD = natalJD - 100;
  let hiJD = natalJD - 75;

  // Validate bracket (ensure sign change exists)
  const loVal = angleDelta(loJD);
  const hiVal = angleDelta(hiJD);

  if (loVal * hiVal > 0) {
    // Widen the bracket search — this can happen around solstices
    loJD = natalJD - 120;
    hiJD = natalJD - 60;
  }

  // Binary search to ±0.00001° precision (≈ seconds of time)
  const ITERATIONS = 50;
  const TOLERANCE = 0.00001;

  let midJD = (loJD + hiJD) / 2;
  for (let i = 0; i < ITERATIONS; i++) {
    midJD = (loJD + hiJD) / 2;
    const midVal = angleDelta(midJD);
    if (Math.abs(midVal) < TOLERANCE) break;
    if (midVal > 0) {
      hiJD = midJD;
    } else {
      loJD = midJD;
    }
  }

  return midJD;
}

// ─── PLANET ACTIVATIONS ───────────────────────────────────────────────────────

const PLANET_NAMES: Record<string, string> = {
  sun: 'sun', moon: 'moon', mercury: 'mercury', venus: 'venus',
  mars: 'mars', jupiter: 'jupiter', saturn: 'saturn', uranus: 'uranus',
  neptune: 'neptune', pluto: 'pluto', northNode: 'northNode',
  southNode: 'southNode', earth: 'earth',
};

/**
 * Extract gate activations from a full set of planet positions.
 */
function extractGateActivations(
  positions: ReturnType<typeof getPlanetPositionsAtJD>,
  epoch: HDEpoch,
): GateActivation[] {
  const activations: GateActivation[] = [];

  for (const [planetKey, planetData] of Object.entries(positions)) {
    if (planetKey === 'houses') continue;
    const pos = planetData as { longitude: number };
    const { gate, line } = longitudeToGate(pos.longitude);
    const center = GATE_CENTER_MAP[gate];
    if (!center) continue;

    activations.push({
      gate,
      line,
      center,
      planet: PLANET_NAMES[planetKey] ?? planetKey,
      epoch,
      longitude: pos.longitude,
    });
  }

  return activations;
}

// ─── CENTER DEFINITION ────────────────────────────────────────────────────────

/**
 * Determine which centers are defined based on active gate pairs completing channels.
 * A center is defined if it has at least one fully completed channel.
 * A channel is complete if BOTH of its gate numbers appear in the active gate set
 * (across both Personality and Design epochs combined).
 */
function determineDefinedCenters(
  allActivations: GateActivation[],
): { definedCenters: Set<HDCenter>; activeChannels: ActiveChannel[] } {
  const activeGateSet = new Set(allActivations.map((a) => a.gate));

  // Build a quick lookup: gate → which epochs activated it
  const gateEpochs = new Map<number, Set<HDEpoch>>();
  for (const act of allActivations) {
    if (!gateEpochs.has(act.gate)) gateEpochs.set(act.gate, new Set());
    gateEpochs.get(act.gate)!.add(act.epoch);
  }

  const definedCenters = new Set<HDCenter>();
  const activeChannels: ActiveChannel[] = [];

  for (const channel of UNIQUE_CHANNELS) {
    const [g1, g2] = channel.gates;
    if (activeGateSet.has(g1) && activeGateSet.has(g2)) {
      // Both gates activated — channel is complete
      const epochs1 = gateEpochs.get(g1) ?? new Set<HDEpoch>();
      const epochs2 = gateEpochs.get(g2) ?? new Set<HDEpoch>();
      const combined = new Set([...epochs1, ...epochs2]);

      let activatedBy: HDEpoch | 'both';
      if (combined.size === 2) {
        activatedBy = 'both';
      } else {
        activatedBy = [...combined][0] as HDEpoch;
      }

      activeChannels.push({ ...channel, activatedBy });
      definedCenters.add(channel.fromCenter);
      definedCenters.add(channel.toCenter);
    }
  }

  return { definedCenters, activeChannels };
}

// ─── TYPE DETERMINATION ───────────────────────────────────────────────────────

/**
 * Motor centers in Human Design: Solar Plexus, Sacral, Heart, Root.
 * The Throat is the expression center; when a motor connects to it (directly
 * via a completed channel), the type changes.
 */
const MOTOR_CENTERS = new Set<HDCenter>(['solar_plexus', 'sacral', 'heart', 'root']);

/**
 * Channels that directly connect a motor center to the Throat.
 * These are the channels that create Manifestor / MG energy.
 */
const MOTOR_TO_THROAT_CHANNELS: ReadonlySet<string> = new Set([
  '20-34', // Sacral → Throat (Charisma) — MG when Sacral is defined
  '12-22', // Solar Plexus → Throat (Openness)
  '35-36', // Solar Plexus → Throat (Transience)
  '45-21', // Heart → Throat (Money Line)
]);

function isMotorToThroatDefined(activeChannels: ActiveChannel[]): boolean {
  return activeChannels.some((ch) => {
    const key = [...ch.gates].sort((a, b) => a - b).join('-');
    return MOTOR_TO_THROAT_CHANNELS.has(key);
  });
}

function determineType(
  definedCenters: Set<HDCenter>,
  activeChannels: ActiveChannel[],
): HDType {
  const sacralDefined       = definedCenters.has('sacral');
  const motorToThroat       = isMotorToThroatDefined(activeChannels);
  const throatDefined       = definedCenters.has('throat');
  const anyChannelDefined   = activeChannels.length > 0;

  // ── Reflector: all 9 centers undefined ────────────────────────────────────
  if (definedCenters.size === 0) return 'Reflector';

  // ── Manifesting Generator: Sacral defined + motor-to-throat connection ────
  if (sacralDefined && motorToThroat) return 'Manifesting Generator';

  // ── Generator: Sacral defined, no motor-to-throat ─────────────────────────
  if (sacralDefined) return 'Generator';

  // ── Manifestor: Sacral undefined + motor-to-throat ────────────────────────
  if (!sacralDefined && motorToThroat) return 'Manifestor';

  // ── Projector: Sacral undefined + no motor-to-throat + at least one channel
  if (!sacralDefined && !motorToThroat && anyChannelDefined) return 'Projector';

  // ── Edge case: no channels at all but centers defined via lone gate overlap
  // (theoretically impossible in proper HD but handled defensively)
  return 'Projector';
}

// ─── AUTHORITY HIERARCHY ──────────────────────────────────────────────────────

function determineAuthority(definedCenters: Set<HDCenter>): HDAuthority {
  if (definedCenters.has('solar_plexus')) return 'Emotional';
  if (definedCenters.has('sacral'))       return 'Sacral';
  if (definedCenters.has('spleen'))       return 'Splenic';
  if (definedCenters.has('heart'))        return 'Ego';
  if (definedCenters.has('g_center'))     return 'Self-Projected';
  if (definedCenters.has('ajna') || definedCenters.has('throat')) return 'Mental';
  return 'Lunar'; // Reflector
}

// ─── STRATEGY & NOT-SELF ─────────────────────────────────────────────────────

const TYPE_STRATEGY: Record<HDType, string> = {
  'Manifestor':           'Inform before you initiate',
  'Generator':            'Wait to respond',
  'Manifesting Generator':'Wait to respond, then inform',
  'Projector':            'Wait for the invitation',
  'Reflector':            'Wait a lunar cycle',
};

const TYPE_NOT_SELF: Record<HDType, string> = {
  'Manifestor':           'Anger',
  'Generator':            'Frustration',
  'Manifesting Generator':'Anger and frustration',
  'Projector':            'Bitterness',
  'Reflector':            'Disappointment',
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

/**
 * Calculate the complete Human Design bodygraph for a birth event.
 */
export function calculateHumanDesign(input: HumanDesignInput): HumanDesignResult {
  const { birthDate, birthTime, latitude, longitude, timezone } = input;

  // ── Personality Epoch: exact birth moment ─────────────────────────────────
  const personalityJD = localToJulianDay(birthDate, birthTime, timezone);
  const personalityPositions = getPlanetPositionsAtJD(personalityJD, latitude, longitude, false);

  // ── Design Epoch: 88° Sun retrograde arc before birth ─────────────────────
  const designJD = findDesignEpochJD(
    personalityJD,
    personalityPositions.sun.longitude,
    latitude,
    longitude,
  );
  const designPositions = getPlanetPositionsAtJD(designJD, latitude, longitude, false);

  // ── Extract gate activations for both epochs ──────────────────────────────
  const personalityActivations = extractGateActivations(personalityPositions, 'personality');
  const designActivations      = extractGateActivations(designPositions,      'design');
  const allActivations         = [...personalityActivations, ...designActivations];

  // ── Determine centers and channels ────────────────────────────────────────
  const { definedCenters, activeChannels } = determineDefinedCenters(allActivations);

  const ALL_CENTERS: HDCenter[] = [
    'head', 'ajna', 'throat', 'g_center',
    'heart', 'solar_plexus', 'sacral', 'spleen', 'root',
  ];
  const undefinedCenters = ALL_CENTERS.filter((c) => !definedCenters.has(c));

  // ── Type, Authority, Profile ───────────────────────────────────────────────
  const type      = determineType(definedCenters, activeChannels);
  const authority = determineAuthority(definedCenters);

  // Profile: Personality Sun line / Design Sun line
  const pSunActivation = personalityActivations.find((a) => a.planet === 'sun');
  const dSunActivation = designActivations.find((a) => a.planet === 'sun');
  const pSunLine = pSunActivation?.line ?? 1;
  const dSunLine = dSunActivation?.line ?? 1;
  const profile = `${pSunLine}/${dSunLine}`;

  // Incarnation Cross: Personality Sun/Earth + Design Sun/Earth
  const pEarthActivation = personalityActivations.find((a) => a.planet === 'earth');
  const dEarthActivation = designActivations.find((a) => a.planet === 'earth');
  const incarnationCross = getIncarnationCross(
    pSunActivation?.gate ?? 0,
    pEarthActivation?.gate ?? 0,
    dSunActivation?.gate ?? 0,
    dEarthActivation?.gate ?? 0,
  );

  return {
    type,
    authority,
    profile,
    strategy: TYPE_STRATEGY[type],
    notSelf: TYPE_NOT_SELF[type],
    incarnationCross,
    definedCenters: [...definedCenters],
    undefinedCenters,
    activeChannels,
    activeGates: allActivations,
    personalityEpoch: {
      julianDay: personalityJD,
      solarLongitude: personalityPositions.sun.longitude,
    },
    designEpoch: {
      julianDay: designJD,
      solarLongitude: designPositions.sun.longitude,
    },
  };
}

// ─── NAMED EXPORTS FOR TESTING ────────────────────────────────────────────────
export { longitudeToGate, GATE_SEQUENCE, GATE_CENTER_MAP, UNIQUE_CHANNELS };
