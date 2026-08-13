'use client';

/**
 * T3D Calculator Form — Design Polish · Surgical Upgrade
 *
 * UPGRADE 5 changes applied:
 *   — Step Indicator: thin 3-segment horizontal line, active = Amber Gold #E5A93C
 *   — Input Fields: underline-only (border-bottom), border-radius: 0
 *   — Primary CTA: crimson #991B1B → parchment hover, 11px DM Sans ALL CAPS
 *   — All fonts: DM Sans
 *
 * No changes to calculation logic, API calls, or store.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useT3DStore } from '@/store/useT3DStore';
import ResultsDashboard from './ResultsDashboard';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FormState {
  firstName:   string;
  middleName:  string;
  lastName:    string;
  birthMonth:  string;
  birthDay:    string;
  birthYear:   string;
  birthHour:   string;
  birthMinute: string;
  birthPeriod: 'AM' | 'PM';
  city:        string;
  state:       string;
  country:     string;
  email:       string;
  emailOptIn:  boolean;
}

type FKey    = keyof FormState;
type Errors  = Partial<Record<FKey, string>>;
type Touched = Partial<Record<FKey, boolean>>;

declare global { interface Window { google: any; initT3DAutocomplete?: () => void; } }

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const HOURS    = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const MINUTES  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2,'0'));
const YEAR_NOW = new Date().getFullYear();
const YEARS    = Array.from({ length: YEAR_NOW - 1919 }, (_, i) => String(YEAR_NOW - i));

function daysInMonth(m: string, y: string) {
  if (!m || !y) return 31;
  return new Date(parseInt(y), parseInt(m), 0).getDate();
}

const INIT: FormState = {
  firstName: '', middleName: '', lastName: '',
  birthMonth: '', birthDay: '', birthYear: '',
  birthHour: '', birthMinute: '00', birthPeriod: 'AM',
  city: '', state: '', country: '',
  email: '', emailOptIn: false,
};

const STEP_FIELDS: Record<number, FKey[]> = {
  1: ['firstName', 'lastName'],
  2: ['birthMonth', 'birthDay', 'birthYear', 'city', 'country'],
  3: ['email', 'emailOptIn'],
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateField(field: FKey, s: FormState): string {
  const v = s[field] as string | boolean;
  switch (field) {
    case 'firstName':  return typeof v === 'string' && v.trim() ? '' : 'First name is required';
    case 'lastName':   return typeof v === 'string' && v.trim() ? '' : 'Last name is required';
    case 'birthMonth': return typeof v === 'string' && v ? '' : 'Select birth month';
    case 'birthDay':   return typeof v === 'string' && v ? '' : 'Select birth day';
    case 'birthYear':  return typeof v === 'string' && v ? '' : 'Select birth year';
    case 'city':    return typeof v === 'string' && v.trim() ? '' : 'Birth city is required';
    case 'country': return typeof v === 'string' && v.trim() ? '' : 'Country is required';
    case 'email': {
      const e = typeof v === 'string' ? v : '';
      if (!e.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email';
      return '';
    }
    case 'emailOptIn': return v === true ? '' : 'Agreement required to receive results';
    default: return '';
  }
}

function buildDate(m: string, d: string, y: string) {
  if (!m || !d || !y) return '';
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}
function buildTime(h: string, min: string, period: 'AM' | 'PM') {
  if (!h || !min) return '';
  let hr = parseInt(h,10);
  if (period === 'AM' && hr === 12) hr = 0;
  if (period === 'PM' && hr !== 12) hr += 12;
  return `${String(hr).padStart(2,'0')}:${min}`;
}

// ─── UPGRADE 5 — STEP INDICATOR (thin 3-segment line) ────────────────────────
function StepBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 40 }}>
      {/* Segment track */}
      <div className="t3d-step-track">
        {[1,2,3].map(n => (
          <div
            key={n}
            className={`t3d-step-seg ${step === n ? 'active' : step > n ? 'done' : ''}`}
          />
        ))}
      </div>
      {/* Labels below segments */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {[
          { n: 1, label: 'IDENTITY'    },
          { n: 2, label: 'COORDINATES' },
          { n: 3, label: 'RESULTS'     },
        ].map(s => (
          <span key={s.n} className="t3d-label" style={{
            color: step === s.n ? 'var(--parchment)' : step > s.n ? 'var(--amber)' : 'var(--parchment-40)',
          }}>
            {step > s.n ? '✓ ' : ''}{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── UPGRADE 5 — UNDERLINE INPUT ─────────────────────────────────────────────
function UInput({
  id, name, type = 'text', placeholder, value, error, touched,
  onChange, onBlur, inputRef,
}: {
  id: string; name: string; type?: string; placeholder?: string;
  value: string; error?: string; touched?: boolean;
  onChange: (v: string) => void; onBlur: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const hasErr = touched && error;
  const isOk   = touched && !error && value.trim().length > 0;
  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      id={id} name={name} type={type} placeholder={placeholder} value={value}
      autoComplete={type === 'email' ? 'email' : 'off'}
      aria-invalid={!!hasErr}
      aria-describedby={hasErr ? `${id}-err` : undefined}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      className={`t3d-input ${hasErr ? 'error' : isOk ? 'valid' : ''}`}
    />
  );
}

// ─── UPGRADE 5 — UNDERLINE SELECT ────────────────────────────────────────────
function USelect({
  id, name, value, error, touched, placeholder, options, onChange, onBlur,
}: {
  id: string; name: string; value: string;
  error?: string; touched?: boolean; placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void; onBlur: () => void;
}) {
  const hasErr = touched && error;
  const isOk   = touched && !error && value !== '';
  return (
    <select
      id={id} name={name} value={value}
      aria-invalid={!!hasErr}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      className={`t3d-select ${hasErr ? 'error' : isOk ? 'valid' : ''}`}
      style={{ color: value ? 'var(--parchment)' : 'var(--parchment-40)' }}
    >
      <option value="" disabled style={{ background: '#18181B' }}>{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value} style={{ background: '#18181B' }}>{o.label}</option>)}
    </select>
  );
}

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
function Field({ label, optional, error, touched, children }: {
  label: string; optional?: boolean; error?: string; touched?: boolean; children: React.ReactNode;
}) {
  const hasErr = touched && error;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label className="t3d-label" style={{ color: 'var(--parchment-40)' }}>
        {label}
        {optional && <span style={{ color: 'var(--parchment-15)', textTransform: 'none', fontSize: 10, letterSpacing: '0.05em', marginLeft: 6 }}>optional</span>}
      </label>
      {children}
      {hasErr && (
        <p role="alert" className="t3d-label" style={{ color: 'var(--crimson-hi)', letterSpacing: '0.08em' }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

// ─── LOADING ANIMATION ────────────────────────────────────────────────────────
function LoadingScreen() {
  const [phase, setPhase] = useState(0);
  const labels = [
    'Reading personality epoch…',
    'Calculating design epoch…',
    'Mapping gate activations…',
    'Computing Pythagorean values…',
    'Reading planetary positions…',
  ];
  useEffect(() => {
    const t = setInterval(() => setPhase(p => (p + 1) % labels.length), 1600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px 0', textAlign:'center', gap:28 }}>
      <svg viewBox="0 0 200 200" width={140} height={140} aria-hidden>
        <g style={{ transformOrigin:'100px 100px', animation:'spin 48s linear infinite' }}>
          <circle cx="100" cy="100" r="90" stroke="rgba(229,169,60,0.2)" strokeWidth="1" strokeDasharray="3 8" fill="none" />
        </g>
        <g style={{ transformOrigin:'100px 100px', animation:'spinRev 28s linear infinite' }}>
          <circle cx="100" cy="100" r="68" stroke="var(--crimson)" strokeWidth="0.8" strokeDasharray="6 12" fill="none" opacity="0.6" />
        </g>
        <g style={{ transformOrigin:'100px 100px', animation:'spin 18s linear infinite' }}>
          <circle cx="100" cy="100" r="46" stroke="rgba(245,245,243,0.1)" strokeWidth="1" strokeDasharray="2 6" fill="none" />
        </g>
        <g style={{ transformOrigin:'100px 100px', animation:'pulse 2.5s ease-in-out infinite' }}>
          <polygon points="100,36 108,100 100,88 92,100" fill="var(--parchment)" opacity="0.9" />
          <polygon points="100,164 108,100 100,112 92,100" fill="rgba(245,245,243,0.25)" />
        </g>
        <circle cx="100" cy="20"  r="4" fill="var(--amber)"   style={{ filter:'drop-shadow(0 0 5px #E5A93C)' }} />
        <circle cx="22"  cy="138" r="4" fill="var(--emerald)" style={{ filter:'drop-shadow(0 0 5px #1F8A4D)' }} />
        <circle cx="178" cy="138" r="4" fill="var(--crimson)" style={{ filter:'drop-shadow(0 0 5px #991B1B)' }} />
        <circle cx="100" cy="100" r="7" fill="#0D0D0E" stroke="var(--crimson)" strokeWidth="1.5" />
      </svg>

      <div>
        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:400, color:'var(--parchment)', marginBottom:8 }}>
          Reading your coordinates
        </p>
        <p className="t3d-label" style={{ color:'var(--crimson)', minHeight:'1.4em' }}>
          {labels[phase]}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CalculatorForm() {
  const {
    results, isCalculating, calculationError,
    currentStep, setCurrentStep, setIsCalculating, setError, setResults,
  } = useT3DStore();

  const [data,    setData]    = useState<FormState>(INIT);
  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [dir,     setDir]     = useState<'fwd'|'back'>('fwd');
  const [animKey, setAnimKey] = useState(0);

  const cityRef    = useRef<HTMLInputElement>(null);
  const placesInit = useRef(false);

  const validate = useCallback((field: FKey, state: FormState) => {
    const msg = validateField(field, state);
    setErrors(e => ({ ...e, [field]: msg || undefined }));
  }, []);

  function set<K extends FKey>(field: K, value: FormState[K]) {
    setData(prev => {
      const next = { ...prev, [field]: value };
      if (touched[field]) validate(field, next);
      return next;
    });
  }
  function touch(field: FKey) {
    setTouched(t => ({ ...t, [field]: true }));
    validate(field, data);
  }

  // Google Places autocomplete
  const initAC = useCallback(() => {
    if (placesInit.current || !cityRef.current || !window.google?.maps?.places) return;
    placesInit.current = true;
    const ac = new window.google.maps.places.Autocomplete(cityRef.current, {
      types: ['(cities)'], fields: ['address_components','name'],
    });
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const city    = place.name ?? '';
      const country = place.address_components?.find((c: any) => c.types.includes('country'))?.long_name ?? '';
      const stateComp = place.address_components?.find((c: any) => c.types.includes('administrative_area_level_1'))?.long_name ?? '';
      setData(prev => {
        const next = { ...prev, city, state: stateComp, country };
        validate('city', next); validate('country', next);
        return next;
      });
      setTouched(t => ({ ...t, city:true, country:true }));
    });
  }, [validate]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return;
    if (window.google?.maps?.places) { initAC(); return; }
    if (document.querySelector('#t3d-gm')) return;
    window.initT3DAutocomplete = initAC;
    const s = document.createElement('script');
    s.id = 't3d-gm';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initT3DAutocomplete`;
    s.async = true;
    document.head.appendChild(s);
    return () => { delete window.initT3DAutocomplete; };
  }, [initAC]);

  useEffect(() => { if (currentStep === 2) setTimeout(initAC, 100); }, [currentStep, initAC]);

  function advance() {
    const errs = Object.fromEntries(
      (STEP_FIELDS[currentStep] ?? []).map(f => [f, validateField(f, data)]).filter(([,v]) => v)
    ) as Errors;
    if (Object.keys(errs).length) {
      setErrors(e => ({ ...e, ...errs }));
      const t: Touched = {};
      for (const f of STEP_FIELDS[currentStep] ?? []) t[f] = true;
      setTouched(p => ({ ...p, ...t }));
      return;
    }
    setDir('fwd'); setAnimKey(k => k+1); setCurrentStep(currentStep + 1);
  }

  function goBack() { setDir('back'); setAnimKey(k => k+1); setCurrentStep(currentStep - 1); }

  async function submit() {
    const errs = Object.fromEntries(
      (STEP_FIELDS[3] ?? []).map(f => [f, validateField(f, data)]).filter(([,v]) => v)
    ) as Errors;
    if (Object.keys(errs).length) {
      setErrors(e => ({ ...e, ...errs }));
      setTouched(t => ({ ...t, email:true, emailOptIn:true }));
      return;
    }
    setIsCalculating(true); setError(null);
    const birthTime = data.birthHour ? buildTime(data.birthHour, data.birthMinute, data.birthPeriod) : undefined;
    try {
      const res  = await fetch('/api/calculate-t3d', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName.trim(), middleName: data.middleName.trim() || undefined,
          lastName: data.lastName.trim(), email: data.email.toLowerCase().trim(),
          birthDate: buildDate(data.birthMonth, data.birthDay, data.birthYear),
          birthTime,
          birthPlace: {
            city: [data.city, data.state].filter(Boolean).join(', '),
            country: data.country.trim(),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Calculation failed.');
      // Save email + name so checkout page can pre-fill and pass to Stripe
      if (typeof window !== 'undefined') {
        localStorage.setItem('t3d_email', data.email.toLowerCase().trim());
        localStorage.setItem('t3d_name',  [data.firstName, data.lastName].filter(Boolean).join(' '));
      }
      setResults({ leadId:json.leadId, astrology:json.data.astrology, numerology:json.data.numerology, humanDesign:json.data.humanDesign });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setIsCalculating(false);
    }
  }

  if (results)       return <ResultsDashboard />;
  if (isCalculating) return <LoadingScreen />;

  const maxDays = daysInMonth(data.birthMonth, data.birthYear);
  const dayOpts = Array.from({ length: maxDays }, (_, i) => ({
    value: String(i+1).padStart(2,'0'), label: String(i+1),
  }));

  const animStyle: React.CSSProperties = {
    animation: `${dir === 'fwd' ? 'slideRight' : 'slideLeft'} 0.3s var(--ease) both`,
  };

  return (
    <>
      <style>{`select option { background: #18181B !important; }
      input[type="checkbox"] { accent-color: var(--amber); width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; margin-top: 3px; }
      @media(max-width:640px) { .calc-2col { grid-template-columns: 1fr !important; } .calc-3col { grid-template-columns: 1fr !important; } }`}</style>

      {/* UPGRADE 5 — Thin 3-segment step indicator */}
      <StepBar step={currentStep} />

      <div key={animKey} style={animStyle}>

        {/* ── STEP 1 ──────────────────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            <div style={{ marginBottom:8 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3vw,36px)', fontWeight:400, color:'var(--parchment)', marginBottom:8 }}>
                What&apos;s your full name?
              </h2>
              <p className="t3d-body" style={{ maxWidth:'42ch' }}>
                Your birth name is used for Pythagorean numerology calculations.
              </p>
            </div>

            <div className="calc-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <Field label="FIRST NAME" error={errors.firstName} touched={touched.firstName}>
                <UInput id="firstName" name="firstName" placeholder="Your first name" value={data.firstName}
                  error={errors.firstName} touched={touched.firstName}
                  onChange={v => set('firstName',v)} onBlur={() => touch('firstName')} />
              </Field>
              <Field label="LAST NAME" error={errors.lastName} touched={touched.lastName}>
                <UInput id="lastName" name="lastName" placeholder="Your last name" value={data.lastName}
                  error={errors.lastName} touched={touched.lastName}
                  onChange={v => set('lastName',v)} onBlur={() => touch('lastName')} />
              </Field>
            </div>

            <Field label="MIDDLE NAME" optional>
              <UInput id="middleName" name="middleName" placeholder="Your middle name" value={data.middleName}
                onChange={v => set('middleName',v)} onBlur={() => {}} />
            </Field>

            <p className="t3d-label" style={{ color:'var(--parchment-40)', marginTop:-12 }}>
              Include middle name only if on your birth certificate — it affects numerology.
            </p>

            {/* UPGRADE 5 — CTA: crimson, zero radius, 11px DM Sans ALL CAPS */}
            <button type="button" onClick={advance} className="t3d-cta" style={{ marginTop:8 }}>
              CONTINUE — BIRTH DATA
            </button>
          </div>
        )}

        {/* ── STEP 2 ──────────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
            <div style={{ marginBottom:8 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3vw,36px)', fontWeight:400, color:'var(--parchment)', marginBottom:8 }}>
                When and where were you born?
              </h2>
              <p className="t3d-body" style={{ maxWidth:'42ch' }}>
                Used to calculate your natal chart and Human Design bodygraph.
              </p>
            </div>

            {/* Birth Date */}
            <fieldset style={{ border:'none', padding:0, margin:0 }}>
              <legend className="t3d-label" style={{ marginBottom:10 }}>BIRTH DATE</legend>
              <div className="calc-3col" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1.4fr', gap:16 }}>
                <Field label="" error={errors.birthMonth} touched={touched.birthMonth}>
                  <USelect id="birthMonth" name="birthMonth" placeholder="Month" value={data.birthMonth}
                    error={errors.birthMonth} touched={touched.birthMonth}
                    options={MONTHS.map((m,i) => ({ value:String(i+1).padStart(2,'0'), label:m }))}
                    onChange={v => { set('birthMonth',v); touch('birthMonth'); }} onBlur={() => touch('birthMonth')} />
                </Field>
                <Field label="" error={errors.birthDay} touched={touched.birthDay}>
                  <USelect id="birthDay" name="birthDay" placeholder="Day" value={data.birthDay}
                    error={errors.birthDay} touched={touched.birthDay} options={dayOpts}
                    onChange={v => { set('birthDay',v); touch('birthDay'); }} onBlur={() => touch('birthDay')} />
                </Field>
                <Field label="" error={errors.birthYear} touched={touched.birthYear}>
                  <USelect id="birthYear" name="birthYear" placeholder="Year" value={data.birthYear}
                    error={errors.birthYear} touched={touched.birthYear}
                    options={YEARS.map(y => ({ value:y, label:y }))}
                    onChange={v => { set('birthYear',v); touch('birthYear'); }} onBlur={() => touch('birthYear')} />
                </Field>
              </div>
            </fieldset>

            {/* Birth Time */}
            <fieldset style={{ border:'none', padding:0, margin:0 }}>
              <legend className="t3d-label" style={{ marginBottom:10 }}>
                BIRTH TIME <span style={{ color:'var(--parchment-40)', textTransform:'none', fontSize:10, letterSpacing:'0.05em' }}>optional</span>
              </legend>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                <div style={{ flex:'0 0 100px' }}>
                  <USelect id="birthHour" name="birthHour" placeholder="Hour" value={data.birthHour}
                    options={HOURS.map(h => ({ value:h, label:h }))}
                    onChange={v => set('birthHour',v)} onBlur={() => {}} />
                </div>
                <div style={{ flex:'0 0 100px' }}>
                  <USelect id="birthMinute" name="birthMinute" placeholder="Min" value={data.birthMinute}
                    options={MINUTES.map(m => ({ value:m, label:m }))}
                    onChange={v => set('birthMinute',v)} onBlur={() => {}} />
                </div>
                {/* AM/PM Toggle — underline style to match inputs */}
                <div role="group" aria-label="AM or PM" style={{ display:'flex', borderBottom:'1px solid var(--input-line)' }}>
                  {(['AM','PM'] as const).map(p => (
                    <button key={p} type="button" onClick={() => set('birthPeriod',p)}
                      aria-pressed={data.birthPeriod === p}
                      style={{
                        width:52, height:48, border:'none', cursor:'pointer',
                        fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, letterSpacing:'0.12em',
                        background: data.birthPeriod === p ? 'var(--crimson)' : 'transparent',
                        color: data.birthPeriod === p ? 'var(--parchment)' : 'var(--parchment-40)',
                        transition: 'background 0.18s var(--ease), color 0.18s var(--ease)',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Location */}
            <Field label="BIRTH CITY" error={errors.city} touched={touched.city}>
              <UInput id="city" name="city" placeholder="City of birth" value={data.city}
                error={errors.city} touched={touched.city}
                inputRef={cityRef} onChange={v => set('city',v)} onBlur={() => touch('city')} />
            </Field>
            <div className="calc-2col" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <Field label="STATE / PROVINCE">
                <UInput id="state" name="state" placeholder="State or province" value={data.state}
                  onChange={v => set('state',v)} onBlur={() => {}} />
              </Field>
              <Field label="COUNTRY" error={errors.country} touched={touched.country}>
                <UInput id="country" name="country" placeholder="Country of birth" value={data.country}
                  error={errors.country} touched={touched.country}
                  onChange={v => set('country',v)} onBlur={() => touch('country')} />
              </Field>
            </div>

            <div className="calc-2col" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12, marginTop:8 }}>
              <button type="button" onClick={goBack} className="t3d-ghost">← BACK</button>
              <button type="button" onClick={advance} className="t3d-cta">CONTINUE</button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ──────────────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            <div style={{ marginBottom:8 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(24px,3vw,36px)', fontWeight:400, color:'var(--parchment)', marginBottom:8 }}>
                Almost there.
              </h2>
              <p className="t3d-body" style={{ maxWidth:'42ch' }}>
                Your profile is free. Enter your email and we&apos;ll calculate and deliver it instantly.
              </p>
            </div>

            {/* Summary */}
            <div style={{ borderLeft:'3px solid var(--amber)', padding:'16px 20px', background:'var(--card-bg)', display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { k:'NAME',     v:[data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ') },
                { k:'DATE',     v:`${MONTHS[parseInt(data.birthMonth)-1] ?? ''} ${parseInt(data.birthDay)}, ${data.birthYear}` },
                { k:'TIME',     v:data.birthHour ? `${data.birthHour}:${data.birthMinute} ${data.birthPeriod}` : 'Not provided' },
                { k:'LOCATION', v:`${data.city}${data.state ? ', ' + data.state : ''}, ${data.country}` },
              ].map(row => (
                <div key={row.k} style={{ display:'flex', gap:16, alignItems:'baseline' }}>
                  <span className="t3d-label" style={{ color:'var(--parchment-40)', minWidth:72 }}>{row.k}</span>
                  <span className="t3d-body" style={{ fontSize:14 }}>{row.v}</span>
                </div>
              ))}
            </div>

            <Field label="EMAIL ADDRESS" error={errors.email} touched={touched.email}>
              <UInput id="email" name="email" type="email" placeholder="Your email address"
                value={data.email} error={errors.email} touched={touched.email}
                onChange={v => set('email',v)} onBlur={() => touch('email')} />
            </Field>

            <label style={{ display:'flex', gap:12, alignItems:'flex-start', cursor:'pointer' }}>
              <input type="checkbox" checked={data.emailOptIn}
                onChange={e => { set('emailOptIn', e.target.checked); setTouched(t => ({ ...t, emailOptIn:true })); }} />
              <span className="t3d-body" style={{ fontSize:14 }}>
                I agree to receive my T3D profile and occasional insights. No spam. Unsubscribe anytime.
              </span>
            </label>
            {touched.emailOptIn && errors.emailOptIn && (
              <p role="alert" className="t3d-label" style={{ color:'var(--crimson-hi)' }}>
                ⚠ {errors.emailOptIn}
              </p>
            )}

            {calculationError && (
              <div role="alert" style={{ padding:'12px 16px', border:'1px solid var(--crimson)', background:'rgba(153,27,27,0.08)' }}>
                <p className="t3d-label" style={{ color:'var(--crimson-hi)' }}>⚠ {calculationError}</p>
              </div>
            )}

            <div className="calc-2col" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12, marginTop:8 }}>
              <button type="button" onClick={goBack} className="t3d-ghost">← BACK</button>
              <button type="button" onClick={submit} className="t3d-cta" style={{ animation:'crimsonPulse 3s var(--ease) infinite' }}>
                CALCULATE MY PROFILE
              </button>
            </div>

            <p className="t3d-label" style={{ textAlign:'center', color:'var(--parchment-40)' }}>
              FREE · INSTANT · YOUR DATA IS NEVER SOLD
            </p>
          </div>
        )}
      </div>
    </>
  );
}
