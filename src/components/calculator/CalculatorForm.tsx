'use client';

/**
 * T3D Sovereign Calculator — 3-Step Progressive Intake Form
 *
 * Step 1 — Personal:   First Name, Middle Name (optional), Last Name
 * Step 2 — Birth Data: Date (Month/Day/Year dropdowns), Time (12hr + AM/PM toggle),
 *                      City (Google Places autocomplete → auto-fills Country)
 * Step 3 — Submit:     Email, opt-in consent, loading animation
 *
 * ─ Design system ────────────────────────────────────────────────────────────
 *   60% Charcoal Slate  #121214   Foundation
 *   30% Deep Purple     #2E1A47   Structure / cards / borders
 *   10% Metallic Gold   #D4AF37   Active CTA only
 *   Triad accent: Amber #E5A93C · Emerald #1F8A4D · Crimson #C83E3E
 *
 * ─ Setup ────────────────────────────────────────────────────────────────────
 *   Add to .env.local:
 *     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
 *   Enable "Places API" in your Google Cloud Console for that key.
 *
 * ─ Accessibility ────────────────────────────────────────────────────────────
 *   WCAG 2.2 AAA contrast · 48px min touch targets · keyboard navigable
 *   aria-invalid, aria-describedby, role=alert on all errors
 *   Color never sole indicator of state — always paired with icon or text
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useT3DStore } from '@/store/useT3DStore';
import ResultsDashboard from './ResultsDashboard';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormState {
  firstName:   string;
  middleName:  string;
  lastName:    string;
  birthMonth:  string; // '01'–'12'
  birthDay:    string; // '01'–'31'
  birthYear:   string; // '1920'–current
  birthHour:   string; // '1'–'12'
  birthMinute: string; // '00'–'59'
  birthPeriod: 'AM' | 'PM';
  city:        string;
  state:       string;
  country:     string;
  email:       string;
  emailOptIn:  boolean;
}

type FKey   = keyof FormState;
type Errors  = Partial<Record<FKey, string>>;
type Touched = Partial<Record<FKey, boolean>>;

declare global {
  interface Window {
    google: typeof google;
    initT3DAutocomplete?: () => void;
  }
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const HOURS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const YEAR_NOW = new Date().getFullYear();
const YEARS = Array.from({ length: YEAR_NOW - 1919 }, (_, i) => String(YEAR_NOW - i));

function daysInMonth(month: string, year: string): number {
  if (!month || !year) return 31;
  return new Date(parseInt(year), parseInt(month), 0).getDate();
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateField(field: FKey, state: FormState): string {
  const v = (state[field] as string | boolean);
  switch (field) {
    case 'firstName':
      return typeof v === 'string' && v.trim().length > 0 ? '' : 'First name is required';
    case 'lastName':
      return typeof v === 'string' && v.trim().length > 0 ? '' : 'Last name is required';
    case 'birthMonth':
      return typeof v === 'string' && v !== '' ? '' : 'Select a birth month';
    case 'birthDay':
      return typeof v === 'string' && v !== '' ? '' : 'Select a birth day';
    case 'birthYear':
      return typeof v === 'string' && v !== '' ? '' : 'Select a birth year';
    case 'city':
      return typeof v === 'string' && v.trim().length > 0 ? '' : 'Birth city is required';
    case 'country':
      return typeof v === 'string' && v.trim().length > 0 ? '' : 'Country is required';
    case 'email': {
      const s = typeof v === 'string' ? v : '';
      if (!s.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'Enter a valid email address';
      return '';
    }
    case 'emailOptIn':
      return v === true ? '' : 'Please agree to receive your results';
    default:
      return '';
  }
}

const STEP_FIELDS: Record<number, FKey[]> = {
  1: ['firstName', 'lastName'],
  2: ['birthMonth', 'birthDay', 'birthYear', 'city', 'country'],
  3: ['email', 'emailOptIn'],
};

function validateStep(step: number, state: FormState): Errors {
  const errors: Errors = {};
  for (const field of STEP_FIELDS[step] ?? []) {
    const msg = validateField(field, state);
    if (msg) errors[field] = msg;
  }
  return errors;
}

// ─── DATE → YYYY-MM-DD ────────────────────────────────────────────────────────
function buildBirthDate(month: string, day: string, year: string): string {
  if (!month || !day || !year) return '';
  return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
}

// ─── TIME → HH:MM (24h) ──────────────────────────────────────────────────────
function buildBirthTime(hour: string, minute: string, period: 'AM' | 'PM'): string {
  if (!hour || !minute) return '';
  let h = parseInt(hour, 10);
  if (period === 'AM' && h === 12) h = 0;
  if (period === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2,'0')}:${minute}`;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────
const INIT: FormState = {
  firstName: '', middleName: '', lastName: '',
  birthMonth: '', birthDay: '', birthYear: '',
  birthHour: '', birthMinute: '00', birthPeriod: 'AM',
  city: '', state: '', country: '',
  email: '', emailOptIn: false,
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const BASE_INPUT: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: 'var(--panel)', color: 'var(--ink)',
  border: '1.5px solid var(--purple-line)', borderRadius: 10,
  fontSize: '0.96rem', fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s var(--ease), box-shadow 0.2s var(--ease)',
  minHeight: 48,
  WebkitAppearance: 'none', appearance: 'none',
};

const SELECT_INPUT: React.CSSProperties = {
  ...BASE_INPUT,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238C877E' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 40,
  cursor: 'pointer',
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

/** Animated progress bar */
function ProgressBar({ step }: { step: number }) {
  const steps = [
    { n: 1, label: 'Your Name'   },
    { n: 2, label: 'Birth Data'  },
    { n: 3, label: 'Get Results' },
  ];
  return (
    <nav aria-label="Form progress" style={{ marginBottom: 36 }}>
      <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => {
          const done    = step > s.n;
          const current = step === s.n;
          return (
            <li key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* Circle */}
                <div
                  aria-current={current ? 'step' : undefined}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                    background: done ? 'var(--gold)' : current ? 'transparent' : 'transparent',
                    color: done ? 'var(--obsidian)' : current ? 'var(--gold)' : 'var(--ink-faint)',
                    border: done ? '2px solid var(--gold)' : current ? '2px solid var(--gold)' : '2px solid var(--purple-line)',
                    boxShadow: current ? '0 0 12px rgba(212,175,55,0.35)' : 'none',
                    transition: 'all 0.3s var(--ease)',
                  }}
                >
                  {done ? (
                    <svg viewBox="0 0 14 14" fill="none" width={12} height={12} aria-hidden>
                      <path d="M2 7l3.5 3.5L12 3" stroke="var(--obsidian)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : s.n}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: '0.72rem', fontWeight: current ? 700 : 500,
                  color: current ? 'var(--ink)' : done ? 'var(--gold)' : 'var(--ink-faint)',
                  whiteSpace: 'nowrap', transition: 'color 0.3s var(--ease)',
                }}>
                  {s.label}
                </span>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '-18px 10px 0',
                  background: done ? 'var(--gold)' : 'var(--purple-line)',
                  transition: 'background 0.4s var(--ease)',
                  borderRadius: 1,
                }} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Single form field with label, input, and inline error */
