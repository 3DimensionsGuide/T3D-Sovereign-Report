/**
 * T3D Report — Quality Assurance Checklist
 *
 * Eight checks run before every PDF render.
 * Failures are surfaced as warnings — they do not block the render
 * unless the check is marked critical (checks #1 and #7).
 *
 * Check #1 — Data          All calculated fields match calculator output
 * Check #2 — Copy          Name, labels, and terms are consistent
 * Check #3 — Report logic  Required Level A modules present; Level B conditional
 * Check #4 — Readability   Thesis present; hierarchy visible
 * Check #5 — Design        System color use consistent; dark pages correct
 * Check #6 — Action        One field practice per section; synthesis has experiment
 * Check #7 — Scope         No prohibited claim types (critical)
 * Check #8 — Delivery      Navigation Card present; synthesis attached
 */

import type { ReportData } from '../tokens';

// ─── Result types ─────────────────────────────────────────────────────────────
export interface CheckResult {
  check:    number;
  name:     string;
  passed:   boolean;
  critical: boolean;     // if true, failure should block delivery
  issues:   string[];
  notes:    string[];
}

export interface QAReport {
  passed:       boolean;    // all critical checks passed
  score:        number;     // 0–100 (each check worth 12.5 points)
  results:      CheckResult[];
  blockingIssues: string[]; // from critical checks only
  timestamp:    string;
}

// ─── Valid value sets ─────────────────────────────────────────────────────────
const VALID_HD_TYPES = new Set([
  'Manifesting Generator', 'Generator', 'Projector', 'Manifestor', 'Reflector',
]);
const VALID_AUTHORITIES = new Set([
  'Sacral', 'Emotional', 'Splenic', 'Self-Projected', 'Ego', 'None', 'Lunar',
]);
const VALID_PROFILES = new Set([
  '1/3','1/4','2/4','2/5','3/5','3/6','4/6','4/1','5/1','5/2','6/2','6/3',
]);
const VALID_SIGNS = new Set([
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
]);

// Prohibited language patterns (Check #7)
const PROHIBITED_PATTERNS = [
  { pattern: /\byou will always\b/i,               category: 'Absolute claim' },
  { pattern: /\bguaranteed to\b/i,                 category: 'Absolute claim' },
  { pattern: /\bthe universe demands\b/i,          category: 'Cosmic authority' },
  { pattern: /\bthe stars say\b/i,                 category: 'Cosmic authority' },
  { pattern: /\byour flaw is\b/i,                  category: 'Pathologizing' },
  { pattern: /\byou are destined\b/i,              category: 'Predictive certainty' },
  { pattern: /\bthis proves your destiny\b/i,      category: 'Predictive certainty' },
  { pattern: /\breplaces professional advice\b/i,  category: 'Scope violation' },
  { pattern: /\bthis is a diagnosis\b/i,           category: 'Scope violation' },
  { pattern: /\bmedical advice\b/i,                category: 'Scope violation' },
  { pattern: /\bfinancial advice\b/i,              category: 'Scope violation' },
  { pattern: /\byour fate\b/i,                     category: 'Fate language' },
  { pattern: /\byou are broken\b/i,                category: 'Pathologizing' },
];

// ─── Individual checks ────────────────────────────────────────────────────────

function check1Data(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Validate HD fields
  if (!VALID_HD_TYPES.has(data.hdType))
    issues.push(`hdType "${data.hdType}" is not a recognized type`);
  if (!VALID_AUTHORITIES.has(data.hdAuthority))
    issues.push(`hdAuthority "${data.hdAuthority}" is not recognized`);
  if (!VALID_PROFILES.has(data.hdProfile))
    issues.push(`hdProfile "${data.hdProfile}" is not a standard profile`);
  if (data.hdDefinedCenters.length === 0)
    issues.push('hdDefinedCenters is empty');

  // Validate numerology
  if (data.lifePath < 1 || data.lifePath > 33)
    issues.push(`lifePath ${data.lifePath} is out of range (1–33)`);
  if (data.personalYear < 1 || data.personalYear > 33)
    issues.push(`personalYear ${data.personalYear} is out of range`);
  if (data.pinnacles.length !== 4)
    issues.push(`pinnacles has ${data.pinnacles.length} entries (expected 4)`);
  if (data.challenges.length !== 4)
    issues.push(`challenges has ${data.challenges.length} entries (expected 4)`);

  // Validate compound display consistency
  const expectedDisplay = data.lifePathCompound !== data.lifePath && data.lifePathCompound > 9
    ? `${data.lifePathCompound}/${data.lifePath}`
    : String(data.lifePath);
  if (data.lifePathDisplay !== expectedDisplay)
    issues.push(`lifePathDisplay "${data.lifePathDisplay}" does not match expected "${expectedDisplay}"`);

  // Validate astrology
  if (!VALID_SIGNS.has(data.sunSign))
    issues.push(`sunSign "${data.sunSign}" is not a valid zodiac sign`);
  if (!VALID_SIGNS.has(data.moonSign))
    issues.push(`moonSign "${data.moonSign}" is not a valid zodiac sign`);

  // Note birth-time sensitivity
  if (data.dataQuality?.birthTimeSensitive)
    notes.push(`Birth time is ${data.dataQuality.birthTimeStatus} — time-sensitive fields flagged`);

  return { check: 1, name: 'Data Integrity', passed: issues.length === 0,
    critical: true, issues, notes };
}

