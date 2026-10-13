import { useEffect, useState } from 'react';
import { AccessibilityInfo, LayoutAnimation } from 'react-native';
import { Easing } from 'react-native-reanimated';

/**
 * One set of timings and one curve for the whole app, so every movement feels like it belongs.
 * press: a finger answered. open: a card opening or closing. move: a screen or view changing.
 */
export const DURATION = { press: 120, open: 240, move: 360 } as const;

/** A soft ease-out: quick to start, gentle to land. */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);

let reduceMotion = false;
let listening = false;

function listen(): void {
  if (listening) return;
  listening = true;
  void AccessibilityInfo.isReduceMotionEnabled().then((v) => { reduceMotion = v; }).catch(() => undefined);
  AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => { reduceMotion = v; });
}
listen();

/** True when the person has asked their phone for less movement. */
export function isReduceMotion(): boolean {
  return reduceMotion;
}

/** Same answer as isReduceMotion, for components that need to re-render when the setting changes. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(reduceMotion);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (alive) setReduce(v); }).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => { if (alive) setReduce(v); });
    return () => { alive = false; sub.remove(); };
  }, []);
  return reduce;
}

/**
 * Call just before a state change that opens, closes or reorders content. Everything that moves because of
 * that change slides to its new place and what appears fades in, so the page never lurches and the reader keeps their place.
 * Does nothing when Reduce Motion is on.
 */
export function animateLayout(): void {
  if (reduceMotion) return;
  LayoutAnimation.configureNext({
    duration: DURATION.open,
    create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    update: { type: LayoutAnimation.Types.easeInEaseOut },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  });
}
