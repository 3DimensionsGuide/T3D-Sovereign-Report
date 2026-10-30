'use client';

/**
 * The Instrument: the homepage's live surface.
 *
 * Grammar: live surface (scroll-craft). The page does not describe the product here, it
 * runs it. Every figure on this surface is computed by our own engines from the real
 * current date, which is why it can be reading something before anybody types anything.
 * The close is a real field: give it a birth date and the surface stops reading the day
 * and starts reading the person, through the same preview endpoint the app uses.
 *
 * The bespoke move lives in this file, not in the engine: scroll position inside the Sky
 * act is mapped to the hours of today, so the Moon walks its real path for the day while
 * the stage holds still. The engine is only asked for the act, the pin and the cues.
 *
 * Reduce Motion: the clock parks on the current hour and nothing moves. Every panel still
 * shows its full reading, so nothing is lost by turning motion off.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { TodayReading } from '@/server/instrument/todayReading';
import type { BirthPreview } from '@/lib/app/preview';
import { Bodygraph, SkyDial } from './instrumentArt';

const PANELS = [
  { id: 'vehicle', name: 'Vehicle', system: 'Human Design', glyph: '◆' },
  { id: 'road', name: 'Road', system: 'Numerology', glyph: '▲' },
  { id: 'stoplight', name: 'Stoplight', system: 'Astrology', glyph: '●' },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="inst-row">
      <span className="inst-row__k">{label}</span>
      <span className="inst-row__v">{value}</span>
    </div>
  );
}

export default function Instrument({ reading }: { reading: TodayReading | null }) {
  const rootRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLElement>(null);

  // ── The engine. Mounted once, torn down on unmount so a client-side route change
  //    cannot leave a second loop running. ───────────────────────────────────────
  useEffect(() => {
    let instance: { destroy(): void } | null = null;
    let cancelled = false;
    import('@/vendor/scrollcraft/scrollcraft.js')
      .then(() => {
        if (cancelled || !rootRef.current || !window.ScrollCraft) return;
        instance = window.ScrollCraft.mount(rootRef.current);
      })
      .catch(() => {
        // The surface is readable without the engine: every panel is real markup
        // that has already rendered. Motion is the only thing lost.
      });
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, []);

  // ── The surface's own chrome is sticky, so the pinned stages have to start below
  //    it as well as below the site bar. Measured rather than guessed, because the
  //    strip is one line on a desktop and can wrap on a narrow phone. ─────────────
  useEffect(() => {
    const root = rootRef.current;
    const chrome = root?.querySelector('.inst-chrome');
    if (!root || !(chrome instanceof HTMLElement)) return;
    const apply = () => {
      root.style.setProperty('--inst-chrome-h', `${Math.round(chrome.getBoundingClientRect().height)}px`);
      window.ScrollCraft?.instances.forEach((i) => i.layout());
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(chrome);
    return () => ro.disconnect();
  }, []);

  // ── The signature move: page position drives the clock. ───────────────────────
  const [hour, setHour] = useState<number>(reading?.nowHour ?? 12);
  useEffect(() => {
    const act = skyRef.current;
    if (!act || !reading) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let visible = false;
    let last = -1;
    const read = () => {
      frame = 0;
      if (!visible) return;
      const p = parseFloat(getComputedStyle(act).getPropertyValue('--sc-p')) || 0;
      const h = Math.max(0, Math.min(23, Math.round(p * 23)));
      if (h !== last) {
        last = h;
        setHour(h);
      }
      frame = requestAnimationFrame(read);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !frame) frame = requestAnimationFrame(read);
    });
    io.observe(act);
    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reading]);

  // ── The close: a real field, answered by the real preview endpoint. ───────────
  const [birthDate, setBirthDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<BirthPreview | null>(null);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/app/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate }),
      });
      const json = (await res.json()) as { success: boolean; data?: BirthPreview; error?: string };
      if (!res.ok || !json.success || !json.data) {
        setError(json.error ?? 'That did not read. Please check the date.');
      } else {
        setMine(json.data);
        window.ScrollCraft?.instances.forEach((i) => i.layout());
      }
    } catch {
      setError('The reading did not come back. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [birthDate, busy]);

  const sample = reading?.sky.hours[Math.min(hour, 23)] ?? null;
  const signReading = reading?.sky.signReadings.find((s) => s.sign === sample?.moonSign)?.reading ?? null;

  return (
    <section
      id="framework"
      ref={rootRef}
      className="inst"
      aria-labelledby="inst-heading"
    >
      <h2 id="inst-heading" className="inst-sr">The T3D instrument, reading today</h2>

      {/* ── App chrome. This is the navigation for the surface. ─────────────── */}
      <div className="inst-chrome">
        <p className="inst-chrome__state">
          <span className={`inst-dot${reading ? ' is-live' : ''}`} aria-hidden />
          {reading ? 'Live' : 'Offline'}
        </p>
        <nav className="inst-chrome__nav" aria-label="Instrument panels">
          {PANELS.map((p) => (
            <a key={p.id} href={`#inst-${p.id}`} className="inst-tab">
              <span aria-hidden>{p.glyph}</span> {p.name}
            </a>
          ))}
        </nav>
        <p className="inst-chrome__clock">
          {reading ? `${reading.date} UTC` : 'No ephemeris'}
        </p>
      </div>

      <div id="system" className="inst-surface">

        {/* ── Act 1: boot ─────────────────────────────────────────────────── */}
        <section className="inst-act inst-act--boot" data-sc-act="flow" aria-label="Status">
          <div className="inst-grid" data-sc-in data-sc-stagger="90">
            <Row label="Input" value={mine ? 'Birth date' : 'None'} />
            <Row label="Reading" value={mine ? 'You' : 'Today'} />
            <Row label="Source" value="Swiss Ephemeris" />
            <Row label="Date" value={reading ? `${reading.date}, UTC` : 'Unavailable'} />
          </div>
          <p className="inst-lede" data-sc-in>
            There are no birth details in it yet, so it is reading the day instead.
            Every figure below is calculated when this page loads, by the same engines that
            write the reports.
          </p>
        </section>

        {/* ── Act 2: Vehicle ──────────────────────────────────────────────── */}
        <section
          id="inst-vehicle"
          className="inst-act inst-act--pin"
          data-sc-act="pin"
          data-sc-span="1.4"
          aria-label="Vehicle panel"
        >
          <div className="inst-stage" data-sc-stage>
            <div className="inst-panel inst-panel--vehicle">
              <p className="inst-panel__tag">Vehicle <span aria-hidden>{'◆'}</span> Human Design</p>
              {reading ? (
                <div className="inst-panel__body">
                  <div className="inst-panel__lead">
                    <div className="inst-readout">
                      <p className="inst-figure">{mine?.vehicle?.gate ?? reading.vehicle.gate}</p>
                      <p className="inst-figure__k">
                        {mine?.vehicle ? 'Your Sun gate' : 'Sun gate today'}
                      </p>
                    </div>
                    <div className="inst-panel__text">
                      <p className="inst-name">{mine?.vehicle?.name ?? reading.vehicle.name}</p>
                      <p className="inst-body">{mine?.vehicle?.meaning ?? reading.vehicle.meaning}</p>
                      <Row label="Center" value={mine?.vehicle?.center ?? reading.vehicle.center} />
                      {!mine && <Row label="Line" value={String(reading.vehicle.line)} />}
                      <p className="inst-note" data-sc-cue="0.3">
                        {mine?.vehicle
                          ? 'Read from your birth date. Your Type, Strategy and Authority need the time as well.'
                          : 'The Sun sits in this gate today, for everybody. Yours is fixed by the moment you were born.'}
                      </p>
                    </div>
                  </div>
                  <div className="inst-panel__art">
                    <Bodygraph
                      highlight={mine?.vehicle?.center ?? reading.vehicle.center}
                      title={`The nine energy centers, with the ${mine?.vehicle?.center ?? reading.vehicle.center} center lit, because today's gate belongs to it`}
                    />
                  </div>
                </div>
              ) : (
                <p className="inst-body">This panel needs the ephemeris, which is not answering right now.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Act 3: Road. The quietest act, and the silence before the peak. ── */}
        <section
          id="inst-road"
          className="inst-act inst-act--road"
          data-sc-act="flow"
          aria-label="Road panel"
        >
          <div className="inst-panel inst-panel--road" data-sc-reveal="left" data-sc-cue="0.1">
            <p className="inst-panel__tag">Road <span aria-hidden>{'▲'}</span> Numerology</p>
            {reading ? (
              <div className="inst-road">
                <p className="inst-plate">{mine?.lifePath.number ?? reading.road.number}</p>
                <div className="inst-panel__text">
                  <p className="inst-name">
                    {mine ? `Life Path ${mine.lifePath.number}: ${mine.lifePath.name}` : `Universal Day ${reading.road.number}: ${reading.road.label}`}
                  </p>
                  <p className="inst-body">{mine?.lifePath.plain ?? reading.road.theme}</p>
                  <Row label={mine ? 'Direction' : 'Lean in'} value={mine?.lifePath.direction ?? reading.road.leanIn} />
                  {!mine && <Row label="Watch for" value={reading.road.watchFor} />}
                  <p className="inst-note">
                    {mine
                      ? 'Your Life Path comes from your birth date alone, so this one is exact.'
                      : 'Every person alive is on this number today. Your own day number counts your birth date into it.'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="inst-body">This panel needs the date engine, which is not answering right now.</p>
            )}
          </div>
        </section>

        {/* ── Act 4: Sky. The peak, and the longest act on the page. ────────── */}
        <section
          id="inst-stoplight"
          ref={skyRef}
          className="inst-act inst-act--pin inst-act--sky"
          data-sc-act="pin"
          data-sc-span="2.6"
          data-sc-drift="#0A0A0C"
          aria-label="Stoplight panel"
        >
          <div className="inst-stage" data-sc-stage>
            <div className="inst-panel inst-panel--sky">
              <p className="inst-panel__tag">Stoplight <span aria-hidden>{'●'}</span> Astrology</p>
              {reading && sample ? (
                <div className="inst-sky">
                  <div className="inst-sky__dial" data-sc-tilt="5">
                    <SkyDial
                      sun={sample.sun}
                      moon={sample.moon}
                      lit={sample.lit}
                      title={`A chart wheel with the Sun in ${reading.sky.sunSign} and the Moon in ${sample.moonSign}, as they stand at ${pad(sample.hour)}:00 UTC today`}
                    />
                  </div>
                  <div className="inst-sky__read">
                    <p className="inst-clock" aria-hidden>{pad(sample.hour)}:00</p>
                    <div className="inst-sky__rows" aria-live="polite" aria-atomic="true">
                      <p className="inst-sr">
                        At {pad(sample.hour)} hundred hours UTC, the Moon is in {sample.moonSign},
                        {' '}{sample.phase.toLowerCase()}, {Math.round(sample.lit * 100)} percent lit.
                      </p>
                      <Row label="Moon" value={`${sample.moonSign} ${Math.floor(sample.moon % 30)}°`} />
                      <Row label="Phase" value={`${sample.phase}, ${Math.round(sample.lit * 100)}% lit`} />
                      <Row label="Sun" value={`${reading.sky.sunSign} ${Math.floor(sample.sun % 30)}°`} />
                      <Row label="Elongation" value={`${Math.round(sample.elongation)}°`} />
                      <Row label="Clock" value="Driven by page position" />
                    </div>
                    {signReading && (
                      <p className="inst-body inst-sky__note">{signReading.theme}</p>
                    )}
                    <p className="inst-note">
                      These are real positions for today, worked out when the page loaded. The Moon
                      moves about thirteen degrees in a day, which is the whole width of this panel.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="inst-body">The sky panel needs the ephemeris, which is not answering right now.</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Act 5: the gap, and the real input that closes it. ────────────── */}
        <section className="inst-act inst-act--close" data-sc-act="flow" aria-label="Your reading">
          <div className="inst-close" data-sc-in data-sc-stagger="70">
            <p className="inst-close__line">
              {mine
                ? 'Now it is reading you.'
                : 'Three readings, all of them today’s. None of them yours.'}
            </p>

            <form className="inst-form" onSubmit={submit}>
              <label className="inst-form__label" htmlFor="inst-birth">
                {mine ? 'Read a different date' : 'Birth date'}
              </label>
              <div className="inst-form__row">
                <input
                  id="inst-birth"
                  className="inst-input"
                  type="date"
                  value={birthDate}
                  min="1900-01-01"
                  max={reading?.date ?? undefined}
                  onChange={(e) => { setBirthDate(e.target.value); setError(null); }}
                  aria-describedby="inst-form-help"
                />
                <button type="submit" className="inst-submit" disabled={!birthDate || busy}>
                  {busy ? 'Reading' : 'Read this instead'}
                </button>
              </div>
              <p id="inst-form-help" className="inst-note">
                The date is sent once to work the reading out, and nothing about it is saved.
              </p>
              <p className="inst-error" role="alert">{error ?? ''}</p>
            </form>

            {mine && (
              <div className="inst-locked">
                <p className="inst-name">What the date alone cannot give you</p>
                <ul className="inst-locked__list">
                  {mine.locked.map((l) => <li key={l}>{l}</li>)}
                </ul>
              </div>
            )}

            <p className="inst-close__hand">
              The full calculation needs your birth time and place as well.
            </p>
            <Link href="/#calculator" className="t3d-cta inst-cta">
              CALCULATE MY PROFILE
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