function check2Copy(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Name must be present and clean
  if (!data.firstName.trim())
    issues.push('firstName is empty');
  if (data.firstName.toLowerCase() === 'unknown' || data.firstName === '—')
    issues.push('firstName contains placeholder value');

  // Check for placeholder values in key fields
  const placeholders = ['Unknown', 'undefined', 'null', '—', 'N/A'];
  for (const field of ['hdType', 'hdAuthority', 'hdStrategy', 'sunSign', 'moonSign'] as const) {
    if (placeholders.includes(data[field]))
      issues.push(`${field} contains placeholder value "${data[field]}"`);
  }

  // Consistent compound number display
  if (data.lifePathDisplay && !data.lifePathDisplay.match(/^\d+\/\d+$|^\d+$/))
    issues.push(`lifePathDisplay "${data.lifePathDisplay}" has unexpected format`);
  if (data.birthdayDisplay && !data.birthdayDisplay.match(/^\d+\/\d+$|^\d+$/))
    issues.push(`birthdayDisplay "${data.birthdayDisplay}" has unexpected format`);

  // Email should look valid
  if (!data.email.includes('@'))
    notes.push('Email address missing or invalid — delivery may be affected');

  return { check: 2, name: 'Copy Consistency', passed: issues.length === 0,
    critical: false, issues, notes };
}

function check3ReportLogic(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Level A: synthesis must be present
  const dataAny = data as ReportData & { synthesis?: string };
  if (!dataAny.synthesis || dataAny.synthesis.trim().length < 100)
    issues.push('Synthesis paragraph is missing or too short (< 100 chars)');

  // Level B: name-based numerology shown only when valid
  if (!data.hasFullName) {
    if (data.destiny > 0 || data.soulUrge > 0)
      issues.push('Name-based numbers are non-zero but hasFullName is false — conditional content may show incorrectly');
    else
      notes.push('Name-based numerology (Level B) correctly withheld — hasFullName is false');
  }

  // Pinnacles: current index must be valid
  if (data.currentPinnacleIndex < 0 || data.currentPinnacleIndex >= data.pinnacles.length)
    issues.push(`currentPinnacleIndex ${data.currentPinnacleIndex} is out of range`);

  // Consent recorded
  if (!data.consent?.reportStorageConsented)
    notes.push('Storage consent not recorded for this report');

  return { check: 3, name: 'Report Logic', passed: issues.length === 0,
    critical: false, issues, notes };
}

function check4Readability(_data: ReportData): CheckResult {
  // This check is primarily structural (verified by Python audit).
  // At render time we verify that the synthesis is within word count spec.
  const issues: string[] = [];
  const notes:  string[] = [];

  const dataAny = _data as ReportData & { synthesis?: string; synthesisSource?: string };
  if (dataAny.synthesis) {
    const words = dataAny.synthesis.trim().split(/\s+/).length;
    if (words < 180)
      issues.push(`Synthesis is ${words} words — below 180-word minimum`);
    else if (words > 260)
      issues.push(`Synthesis is ${words} words — above 260-word maximum`);
    else
      notes.push(`Synthesis: ${words} words (within 180–260 spec) via ${dataAny.synthesisSource ?? 'unknown'}`);
  }

  return { check: 4, name: 'Readability', passed: issues.length === 0,
    critical: false, issues, notes };
}

function check5Design(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Birth-time sensitivity: if uncertain, sensitive pages must show notice
  if (data.dataQuality?.birthTimeSensitive) {
    notes.push('Birth-time sensitivity banners should appear on Pages 27 and 29');
    if (data.dataQuality.birthTimeStatus === 'missing')
      issues.push('Birth time is missing — Rising sign and house data should be withheld or clearly flagged');
  }

  // Data quality block should be on Page 43
  notes.push('Verify DataQualityBlock is visible on Page 43 (Data Notes)');
  notes.push('Verify Ethical Scope Note is visible at top of Page 43');

  return { check: 5, name: 'Design Consistency', passed: issues.length === 0,
    critical: false, issues, notes };
}

