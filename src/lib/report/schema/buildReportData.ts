/**
 * T3D Report — Report Data Builder
 *
 * Raw DB record → normalized → validated → ReportData
 *
 * Pipeline:
 *   1. Extract raw sub-objects from lead.results
 *   2. Normalize: run all values through type-safe maps and formatters
 *   3. Extract all six astrology placements from nested DB structure:
 *        results.astrology.tropical.{sun, moon, houses}
 *        results.astrology.sidereal.{sun, moon, houses}
 *   4. Derive: compute numerology fields from birth date
 *   5. Validate: check completeness and flag issues
 *   6. Assemble: return clean, typed ReportData object
 */

import type { ReportData } from '../tokens';
import {
  normalizeType, normalizeAuthority, normalizeStrategy,
  normalizeNotSelf, normalizeProfile, normalizeCenters,
  normalizePlanetPosition, extractSign, normalizeNum,
  computeLifePath, computeBirthday, computeAttitude,
  computePersonalYear, computeChallenges, computePinnacleIndex,
} from './normalize';
import { validateReportData } from './validate';
import { runIntegrityCheck } from './dataIntegrity';

// ─── Type helpers ─────────────────────────────────────────────────────────────

interface LeadRecord {
  id:              number;
  firstName:       string | null;
  lastName:        string | null;
  email:           string | null;
  birthData:       unknown;
  results:         unknown;
  reportPurchased: boolean | null;
  createdAt?:      Date | null;
  consentStorage?: boolean | null;
  consentEmail?:   boolean | null;
}

type RawRecord = Record<string, unknown>;

