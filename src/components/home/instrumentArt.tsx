/**
 * The instrument's two drawings.
 *
 * Bodygraph: the nine energy centers, carried over from the old scroll story, with one
 * center able to light brighter than the rest because today's Sun gate belongs to it.
 * SkyDial: a zodiac ring with the Sun and Moon placed at real ecliptic longitudes.
 *
 * Both are plain SVG with no state of their own, so they render on the server, read the
 * same with Reduce Motion on, and stay sharp at any size. Only opacity, transform and SVG
 * paint are animated; nothing that moves layout.
 */

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The nine centers, drawn as the standard shapes. */
export const CENTERS: readonly { name: string; shape: string }[] = [
  { name: 'Root',          shape: 'M130 380 H170 V425 H130 Z' },
  { name: 'Sacral',        shape: 'M130 300 H170 V345 H130 Z' },
  { name: 'Spleen',        shape: 'M62 252 L108 284 L62 316 Z' },
  { name: 'Solar Plexus',  shape: 'M238 252 L192 284 L238 316 Z' },
  { name: 'Heart',         shape: 'M192 214 L222 232 L192 250 Z' },
  { name: 'G Center',      shape: 'M150 195 L180 225 L150 255 L120 225 Z' },
  { name: 'Throat',        shape: 'M130 130 H170 V172 H130 Z' },
  { name: 'Ajna',          shape: 'M125 76 H175 L150 112 Z' },
  { name: 'Head',          shape: 'M150 18 L176 62 H124 Z' },
];

const CHANNELS: readonly string[] = [
  'M150 62 V76', 'M150 112 V130', 'M150 172 V195', 'M150 255 V300',
  'M150 345 V380', 'M108 284 L130 316', 'M192 284 L170 316', 'M180 225 L192 232',
];

/** The engine names centers as "G"; the drawing calls that shape "G Center". */
const matchesCenter = (shapeName: string, center: string): boolean =>
  shapeName === center || (center === 'G' && shapeName === 'G Center');

export function Bodygraph({ highlight, title }: { highlight?: string; title: string }) {
  return (
    <svg viewBox="0 0 300 445" role="img" aria-label={title} className="inst-art">
      <g stroke="var(--amber)" strokeWidth="2" fill="none" strokeLinecap="round" opacity={0.4}>
        {CHANNELS.map((d) => <path key={d} d={d} />)}
      </g>
      {CENTERS.map((c) => {
        const lit = highlight ? matchesCenter(c.name, highlight) : false;
        return (
          <path
            key={c.name}
            d={c.shape}
            fill="var(--amber)"
            fillOpacity={lit ? 0.9 : 0.14}
            stroke="var(--amber)"
            strokeWidth={lit ? 2.5 : 1.5}
            strokeOpacity={lit ? 1 : 0.5}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

const SIGN_GLYPHS = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi'];

const DIAL = { cx: 150, cy: 150, r: 112 };

/** Longitude 0 (0 Aries) sits at the left, and degrees run counter-clockwise, as a chart wheel does. */
export function dialPoint(longitude: number, radius: number): { x: number; y: number } {
  const a = ((180 - longitude) * Math.PI) / 180;
  // Rounded, because full-precision trig can differ in the last digit between the
  // server and the browser, and React calls that a hydration mismatch.
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    x: r2(DIAL.cx + radius * Math.cos(a)),
    y: r2(DIAL.cy - radius * Math.sin(a)),
  };
}

export function SkyDial({ sun, moon, lit, title }: { sun: number; moon: number; lit: number; title: string }) {
  const sunAt = dialPoint(sun, DIAL.r - 18);
  const moonAt = dialPoint(moon, DIAL.r - 44);
  const litWidth = 3 + 11 * clamp01(lit);
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={title} className="inst-art">
      <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r} fill="none" stroke="var(--grid-line)" strokeWidth="1" />
      <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.r - 28} fill="none" stroke="var(--grid-line)" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => {
        const outer = dialPoint(i * 30, DIAL.r);
        const inner = dialPoint(i * 30, DIAL.r - 28);
        const label = dialPoint(i * 30 + 15, DIAL.r - 14);
        return (
          <g key={i}>
            <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="var(--grid-line)" strokeWidth="1" />
            <text
              x={label.x} y={label.y} fill="var(--parchment-40)" fontSize="9"
              textAnchor="middle" dominantBaseline="middle" fontFamily="'DM Sans', sans-serif"
            >
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        );
      })}

      {/* The line between them is the elongation the phase is read from. */}
      <line x1={sunAt.x} y1={sunAt.y} x2={moonAt.x} y2={moonAt.y} stroke="var(--parchment-15)" strokeWidth="1" />

      <g className="inst-dial__sun" style={{ ['--x' as string]: `${sunAt.x}px`, ['--y' as string]: `${sunAt.y}px` }}>
        <circle cx={sunAt.x} cy={sunAt.y} r="9" fill="var(--amber)" />
      </g>

      <g className="inst-dial__moon">
        <circle cx={moonAt.x} cy={moonAt.y} r="11" fill="var(--base)" stroke="var(--signal-red)" strokeWidth="1.5" />
        {/* The lit limb widens with the real illuminated fraction. */}
        <ellipse cx={moonAt.x} cy={moonAt.y} rx={litWidth / 2} ry="9.5" fill="var(--signal-red)" fillOpacity="0.9" />
      </g>
    </svg>
  );
}