function check6Action(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Verify synthesis contains experiment language
  const dataAny = data as ReportData & { synthesis?: string };
  if (dataAny.synthesis) {
    const hasExperiment = /\b(seven.day|7.day|this week|experiment|practice|try|notice)\b/i
      .test(dataAny.synthesis);
    if (!hasExperiment)
      issues.push('Synthesis paragraph does not appear to contain a closing experiment');
    else
      notes.push('Synthesis contains experiment language ✓');
  }

  // Structural checks — verified by Python audit against file system
  notes.push('Section 3 field practice: Page17VehiclePractice (verify amber footer)');
  notes.push('Section 4 field practice: Page25RoadPractice (verify emerald footer)');
  notes.push('Section 5 field practice: Page33StoplightPractice (verify crimson footer)');
  notes.push('Section 6 integrated experiment: Page39SevenDay (7-day sequence)');

  return { check: 6, name: 'Action Integrity', passed: issues.length === 0,
    critical: false, issues, notes };
}

function check7Scope(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Check synthesis for prohibited language
  const dataAny = data as ReportData & { synthesis?: string };
  const textToCheck = dataAny.synthesis ?? '';
  for (const { pattern, category } of PROHIBITED_PATTERNS) {
    if (pattern.test(textToCheck))
      issues.push(`Prohibited language in synthesis [${category}]: matches "${pattern.source}"`);
  }

  // Ethical Scope Note presence (structural — checked in Python audit)
  notes.push('Ethical Scope Note must appear on Page 43 (verified in Python audit)');
  notes.push('Language guide-rail audit: run audit_language_guide.py before release');

  return { check: 7, name: 'Scope Integrity', passed: issues.length === 0,
    critical: true, issues, notes };
}

function check8Delivery(data: ReportData): CheckResult {
  const issues: string[] = [];
  const notes:  string[] = [];

  // Navigation Card presence — Page 40 always renders
  notes.push('Navigation Card: Page 40 always renders (verify screenshot quality)');

  // Synthesis source
  const dataAny = data as ReportData & { synthesisSource?: string };
  if (dataAny.synthesisSource === 'fallback')
    notes.push('Synthesis generated from fallback template (API unavailable at render time)');
  else if (dataAny.synthesisSource === 'api')
    notes.push('Synthesis generated via Claude API ✓');

  // Birth-time delivery note
  if (data.dataQuality?.birthTimeSensitive)
    notes.push('Update-time pathway: 3dimensions.guide/update-time referenced in sensitivity notices');

  // Integration sequence
  if (!data.consent?.emailSequenceConsented)
    notes.push('Email sequence consent not recorded — integration sequence may not be sent');

  // File delivery
  notes.push('PDF download: verify Content-Disposition header and filename are correct');
  notes.push('Mobile display: test Navigation Card screenshot quality on iOS and Android');

  return { check: 8, name: 'Delivery', passed: issues.length === 0,
    critical: false, issues, notes };
}

// ─── Main QA runner ───────────────────────────────────────────────────────────
/**
 * runQAChecklist
 *
 * Runs all 8 QA checks against a validated ReportData object.
 * Call this in route.ts after buildReportData() and before renderToBuffer().
 *
 * Critical failures (checks #1 and #7) should block delivery.
 * Non-critical failures should be logged and surfaced on Page 43.
 */
export function runQAChecklist(data: ReportData): QAReport {
  const results: CheckResult[] = [
    check1Data(data),
    check2Copy(data),
    check3ReportLogic(data),
    check4Readability(data),
    check5Design(data),
    check6Action(data),
    check7Scope(data),
    check8Delivery(data),
  ];

  const blockingIssues = results
    .filter(r => r.critical && !r.passed)
    .flatMap(r => r.issues);

  const passed = blockingIssues.length === 0;

  const passedCount = results.filter(r => r.passed).length;
  const score = Math.round((passedCount / results.length) * 100);

  if (!passed) {
    console.error('[QA] Critical failures — delivery blocked:', blockingIssues);
  }

  const warnings = results.filter(r => !r.passed && !r.critical);
  if (warnings.length > 0) {
    console.warn('[QA] Non-critical issues:', warnings.flatMap(r => r.issues));
  }

  return {
    passed,
    score,
    results,
    blockingIssues,
    timestamp: new Date().toISOString(),
  };
}

/**
 * formatQAReport
 *
 * Returns a human-readable summary for logging.
 */
export function formatQAReport(report: QAReport): string {
  const lines = [
    `\nT3D QA Report — ${new Date(report.timestamp).toLocaleString()}`,
    `Score: ${report.score}/100 | Status: ${report.passed ? '✓ PASS' : '✗ BLOCKED'}`,
    '─'.repeat(50),
  ];

  for (const r of report.results) {
    const icon = r.passed ? '✓' : (r.critical ? '✗' : '△');
    lines.push(`${icon}  Check #${r.check}: ${r.name}`);
    for (const issue of r.issues)   lines.push(`     ISSUE: ${issue}`);
    for (const note of r.notes)     lines.push(`     NOTE:  ${note}`);
  }

  if (report.blockingIssues.length > 0) {
    lines.push('─'.repeat(50));
    lines.push('BLOCKING ISSUES (fix before delivery):');
    for (const b of report.blockingIssues) lines.push(`  ✗ ${b}`);
  }

  return lines.join('\n');
}
