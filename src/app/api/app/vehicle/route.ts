/**
 * POST /api/app/vehicle
 * The Vehicle (Human Design) screen: the full interpretation of the person's
 * Type, Authority, Profile, Definition, Centers, Circuits, Gates,
 * Incarnation Cross, Godhead and Variables, taken from the T3D reports.
 *
 * Body: { leadId: number, email: string }
 *
 * Same access rule as the other app routes (id must pair with the lead's
 * email; identical 404 otherwise). The interpretation writing never ships in
 * the app bundle: it is served from here, and `locked` is the single switch
 * for gating sections behind a purchase later.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { leads } from '@/server/db/schema';
import { normalizeAuthority, normalizeCenters, normalizeProfile, normalizeType } from '@/lib/report/schema/normalize';
import {
  AUTHORITY_CONTENT,
  AUTHORITY_DISTORTION,
  CENTER_CAPACITIES,
  CENTER_DISPLAY_NAME,
  NOT_SELF_VOICE,
  OPEN_CENTER_THEMES,
  PROFILE_CONTENT,
  TYPE_CONTENT,
  ALL_CENTERS,
} from '@/lib/report/section3/hd-content';
import {
  CIRCUIT_GROUP_MEANING,
  GATE_KEYNOTES,
  HANGING_GATE_AURIC_DETAIL,
  findChannelCircuit,
} from '@/lib/report/section3/gate-content';
import { GODHEAD_MECHANISM, findGodheadByGate } from '@/lib/report/section3/godhead-content';
import { limitRequest, noteAccessFailure } from '@/server/rateLimit';
import {
  DEFINITION_MEANING,
  VARIABLES_MECHANISM,
  VARIABLE_ARROW_LABEL,
  VARIABLE_ARROW_MEANING,
  calculateCircuitBalance,
  calculateCrossFamily,
  calculateDefinition,
  calculateSplitBridges,
  calculateVariables,
  getCrossGates,
} from '@/lib/report/tokens';

interface VehicleRequest {
  leadId?: unknown;
  email?: unknown;
}

const NOT_FOUND = { success: false, error: 'We could not find that chart. Please recalculate it.' };

/** Flip a section to true here (per person, once purchases exist) to lock it. */
const SECTIONS_LOCKED = false;

interface RawChannel {
  name?: unknown;
  gates?: unknown;
  activatedBy?: unknown;
  fromCenter?: unknown;
  toCenter?: unknown;
}

interface RawGate {
  gate?: unknown;
  line?: unknown;
  center?: unknown;
  planet?: unknown;
  epoch?: unknown;
  longitude?: unknown;
}

const PLANET_LABEL: Record<string, string> = {
  sun: 'Sun', earth: 'Earth', moon: 'Moon', northNode: 'North Node', southNode: 'South Node',
  mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn',
  uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};
const PLANET_ORDER = Object.keys(PLANET_LABEL);

function centerName(id: string): string {
  return CENTER_DISPLAY_NAME[id] ?? id;
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : Number(value ?? 0) || 0;
}