function asRecord(v: unknown): RawRecord {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as RawRecord;
  return {};
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

// ─── Ascendant from houses ────────────────────────────────────────────────────
// swisseph stores ASC inside the houses object. Format varies by version:
//   Format A: houses.ascendant → { formatted, longitude, sign }
//   Format B: houses.asc       → { formatted, longitude, sign }
//   Format C: houses["1"]      → { formatted, longitude, sign }
//   Format D: houses.cusps[0]  → longitude number
//   Format E: houses.list[0]   → longitude number

function extractAscendantFromHouses(planetObj: RawRecord): unknown {
  const houses = asRecord(planetObj['houses'] ?? {});
  if (houses['ascendant']) return houses['ascendant'];
  if (houses['asc'])       return houses['asc'];
  if (houses['1'])         return houses['1'];
  const cusps = houses['cusps'];
  if (Array.isArray(cusps) && cusps.length > 0) return cusps[0];
  const list = houses['list'];
  if (Array.isArray(list) && list.length > 0) return list[0];
  if (planetObj['ascendant']) return planetObj['ascendant'];
  return null;
}

function extractMCFromHouses(planetObj: RawRecord): unknown {
  const houses = asRecord(planetObj['houses'] ?? {});
  if (houses['mc'])        return houses['mc'];
  if (houses['midheaven']) return houses['midheaven'];
  if (houses['10'])        return houses['10'];
  const cusps = houses['cusps'];
  if (Array.isArray(cusps) && cusps.length >= 10) return cusps[9];
  return null;
}

// Prefer the .sign field on the raw planet object over parsing the formatted string
function getSignFromRaw(raw: unknown, formatted: string): string {
  if (raw && typeof raw === 'object') {
    const s = (raw as RawRecord)['sign'];
    if (typeof s === 'string' && s.length > 0) return s;
  }
  return extractSign(formatted);
}

// ─── Pinnacle normalization ───────────────────────────────────────────────────

type RawPinnacle = { number?: unknown; label?: unknown; startAge?: unknown; endAge?: unknown };

function normalizePinnacles(raw: unknown): ReportData['pinnacles'] {
  const arr = asArray(raw);
  if (arr.length === 0) return defaultPinnacles();
  return arr.map((p, i) => {
    const rp = asRecord(p) as RawPinnacle;
    return {
      number:   normalizeNum(rp.number, 1),
      label:    String(rp.label ?? `Pinnacle ${i + 1}`),
      startAge: normalizeNum(rp.startAge, i * 9),
      endAge:   rp.endAge === null || rp.endAge === undefined
        ? null : normalizeNum(rp.endAge, 0),
    };
  }) as ReportData['pinnacles'];
}

function defaultPinnacles(): ReportData['pinnacles'] {
  return [
    { number: 1, label: 'First Pinnacle',  startAge: 0,  endAge: 27 },
    { number: 1, label: 'Second Pinnacle', startAge: 28, endAge: 36 },
    { number: 1, label: 'Third Pinnacle',  startAge: 37, endAge: 45 },
    { number: 1, label: 'Fourth Pinnacle', startAge: 46, endAge: null },
  ];
}

type RawChannel = { name?: unknown; gates?: unknown; activatedBy?: unknown };

function normalizeChannels(raw: unknown): ReportData['hdChannels'] {
  return asArray(raw).map(ch => {
    const rc = asRecord(ch) as RawChannel;
    return {
      name:        String(rc.name ?? ''),
      gates:       asArray(rc.gates).map(g => Number(g)),
      activatedBy: String(rc.activatedBy ?? ''),
    };
  });
}

// ─── MAIN BUILDER ─────────────────────────────────────────────────────────────

export function buildReportData(lead: LeadRecord): ReportData {

  // ── 1. Extract raw sub-objects ─────────────────────────────────────────────
  const results  = asRecord(lead.results ?? {});
  const rawHD    = asRecord(results['humanDesign'] ?? results['human_design'] ?? {});
  const rawNum   = asRecord(results['numerology']  ?? {});
  const rawAst   = asRecord(results['astrology']   ?? {});
  const rawBirth = asRecord(lead.birthData ?? {});

  // ── 2. Required identity fields ────────────────────────────────────────────
  const firstName = (lead.firstName ?? '').trim();
  const lastName  = (lead.lastName  ?? '').trim();
  const email     = (lead.email     ?? '').trim();
  const birthDate = String(rawBirth['date'] ?? '').trim();

  if (!firstName) throw new Error('[buildReportData] firstName is required');
  if (!birthDate) throw new Error('[buildReportData] birthDate is required');

  // ── 3. Normalize Human Design ──────────────────────────────────────────────
  const hdType      = normalizeType(rawHD['type']);
  const hdAuthority = normalizeAuthority(rawHD['authority']);
  const hdStrategy  = normalizeStrategy(rawHD['strategy']);
  const hdNotSelf   = normalizeNotSelf(rawHD['notSelf'], hdType);
  const hdProfile   = normalizeProfile(rawHD['profile']);
  const hdDefinedCenters = normalizeCenters(
    rawHD['definedCenters'] ?? rawHD['defined_centers'] ?? []
  );
  const hdChannels = normalizeChannels(
    rawHD['activeChannels'] ?? rawHD['channels'] ?? []
  );

  // ── 4. Extract all six astrology placements ────────────────────────────────
  //
  // DB structure:
  //   results.astrology.tropical.sun   → { sign, formatted, longitude, ... }
  //   results.astrology.tropical.moon  → { sign, formatted, longitude, ... }
  //   results.astrology.tropical.houses → { ascendant, mc, cusps, ... }
  //   results.astrology.sidereal.*     → same structure
  //
  // This is mapping-only — zero calculations here.

  const tropObj = asRecord(rawAst['tropical'] ?? {});
  const sidObj  = asRecord(rawAst['sidereal']  ?? {});

  // Planet raw objects (each has .sign and .formatted)
  const tropSunRaw  = tropObj['sun']  ?? rawAst['tropicalSun'];
  const tropMoonRaw = tropObj['moon'] ?? rawAst['tropicalMoon'];
  const sidSunRaw   = sidObj['sun']   ?? rawAst['siderealSun'];
  const sidMoonRaw  = sidObj['moon']  ?? rawAst['siderealMoon'];

  // Ascendant from houses (tries all known swisseph formats)
  const tropAscRaw = extractAscendantFromHouses(tropObj) ?? rawAst['tropicalAscendant'];
  const sidAscRaw  = extractAscendantFromHouses(sidObj)  ?? rawAst['siderealAscendant'];

  // MC
  const tropMCRaw = extractMCFromHouses(tropObj) ?? rawAst['tropicalMC'];

  // Ayanamsha — always named explicitly, never just "Sidereal"
  const ayanamsha = String(
    rawAst['ayanamsha']     ??
    sidObj['ayanamsha']     ??
    rawAst['ayanamshaName'] ??
    'Lahiri'
  );

  // Normalize to formatted strings
  const tropicalSun  = normalizePlanetPosition(tropSunRaw);
  const tropicalMoon = normalizePlanetPosition(tropMoonRaw);
  const tropicalAsc  = normalizePlanetPosition(tropAscRaw);
  const tropicalMC   = normalizePlanetPosition(tropMCRaw);
  const siderealSun  = normalizePlanetPosition(sidSunRaw);
  const siderealMoon = normalizePlanetPosition(sidMoonRaw);
  const siderealAsc  = normalizePlanetPosition(sidAscRaw);

  // Extract sign names (prefer .sign field over parsing formatted string)
  const sunSign    = getSignFromRaw(tropSunRaw,  tropicalSun);
  const moonSign   = getSignFromRaw(tropMoonRaw, tropicalMoon);
  const risingSign = getSignFromRaw(tropAscRaw,  tropicalAsc);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Astrology]', {
      tropicalSun, tropicalMoon, tropicalAsc,
      siderealSun, siderealMoon, siderealAsc,
      sunSign, moonSign, risingSign, ayanamsha,
    });
  }

  // ── 5. Compute derived numerology fields ───────────────────────────────────
  const lp           = computeLifePath(birthDate);
  const birthday     = computeBirthday(birthDate);
  const attitude     = computeAttitude(birthDate);
  const personalYear = computePersonalYear(birthDate);
  const challenges   = computeChallenges(birthDate);
  const pinnacles    = normalizePinnacles(rawNum['pinnacles'] ?? []);
  const currentPinnacleIndex = computePinnacleIndex(pinnacles, birthDate);

  // ── 6. Name-based numerology (Input Class #2 — conditional) ───────────────
  const destinyNum     = normalizeNum(rawNum['destiny']     ?? rawNum['expression'], 0);
  const soulUrgeNum    = normalizeNum(rawNum['soulUrge']    ?? rawNum['soul_urge'],  0);
  const personalityNum = normalizeNum(rawNum['personality'], 0);
  const hasFullName    = destinyNum > 0 && soulUrgeNum > 0 && personalityNum > 0;

  // ── 7. Consent / Preference (Input Class #4) ──────────────────────────────
  const consent = {
    reportStorageConsented: lead.consentStorage ?? true,
    emailSequenceConsented: lead.consentEmail   ?? false,
    dataCollectedAt: lead.createdAt
      ? lead.createdAt.toISOString()
      : new Date().toISOString(),
  };

  // ── 7b. Integrity check ────────────────────────────────────────────────────
  const dataQuality = runIntegrityCheck(
    rawBirth,
    (rawBirth['timezoneId'] as string | undefined)
  );

  // ── 8. Assemble clean ReportData ───────────────────────────────────────────
  const reportData: ReportData = {
    // Personal
    firstName,
    lastName,
    email,
    birthDate,
    generatedAt: new Date().toISOString(),

    // Human Design
    hdType,
    hdAuthority,
    hdProfile,
    hdStrategy,
    hdNotSelf,
    hdDefinedCenters,
    hdChannels,

    // Numerology — core
    lifePath:            lp.reduced,
    lifePathDisplay:     lp.display,
    lifePathCompound:    lp.compound,
    personalYear,
    pinnacles,
    currentPinnacleIndex,
    challenges,
    birthdayNumber:      birthday.number,
    birthdayDisplay:     birthday.display,
    attitudeNumber:      attitude.number,
    attitudeDisplay:     attitude.display,

    // Numerology — name-based (conditional)
    hasFullName,
    destiny:             destinyNum,
    soulUrge:            soulUrgeNum,
    personality:         personalityNum,
    hiddenPassion:       normalizeNum(rawNum['hiddenPassion'] ?? rawNum['hidden_passion'], 0),
    karmicLessons:       asArray(rawNum['karmicLessons'] ?? rawNum['karmic_lessons']).map(Number),

    // Astrology — all six placements
    tropicalSun,
    tropicalMoon,
    tropicalAsc,
    tropicalMC,
    siderealSun,
    siderealMoon,
    siderealAsc,
    ayanamsha,

    // Extracted signs
    sunSign,
    moonSign,
    risingSign,

    // Consent
    consent,

    // Data quality
    dataQuality,
  };

  // ── 9. Validate ────────────────────────────────────────────────────────────
  const validation = validateReportData(reportData);

  if (!validation.valid) {
    throw new Error(
      `[buildReportData] Critical validation errors:\n${validation.errors.join('\n')}`
    );
  }

  return reportData;
}