function Field({
  id, label, optional, error, touched, hint,
  children,
}: {
  id: string; label: string; optional?: boolean;
  error?: string; touched?: boolean; hint?: string;
  children: React.ReactNode;
}) {
  const showError = touched && error;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={id} style={{
        fontSize: '0.82rem', fontWeight: 600,
        color: 'var(--ink-dim)', letterSpacing: '0.02em',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {label}
        {optional && (
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', fontWeight: 400 }}>
            optional
          </span>
        )}
      </label>
      {children}
      {hint && !showError && (
        <p style={{ fontSize: '0.76rem', color: 'var(--ink-faint)', margin: 0 }}>
          {hint}
        </p>
      )}
      {showError && (
        <p id={`${id}-error`} role="alert" style={{
          fontSize: '0.78rem', color: 'var(--crimson-text)',
          display: 'flex', alignItems: 'center', gap: 5, margin: 0,
        }}>
          <svg viewBox="0 0 14 14" fill="none" width={12} height={12} aria-hidden>
            <circle cx="7" cy="7" r="6" stroke="var(--crimson)" strokeWidth="1.5"/>
            <line x1="7" y1="4" x2="7" y2="7.5" stroke="var(--crimson)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="10" r="0.8" fill="var(--crimson)"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/** Text input with live border colour based on state */
function TextInput({
  id, name, type = 'text', placeholder, value, error, touched,
  onChange, onBlur,
  inputRef,
}: {
  id: string; name: string; type?: string; placeholder?: string;
  value: string; error?: string; touched?: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = touched && error;
  const isValid  = touched && !error && value.trim().length > 0;

  const borderColor = hasError ? 'var(--crimson)' :
    isValid ? 'var(--emerald)' :
    focused ? 'var(--gold)' : 'var(--purple-line)';

  const shadow = hasError ? '0 0 0 3px rgba(200,62,62,0.15)' :
    isValid ? '0 0 0 3px rgba(31,138,77,0.12)' :
    focused ? '0 0 0 3px rgba(212,175,55,0.12)' : 'none';

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      id={id} name={name} type={type}
      placeholder={placeholder}
      value={value}
      autoComplete={type === 'email' ? 'email' : 'off'}
      aria-invalid={!!hasError}
      aria-describedby={hasError ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlur(); }}
      style={{ ...BASE_INPUT, borderColor, boxShadow: shadow }}
    />
  );
}

/** Select dropdown */
function SelectInput({
  id, name, value, error, touched, placeholder,
  options, onChange, onBlur,
}: {
  id: string; name: string; value: string;
  error?: string; touched?: boolean; placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  onBlur: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = touched && error;
  const isValid  = touched && !error && value !== '';
  const borderColor = hasError ? 'var(--crimson)' : isValid ? 'var(--emerald)' : focused ? 'var(--gold)' : 'var(--purple-line)';
  const shadow = hasError ? '0 0 0 3px rgba(200,62,62,0.15)' : isValid ? '0 0 0 3px rgba(31,138,77,0.12)' : focused ? '0 0 0 3px rgba(212,175,55,0.12)' : 'none';

  return (
    <select
      id={id} name={name} value={value}
      aria-invalid={!!hasError}
      aria-describedby={hasError ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlur(); }}
      style={{ ...SELECT_INPUT, borderColor, boxShadow: shadow, color: value ? 'var(--ink)' : 'var(--ink-faint)' }}
    >
      <option value="" disabled style={{ color: 'var(--ink-faint)', background: 'var(--panel)' }}>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ background: 'var(--panel)', color: 'var(--ink)' }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Loading animation — orbiting compass */
function LoadingScreen() {
  const phrases = [
    { color: 'var(--amber-text)',   text: 'Mapping your Human Design bodygraph…'     },
    { color: 'var(--emerald-text)', text: 'Calculating your Pythagorean numbers…'    },
    { color: 'var(--crimson-text)', text: 'Reading your planetary coordinates…'      },
  ];
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPhase((p) => (p + 1) % phrases.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'clamp(48px,8vh,72px) 0',
      textAlign: 'center', gap: 28,
    }}>
      {/* Animated compass */}
      <svg viewBox="0 0 200 200" width={140} height={140} aria-hidden>
        {/* Outer dashed ring — spins */}
        <g style={{ transformOrigin: '100px 100px', animation: 'spin 48s linear infinite' }}>
          <circle cx="100" cy="100" r="90" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="3 8" fill="none" />
        </g>
        {/* Mid ring */}
        <circle cx="100" cy="100" r="72" stroke="rgba(46,26,71,0.8)" strokeWidth="1.5" fill="none" />
        {/* Inner ring — reverse spin */}
        <g style={{ transformOrigin: '100px 100px', animation: 'spin 32s linear infinite reverse' }}>
          <circle cx="100" cy="100" r="56" stroke="rgba(212,175,55,0.18)" strokeWidth="1" strokeDasharray="1 7" fill="none" />
        </g>
        {/* Cardinal ticks */}
        <g stroke="rgba(241,237,232,0.35)" strokeWidth="1.5">
          <line x1="100" y1="12" x2="100" y2="26"/>
          <line x1="100" y1="174" x2="100" y2="188"/>
          <line x1="12" y1="100" x2="26" y2="100"/>
          <line x1="174" y1="100" x2="188" y2="100"/>
        </g>
        {/* Needle — pulsing */}
        <g style={{ transformOrigin: '100px 100px', animation: 'pulse 2s ease-in-out infinite' }}>
          <polygon points="100,38 110,100 100,88 90,100" fill="var(--gold)" />
          <polygon points="100,162 110,100 100,112 90,100" fill="rgba(212,175,55,0.35)" />
        </g>
        {/* Three orbiting dimension nodes */}
        <g style={{ transformOrigin: '100px 100px', animation: 'spin 18s linear infinite' }}>
          <circle cx="100" cy="16" r="5" fill="var(--amber)" style={{ filter: 'drop-shadow(0 0 6px #E5A93C)' }} />
          <circle cx="24"  cy="142" r="5" fill="var(--emerald)" style={{ filter: 'drop-shadow(0 0 6px #1F8A4D)' }} />
          <circle cx="176" cy="142" r="5" fill="var(--crimson)" style={{ filter: 'drop-shadow(0 0 6px #C83E3E)' }} />
        </g>
        {/* Hub */}
        <circle cx="100" cy="100" r="6" fill="var(--obsidian)" stroke="var(--gold)" strokeWidth="1.5" />
      </svg>

      {/* Cycling phase label */}
      <div style={{ minHeight: 44 }}>
        <p style={{
          fontFamily: 'var(--font-display, serif)', fontSize: '1.3rem', fontWeight: 500,
          color: 'var(--ink)', marginBottom: 8, lineHeight: 1.2,
        }}>
          Reading your coordinates
        </p>
        <p style={{
          fontSize: '0.88rem', color: phrases[phase].color,
          transition: 'color 0.5s var(--ease)',
          minHeight: '1.4em',
        }}>
          {phrases[phase].text}
        </p>
      </div>

      {/* Dot progress indicator */}
      <div style={{ display: 'flex', gap: 6 }}>
        {phrases.map((_, i) => (
          <div key={i} style={{
            width: i === phase ? 20 : 6, height: 6, borderRadius: 3,
            background: i === phase ? 'var(--gold)' : 'var(--purple-line)',
            transition: 'width 0.3s var(--ease), background 0.3s var(--ease)',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CalculatorForm() {
  const { results, isCalculating, calculationError,
          currentStep, setCurrentStep, setIsCalculating, setError, setResults } = useT3DStore();

  const [data,    setData]    = useState<FormState>(INIT);
  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [dir,     setDir]     = useState<'forward' | 'back'>('forward');
  const [animKey, setAnimKey] = useState(0);

  const cityRef    = useRef<HTMLInputElement>(null);
  const placesInit = useRef(false);

  // ── Real-time validation helper ────────────────────────────────────────────
  const validate = useCallback((field: FKey, state: FormState) => {
    const msg = validateField(field, state);
    setErrors((e) => ({ ...e, [field]: msg || undefined }));
  }, []);

  function set<K extends FKey>(field: K, value: FormState[K]) {
    setData((prev) => {
      const next = { ...prev, [field]: value };
      if (touched[field]) validate(field, next);
      return next;
    });
  }

  function touch(field: FKey) {
    setTouched((t) => ({ ...t, [field]: true }));
    validate(field, data);
  }

  // ── Google Places autocomplete ─────────────────────────────────────────────
  const initAutocomplete = useCallback(() => {
    if (placesInit.current || !cityRef.current || !window.google?.maps?.places) return;
    placesInit.current = true;

    const ac = new window.google.maps.places.Autocomplete(cityRef.current, {
      types: ['(cities)'],
      fields: ['address_components', 'name'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const city = place.name ?? '';
      const countryComp = place.address_components?.find(
        (c) => c.types.includes('country')
      );
      const country = countryComp?.long_name ?? '';
      setData((prev) => {
        const next = { ...prev, city, country };
        validate('city', next);
        validate('country', next);
        return next;
      });
      setTouched((t) => ({ ...t, city: true, country: true }));
    });
  }, [validate]);

  // Load Google Maps Places API
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return; // Graceful fallback — city input works as plain text

    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    // Check if script already loading
    if (document.querySelector('#t3d-gmaps')) return;

    window.initT3DAutocomplete = initAutocomplete;
    const script = document.createElement('script');
    script.id  = 't3d-gmaps';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initT3DAutocomplete`;
    script.async = true;
    document.head.appendChild(script);

    return () => {
      delete window.initT3DAutocomplete;
    };
  }, [initAutocomplete]);

  // Init autocomplete when step 2 becomes visible
  useEffect(() => {
    if (currentStep === 2) {
      setTimeout(initAutocomplete, 100);
    }
  }, [currentStep, initAutocomplete]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  function advance() {
    const stepErrors = validateStep(currentStep, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((e) => ({ ...e, ...stepErrors }));
      // Mark all step fields as touched to show all errors
      const newTouched: Touched = {};
      for (const f of STEP_FIELDS[currentStep] ?? []) newTouched[f] = true;
      setTouched((t) => ({ ...t, ...newTouched }));
      return;
    }
    setDir('forward');
    setAnimKey((k) => k + 1);
    setCurrentStep(currentStep + 1);
  }

  function goBack() {
    setDir('back');
    setAnimKey((k) => k + 1);
    setCurrentStep(currentStep - 1);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function submit() {
    const stepErrors = validateStep(3, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors((e) => ({ ...e, ...stepErrors }));
      setTouched((t) => ({ ...t, email: true, emailOptIn: true }));
      return;
    }

    setIsCalculating(true);
    setError(null);

    const birthTime = data.birthHour
      ? buildBirthTime(data.birthHour, data.birthMinute, data.birthPeriod)
      : undefined;

    try {
      const res = await fetch('/api/calculate-t3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:  data.firstName.trim(),
          middleName: data.middleName.trim() || undefined,
          lastName:   data.lastName.trim(),
          email:      data.email.toLowerCase().trim(),
          birthDate:  buildBirthDate(data.birthMonth, data.birthDay, data.birthYear),
          birthTime,
          birthPlace: { city: [data.city, data.state].filter(Boolean).join(', '), country: data.country.trim() },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Calculation failed. Please try again.');

      setResults({
        leadId:      json.leadId,
        astrology:   json.data.astrology,
        numerology:  json.data.numerology,
        humanDesign: json.data.humanDesign,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsCalculating(false);
    }
  }

  // ── Render guards ──────────────────────────────────────────────────────────
  if (results)       return <ResultsDashboard />;
  if (isCalculating) return <LoadingScreen />;

  // ── Shared button styles ───────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', minHeight: 52, padding: '14px 20px', borderRadius: 11,
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer', border: 'none',
    fontFamily: 'inherit', transition: 'transform 0.18s var(--ease), filter 0.18s var(--ease)',
  };

  // ── Days for the selected month/year ──────────────────────────────────────
  const maxDays  = daysInMonth(data.birthMonth, data.birthYear);
  const dayOpts  = Array.from({ length: maxDays }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    return { value: d, label: String(i + 1) };
  });

  // Animation direction class
  const animStyle: React.CSSProperties = {
    animation: `${dir === 'forward' ? 't3dSlideRight' : 't3dSlideLeft'} 0.32s cubic-bezier(.4,0,.2,1) both`,
  };

  return (
    <>
      {/* Step transition keyframes */}
      <style>{`
        @keyframes t3dSlideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes t3dSlideLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0);     }
        }
        select option { background: #161519 !important; }
        input[type="checkbox"] { accent-color: var(--gold); width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; margin-top: 2px; }
        @media (max-width: 480px) {
          .t3d-col2 { grid-template-columns: 1fr !important; }
          .t3d-col3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <ProgressBar step={currentStep} />

      <div key={animKey} style={animStyle}>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 1 — PERSONAL                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <section aria-labelledby="step1-title">
            <header style={{ marginBottom: 28 }}>
              <h2 id="step1-title" className="font-display" style={{
                fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 500,
                letterSpacing: '-0.01em', marginBottom: 6,
              }}>
                What&apos;s your full name?
              </h2>
              <p style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your birth name is used to calculate your Pythagorean numerology profile.
              </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* First + Last on one row */}
              <div className="t3d-col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field id="firstName" label="First name" error={errors.firstName} touched={touched.firstName}>
                  <TextInput
                    id="firstName" name="firstName" placeholder="Tyler"
                    value={data.firstName} error={errors.firstName} touched={touched.firstName}
                    onChange={(v) => set('firstName', v)}
                    onBlur={() => touch('firstName')}
                  />
                </Field>
                <Field id="lastName" label="Last name" error={errors.lastName} touched={touched.lastName}>
                  <TextInput
                    id="lastName" name="lastName" placeholder="James"
                    value={data.lastName} error={errors.lastName} touched={touched.lastName}
                    onChange={(v) => set('lastName', v)}
                    onBlur={() => touch('lastName')}
                  />
                </Field>
              </div>

              {/* Middle name — full width, optional */}
              <Field id="middleName" label="Middle name" optional>
                <TextInput
                  id="middleName" name="middleName" placeholder="Andre"
                  value={data.middleName} onChange={(v) => set('middleName', v)}
                  onBlur={() => {}}
                />
              </Field>

              {/* Note on middle name */}
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', marginTop: -8 }}>
                Include your middle name only if it appears on your birth certificate.
                It affects your numerology reading.
              </p>

              <button
                type="button"
                onClick={advance}
                style={{ ...btnBase, background: 'var(--gold)', color: 'var(--obsidian)', marginTop: 8 }}
                onMouseEnter={(e) => { (e.currentTarget).style.filter = 'brightness(1.08)'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.filter = ''; (e.currentTarget).style.transform = ''; }}
              >
                Continue to Birth Data →
              </button>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 2 — BIRTH DATA                                               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <section aria-labelledby="step2-title">
            <header style={{ marginBottom: 28 }}>
              <h2 id="step2-title" className="font-display" style={{
                fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 500,
                letterSpacing: '-0.01em', marginBottom: 6,
              }}>
                When and where were you born?
              </h2>
              <p style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Used to calculate your natal chart and Human Design bodygraph.
                Birth time and exact coordinates are resolved server-side.
              </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── Birth Date ─────────────────────────────────────────── */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-dim)',
                  letterSpacing: '0.02em', marginBottom: 8, display: 'block',
                }}>
                  Birth date
                </legend>
                <div className="t3d-col3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr', gap: 10 }}>
                  <Field id="birthMonth" label="" error={errors.birthMonth} touched={touched.birthMonth}>
                    <SelectInput
                      id="birthMonth" name="birthMonth"
                      placeholder="Month" value={data.birthMonth}
                      error={errors.birthMonth} touched={touched.birthMonth}
                      options={MONTHS.map((m, i) => ({ value: String(i + 1).padStart(2,'0'), label: m }))}
                      onChange={(v) => { set('birthMonth', v); touch('birthMonth'); }}
                      onBlur={() => touch('birthMonth')}
                    />
                  </Field>
                  <Field id="birthDay" label="" error={errors.birthDay} touched={touched.birthDay}>
                    <SelectInput
                      id="birthDay" name="birthDay"
                      placeholder="Day" value={data.birthDay}
                      error={errors.birthDay} touched={touched.birthDay}
                      options={dayOpts}
                      onChange={(v) => { set('birthDay', v); touch('birthDay'); }}
                      onBlur={() => touch('birthDay')}
                    />
                  </Field>
                  <Field id="birthYear" label="" error={errors.birthYear} touched={touched.birthYear}>
                    <SelectInput
                      id="birthYear" name="birthYear"
                      placeholder="Year" value={data.birthYear}
                      error={errors.birthYear} touched={touched.birthYear}
                      options={YEARS.map((y) => ({ value: y, label: y }))}
                      onChange={(v) => { set('birthYear', v); touch('birthYear'); }}
                      onBlur={() => touch('birthYear')}
                    />
                  </Field>
                </div>
                {/* Show combined date errors */}
                {(touched.birthMonth && errors.birthMonth) && (
                  <p role="alert" style={{ fontSize: '0.78rem', color: 'var(--crimson-text)', marginTop: 6 }}>
                    Please select your complete birth date
                  </p>
                )}
              </fieldset>

              {/* ── Birth Time ─────────────────────────────────────────── */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={{
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-dim)',
                  letterSpacing: '0.02em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  Birth time
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', fontWeight: 400 }}>
                    optional — defaults to 12:00 noon
                  </span>
                </legend>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Hour */}
                  <div style={{ flex: '0 0 90px' }}>
                    <SelectInput
                      id="birthHour" name="birthHour"
                      placeholder="Hour" value={data.birthHour}
                      options={HOURS.map((h) => ({ value: h, label: h }))}
                      onChange={(v) => set('birthHour', v)}
                      onBlur={() => {}}
                    />
                  </div>
                  {/* Minute */}
                  <div style={{ flex: '0 0 90px' }}>
                    <SelectInput
                      id="birthMinute" name="birthMinute"
                      placeholder="Min" value={data.birthMinute}
                      options={MINUTES.map((m) => ({ value: m, label: m }))}
                      onChange={(v) => set('birthMinute', v)}
                      onBlur={() => {}}
                    />
                  </div>
                  {/* AM / PM toggle */}
                  <div role="group" aria-label="AM or PM" style={{ display: 'flex', height: 48, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--purple-line)', flexShrink: 0 }}>
                    {(['AM','PM'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('birthPeriod', p)}
                        aria-pressed={data.birthPeriod === p}
                        style={{
                          width: 52, height: '100%', border: 'none', cursor: 'pointer',
                          fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700,
                          background: data.birthPeriod === p ? 'var(--gold)' : 'var(--panel)',
                          color: data.birthPeriod === p ? 'var(--obsidian)' : 'var(--ink-faint)',
                          transition: 'background 0.18s var(--ease), color 0.18s var(--ease)',
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* ── Birth City ─────────────────────────────────────────── */}
              <Field
                id="city" label="Birth city"
                error={errors.city} touched={touched.city}
                hint={!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                  ? 'Type your birth city name'
                  : 'Start typing and select from the dropdown'}
              >
                <TextInput
                  id="city" name="city"
                  placeholder="New York, London, Lagos…"
                  value={data.city} error={errors.city} touched={touched.city}
                  inputRef={cityRef}
                  onChange={(v) => set('city', v)}
                  onBlur={() => touch('city')}
                />
              </Field>

              {/* State / Province */}
              <Field
                id="state" label="State / Province"
                hint="Required for US cities — e.g. California"
              >
                <TextInput
                  id="state" name="state"
                  placeholder="California"
                  value={data.state} onChange={(v) => set('state', v)}
                  onBlur={() => {}}
                />
              </Field>

              {/* Country — auto-filled from Places, editable fallback */}
              <Field
                id="country" label="Country"
                error={errors.country} touched={touched.country}
                hint="Auto-filled when you select a city above"
              >
                <TextInput
                  id="country" name="country"
                  placeholder="United States"
                  value={data.country} error={errors.country} touched={touched.country}
                  onChange={(v) => set('country', v)}
                  onBlur={() => touch('country')}
                />
              </Field>

            </div>

            {/* Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 28 }}>
              <button
                type="button" onClick={goBack}
                style={{
                  ...btnBase,
                  background: 'transparent', color: 'var(--ink)',
                  border: '1.5px solid var(--purple-line)',
                }}
                onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'var(--purple-bright)'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--purple-line)'; }}
              >
                ← Back
              </button>
              <button
                type="button" onClick={advance}
                style={{ ...btnBase, background: 'var(--gold)', color: 'var(--obsidian)' }}
                onMouseEnter={(e) => { (e.currentTarget).style.filter = 'brightness(1.08)'; (e.currentTarget).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { (e.currentTarget).style.filter = ''; (e.currentTarget).style.transform = ''; }}
              >
                Continue to Results →
              </button>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* STEP 3 — EMAIL + SUBMIT                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <section aria-labelledby="step3-title">
            <header style={{ marginBottom: 28 }}>
              <h2 id="step3-title" className="font-display" style={{
                fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 500,
                letterSpacing: '-0.01em', marginBottom: 6,
              }}>
                Where should we send your profile?
              </h2>
              <p style={{ color: 'var(--ink-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your three-dimension profile is free. Enter your email and we&apos;ll
                calculate and deliver it instantly.
              </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Summary pill */}
              <div style={{
                background: 'rgba(46,26,71,0.35)', border: '1px solid var(--purple-line)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', flexWrap: 'wrap', gap: '6px 16px',
              }}>
                {[
                  [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' '),
                  `${MONTHS[parseInt(data.birthMonth) - 1] ?? ''} ${parseInt(data.birthDay)}, ${data.birthYear}`,
                  data.birthHour ? `${data.birthHour}:${data.birthMinute} ${data.birthPeriod}` : 'Time unknown',
                  `${data.city}, ${data.country}`,
                ].map((line, i) => (
                  <span key={i} style={{ fontSize: '0.8rem', color: 'var(--ink-dim)' }}>
                    <span style={{ color: 'var(--gold)', marginRight: 4 }}>✦</span>
                    {line}
                  </span>
                ))}
              </div>

              {/* Email */}
              <Field
                id="email" label="Email address"
                error={errors.email} touched={touched.email}
              >
                <TextInput
                  id="email" name="email" type="email"
                  placeholder="you@email.com"
                  value={data.email} error={errors.email} touched={touched.email}
                  onChange={(v) => set('email', v)}
                  onBlur={() => touch('email')}
                />
              </Field>

              {/* Consent */}
              <label style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                cursor: 'pointer', padding: '14px 16px',
                background: touched.emailOptIn && errors.emailOptIn
                  ? 'rgba(200,62,62,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${touched.emailOptIn && errors.emailOptIn ? 'rgba(200,62,62,0.4)' : 'var(--purple-line)'}`,
                borderRadius: 10, transition: 'border-color 0.2s var(--ease)',
              }}>
                <input
                  type="checkbox"
                  checked={data.emailOptIn}
                  onChange={(e) => {
                    set('emailOptIn', e.target.checked);
                    setTouched((t) => ({ ...t, emailOptIn: true }));
                  }}
                  aria-describedby="consent-error"
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--ink-dim)', lineHeight: 1.6 }}>
                  I agree to receive my T3D profile and occasional insights from T3D Studio.
                  No spam. Unsubscribe anytime.
                </span>
              </label>
              {touched.emailOptIn && errors.emailOptIn && (
                <p id="consent-error" role="alert" style={{ fontSize: '0.78rem', color: 'var(--crimson-text)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <svg viewBox="0 0 14 14" fill="none" width={12} height={12} aria-hidden>
                    <circle cx="7" cy="7" r="6" stroke="var(--crimson)" strokeWidth="1.5"/>
                    <line x1="7" y1="4" x2="7" y2="7.5" stroke="var(--crimson)" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="7" cy="10" r="0.8" fill="var(--crimson)"/>
                  </svg>
                  {errors.emailOptIn}
                </p>
              )}

              {/* API error */}
              {calculationError && (
                <div role="alert" style={{
                  padding: '12px 16px', borderRadius: 10,
                  background: 'rgba(200,62,62,0.08)',
                  border: '1px solid rgba(200,62,62,0.35)',
                  color: 'var(--crimson-text)', fontSize: '0.88rem',
                }}>
                  {calculationError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginTop: 8 }}>
                <button
                  type="button" onClick={goBack}
                  style={{ ...btnBase, background: 'transparent', color: 'var(--ink)', border: '1.5px solid var(--purple-line)' }}
                  onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'var(--purple-bright)'; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--purple-line)'; }}
                >
                  ← Back
                </button>
                <button
                  type="button" onClick={submit}
                  style={{
                    ...btnBase,
                    background: 'linear-gradient(135deg, var(--gold-soft), var(--gold) 55%, #b8931f)',
                    color: 'var(--obsidian)',
                    animation: 'goldPulse 2.8s var(--ease) infinite',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.filter = 'brightness(1.07)'; (e.currentTarget).style.animationPlayState = 'paused'; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.filter = ''; (e.currentTarget).style.animationPlayState = 'running'; }}
                >
                  ✦ Calculate My Profile
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
                Free · Instant · Your data is never sold
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