function pickAuthority(display: string) {
  const lower = display.toLowerCase();
  let key = Object.keys(AUTHORITY_CONTENT).find((k) => lower.includes(k.toLowerCase()));
  if (!key && (lower.includes('mental') || lower.includes('none') || lower.includes('environment'))) key = 'None';
  if (!key && lower.includes('lunar')) key = 'Lunar';
  return key ? { key, content: AUTHORITY_CONTENT[key] ?? null } : { key: null, content: null };
}

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await limitRequest(request, 'app');
  if (limited) return limited;
  try {
    let body: VehicleRequest;
    try {
      body = (await request.json()) as VehicleRequest;
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const leadId = Number(body.leadId);
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
    if (!Number.isInteger(leadId) || leadId < 1 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'leadId and a valid email are required' },
        { status: 400 },
      );
    }

    const rows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    const lead = rows[0];
    if (!lead || lead.email.toLowerCase().trim() !== email) {
      await noteAccessFailure(request);
      return NextResponse.json(NOT_FOUND, { status: 404 });
    }

    const hd = (lead.results as unknown as { humanDesign?: Record<string, unknown> } | null)?.humanDesign;
    if (
      !hd ||
      typeof hd.type !== 'string' ||
      typeof hd.authority !== 'string' ||
      typeof hd.profile !== 'string' ||
      !Array.isArray(hd.definedCenters) ||
      !Array.isArray(hd.activeChannels) ||
      !Array.isArray(hd.activeGates)
    ) {
      return NextResponse.json(
        { success: false, error: 'This chart is missing data. Please recalculate it.' },
        { status: 422 },
      );
    }

    const locked = SECTIONS_LOCKED;
    const typeName = normalizeType(hd.type);
    const authorityName = normalizeAuthority(hd.authority);
    const profileValue = normalizeProfile(hd.profile);
    const defined = normalizeCenters(hd.definedCenters);
    const open = ALL_CENTERS.filter((c) => !defined.includes(c));

    const channels = (hd.activeChannels as RawChannel[]).map((c) => ({
      name: String(c.name ?? ''),
      gates: (Array.isArray(c.gates) ? c.gates : []).map(Number),
      activatedBy: String(c.activatedBy ?? ''),
      fromCenter: String(c.fromCenter ?? ''),
      toCenter: String(c.toCenter ?? ''),
    }));
    const activeGates = (hd.activeGates as RawGate[]).map((g) => ({
      gate: num(g.gate),
      line: num(g.line),
      center: String(g.center ?? ''),
      planet: String(g.planet ?? ''),
      epoch: String(g.epoch ?? ''),
      longitude: num(g.longitude),
    }));

    // ── Type ────────────────────────────────────────────────────────────────
    const typeContent = TYPE_CONTENT[typeName] ?? null;
    const type = typeContent
      ? {
          name: typeContent.type,
          strategy: typeContent.strategy,
          signature: typeContent.signature,
          notSelf: typeContent.notSelf,
          plain: typeContent.plain,
          recognize: [...typeContent.recognize],
          watchFor: typeContent.watchFor,
          tryThis: typeContent.tryThis,
          strategyPractice: typeContent.strategyPractice,
          notSelfVoice: NOT_SELF_VOICE[typeName] ?? [],
        }
      : null;

    // ── Authority ───────────────────────────────────────────────────────────
    const picked = pickAuthority(authorityName);
    const authority = picked.content
      ? {
          name: picked.content.authority,
          mechanism: picked.content.mechanism,
          falseUrgency: picked.content.falseUrgency,
          distortion: picked.key ? (AUTHORITY_DISTORTION[picked.key] ?? null) : null,
          doList: [...picked.content.doList],
          doNotList: [...picked.content.doNotList],
          reset: picked.content.reset,
        }
      : null;

    // ── Profile ─────────────────────────────────────────────────────────────
    const pc = PROFILE_CONTENT[profileValue] ?? null;
    const profile = pc
      ? { value: pc.profile, role: pc.role, socialPattern: pc.socialPattern, visibility: pc.visibility, plain: pc.plain }
      : null;

    // ── Definition and bridges ──────────────────────────────────────────────
    const def = calculateDefinition(defined, channels);
    const bridges = calculateSplitBridges(def.groups, activeGates).map((b) => ({
      groupA: (def.groups[b.groupAIndex] ?? []).map(centerName),
      groupB: (def.groups[b.groupBIndex] ?? []).map(centerName),
      classification: b.classification,
      hangingGates: b.hangingGates.map((h) => ({
        gate: h.gate,
        ichingName: GATE_KEYNOTES[h.gate]?.ichingName ?? '',
        coreMeaning: GATE_KEYNOTES[h.gate]?.coreMeaning ?? '',
        center: centerName(h.center),
        partnerGate: h.partnerGate,
        partnerCenter: centerName(h.partnerCenter),
        channelName: h.channelName,
        experience: HANGING_GATE_AURIC_DETAIL[h.gate]?.experience ?? null,
      })),
    }));
    const definition = {
      type: def.type,
      circuitCount: def.circuitCount,
      meaning: DEFINITION_MEANING[def.type],
      groups: def.groups.map((g) => g.map(centerName)),
      bridges,
    };

    // ── Centers ─────────────────────────────────────────────────────────────
    const centers = {
      defined: defined.map((id) => ({
        id,
        name: centerName(id),
        title: CENTER_CAPACITIES[id]?.title ?? '',
        description: CENTER_CAPACITIES[id]?.description ?? '',
      })),
      open: open.map((id) => ({
        id,
        name: centerName(id),
        title: OPEN_CENTER_THEMES[id]?.title ?? '',
        sensitivity: OPEN_CENTER_THEMES[id]?.sensitivity ?? '',
        wisdom: OPEN_CENTER_THEMES[id]?.wisdom ?? '',
        notDefect: OPEN_CENTER_THEMES[id]?.notDefect ?? '',
      })),
    };

    // ── Circuits ────────────────────────────────────────────────────────────
    const balance = calculateCircuitBalance(channels);
    const circuitMeaning = CIRCUIT_GROUP_MEANING[balance.dominant];
    const circuits = {
      dominant: balance.dominant,
      keynote: circuitMeaning.keynote,
      passage: circuitMeaning.passage,
      counts: balance.counts,
      channels: channels.map((c) => {
        const [a, b] = c.gates as [number, number];
        const found = findChannelCircuit(a, b);
        return {
          name: c.name || found?.name || '',
          gates: [a, b] as [number, number],
          group: found?.group ?? null,
          subCircuit: found?.subCircuit ?? null,
          from: centerName(c.fromCenter),
          to: centerName(c.toCenter),
        };
      }),
    };

    // ── Gates ───────────────────────────────────────────────────────────────
    const gates = activeGates
      .slice()
      .sort((x, y) => {
        if (x.epoch !== y.epoch) return x.epoch === 'personality' ? -1 : 1;
        return PLANET_ORDER.indexOf(x.planet) - PLANET_ORDER.indexOf(y.planet);
      })
      .map((g) => ({
        gate: g.gate,
        line: g.line,
        planet: PLANET_LABEL[g.planet] ?? g.planet,
        epoch: g.epoch === 'personality' ? 'personality' : 'design',
        center: centerName(g.center),
        ichingName: GATE_KEYNOTES[g.gate]?.ichingName ?? '',
        coreMeaning: GATE_KEYNOTES[g.gate]?.coreMeaning ?? '',
      }));

    // ── Incarnation Cross ───────────────────────────────────────────────────
    const family = calculateCrossFamily(profileValue);
    const cross = {
      name: typeof hd.incarnationCross === 'string' ? hd.incarnationCross : '',
      family: family.label,
      keynote: family.meaning.keynote,
      passage: family.meaning.passage,
      gates: getCrossGates(activeGates).map((c) => ({
        role: c.role,
        blurb: c.blurb,
        gate: c.gate,
        ichingName: GATE_KEYNOTES[c.gate]?.ichingName ?? '',
        coreMeaning: GATE_KEYNOTES[c.gate]?.coreMeaning ?? '',
      })),
    };

    // ── Godhead (from the Personality Sun gate) ─────────────────────────────
    const personalitySun = activeGates.find((g) => g.planet === 'sun' && g.epoch === 'personality');
    const gh = personalitySun ? findGodheadByGate(personalitySun.gate) : undefined;
    const godhead = gh
      ? {
          mechanism: GODHEAD_MECHANISM,
          name: gh.name,
          quarter: gh.quarter,
          quarterTheme: gh.quarterTheme,
          archetype: gh.archetype,
          keynote: gh.keynote,
          light: gh.light,
          shadow: gh.shadow,
          gates: [...gh.gates],
        }
      : null;

    // ── Variables ───────────────────────────────────────────────────────────
    const vars = calculateVariables(activeGates);
    const varKeys = ['digestion', 'environment', 'perspective', 'motivation'] as const;
    const varTitles = { digestion: 'Digestion', environment: 'Environment', perspective: 'Perspective', motivation: 'Motivation' };
    const variableItems = varKeys.flatMap((k) => {
      const r = vars[k];
      return r
        ? [{
            key: k,
            title: varTitles[k],
            arrow: r.arrow,
            name: VARIABLE_ARROW_LABEL[k][r.arrow],
            meaning: VARIABLE_ARROW_MEANING[k][r.arrow],
          }]
        : [];
    });
    const variables = variableItems.length ? { mechanism: VARIABLES_MECHANISM, items: variableItems } : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          locked,
          typeName,
          authorityName,
          profileValue,
          type,
          authority,
          profile,
          definition,
          centers,
          circuits,
          gates,
          cross,
          godhead,
          variables,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error: unknown) {
    console.error('[T3D Vehicle Error]', error);
    return NextResponse.json(
      { success: false, error: 'Could not load your Human Design. Please try again.' },
      { status: 500 },
    );
  }
}
