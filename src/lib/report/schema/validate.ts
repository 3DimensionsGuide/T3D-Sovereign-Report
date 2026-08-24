/**
 * T3D Report — Validation Layer
 *
 * Validates the normalized ReportData object before rendering.
 * Returns structured errors and warnings — never throws for non-critical issues.
 *
 * Input classes:
 *   Required    → error if missing (blocks PDF render)
 *   Optional    → warning if missing (conditional page content)
 *   Derived     → warning if out of expected range
 *   Consent     → warning if not recorded
 */

import type { ReportData } from '../tokens';
import { ZODIAC_SIGNS } from './normalize';

// ─── Validation result type ───────────────────────────────────────────────────
export interface ValidationResult {
  valid:    boolean;     // false = critical error, PDF should not render
  errors:   string[];   // critical — required fields missing
  warnings: string[];   // non-critical — conditional content affected
  completeness: 'complete' | 'partial' | 'minimal';
}

const VALID_HD_TYPES = [
  'Manifesting Generator', 'Generator', 'Projector', 'Manifestor', 'Reflector',
] as const;

const VALID_AUTHORITIES = [
  'Sacral', 'Emotional', 'Splenic', 'Self-Projected', 'Ego', 'None', 'Lunar',
] as const;

const VALID_PROFILES = [
  '1/3','1/4','2/4','2/5','3/5','3/6',
  '4/6','4/1','5/1','5/2','6/2','6/3',
] as const;

// ─── Main validation function ─────────────────────────────────────────────────
export function validateReportData(data: ReportData): ValidationResult {
  const errors:   string[] = [];
  const warnings: string[] = [];

  // ── INPUT CLASS #1: Required ───────────────────────────────────────────────
  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('REQUIRED: firstName is missing');
  }
  if (!data.birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) {
    errors.push('REQUIRED: birthDate missing or invalid format (expected YYYY-MM-DD)');
  }
  if (!data.email || !data.email.includes('@')) {
    warnings.push('REQUIRED: email missing or invalid — report delivery affected');
  }

  // ── INPUT CLASS #3: Derived — Human Design ─────────────────────────────────
  if (!VALID_HD_TYPES.includes(data.hdType as typeof VALID_HD_TYPES[number])) {
    warnings.push(`DERIVED: hdType "${data.hdType}" is not a recognized type — check normalization`);
  }
  if (!VALID_AUTHORITIES.includes(data.hdAuthority as typeof VALID_AUTHORITIES[number])) {
    warnings.push(`DERIVED: hdAuthority "${data.hdAuthority}" is not recognized — check normalization`);
  }
  if (!VALID_PROFILES.includes(data.hdProfile as typeof VALID_PROFILES[number])) {
    warnings.push(`DERIVED: hdProfile "${data.hdProfile}" is not a standard profile`);
  }
  if (data.hdDefinedCenters.length === 0) {
    warnings.push('DERIVED: hdDefinedCenters is empty — check HD engine output');
  }

  // ── INPUT CLASS #3: Derived — Numerology ──────────────────────────────────
  if (data.lifePath < 1 || data.lifePath > 33) {
    warnings.push(`DERIVED: lifePath ${data.lifePath} is out of range (1–33)`);
  }
  if (data.personalYear < 1 || data.personalYear > 33) {
    warnings.push(`DERIVED: personalYear ${data.personalYear} is out of range (1–33)`);
  }
  if (data.pinnacles.length !== 4) {
    warnings.push(`DERIVED: pinnacles array has ${data.pinnacles.length} entries (expected 4)`);
  }
  if (data.challenges.length !== 4) {
    warnings.push(`DERIVED: challenges array has ${data.challenges.length} entries (expected 4)`);
  }

  // ── INPUT CLASS #2: Optional — Full Name ──────────────────────────────────
  if (!data.hasFullName) {
    warnings.push('OPTIONAL: hasFullName is false — name-based numerology pages will show alternative content');
  }

  // ── INPUT CLASS #3: Derived — Astrology ───────────────────────────────────
  const validSign = (s: string) => ZODIAC_SIGNS.includes(s as typeof ZODIAC_SIGNS[number]);
  if (!validSign(data.sunSign)) {
    warnings.push(`DERIVED: sunSign "${data.sunSign}" is not a valid zodiac sign`);
  }
  if (!validSign(data.moonSign)) {
    warnings.push(`DERIVED: moonSign "${data.moonSign}" is not a valid zodiac sign`);
  }
  if (!validSign(data.risingSign)) {
    warnings.push(`DERIVED: risingSign "${data.risingSign}" — rising sign is "${data.risingSign}" — may indicate missing birth time`);
  }

  // ── INPUT CLASS #4: Consent ────────────────────────────────────────────────
  if (!data.consent?.reportStorageConsented) {
    warnings.push('CONSENT: report storage consent not recorded');
  }

  // ── Completeness grade ────────────────────────────────────────────────────
  const criticalWarnings = warnings.filter(w =>
    w.startsWith('DERIVED:') || w.startsWith('REQUIRED:')
  ).length;

  const completeness = errors.length > 0
    ? 'minimal'
    : criticalWarnings > 2
    ? 'partial'
    : 'complete';

  const valid = errors.length === 0;

  if (!valid) {
    console.error('[T3D Report] Validation errors:', errors);
  }
  if (warnings.length > 0) {
    console.warn('[T3D Report] Validation warnings:', warnings);
  }

  return { valid, errors, warnings, completeness };
}

/** Quick check — is this field populated with a meaningful value? */
export function isPopulated(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0 && value !== '—';
  if (typeof value === 'number') return !isNaN(value) && value !== 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}
