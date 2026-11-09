# Accessibility: the device pass

`tests/app/onboardingA11y.test.ts` checks what can be read off the source — labels, hints,
headings, announcements, 13pt text, 48pt targets, AAA contrast from the tokens, Reduce Motion.
None of that proves the experience. What follows needs a real iPhone, and it is the only part
that does.

Run it after any change to onboarding, and before a TestFlight build.

## Set up

Settings → Accessibility, with VoiceOver on a triple-click shortcut (Accessibility → Accessibility
Shortcut) so it can be turned off when it gets in the way.

Delete and reinstall the app first, or clear its data. Onboarding only looks like onboarding once.

## 1. VoiceOver through the whole flow

Swipe right through every screen end to end. On each one:

- **Does the heading come first?** Every screen's title is marked as a header, so a rotor set to
  Headings should jump straight to it.
- **Does focus land somewhere sensible after the screen changes?** Onboarding swaps six screens in
  place without navigating. Each change announces its heading now — confirm the announcement
  actually fires, and that it does not talk over VoiceOver reading the new screen.
  The six: the three wizard steps, the place check, the calculation, the reveal, the email ask,
  the code.
- **Is anything unreachable?** Swiping must reach every control. Anything you can tap and cannot
  swipe to is a bug.

### The birth-time switch — check this one first

It was relabelled and its value inverted on 2026-11-08. It now reads **"I don't know my birth
time"** and is **on when the time is unknown**.

VoiceOver should say *"I don't know my birth time, switch button, off"* when a time **is** known.
If it says "on" there, the inversion is backwards and every chart built through it has the wrong
rising sign.

### The state field

New on 2026-11-08. Focusing it should speak the label **and** the reason — "Town names repeat
across states…" — as a hint. If you hear only the label, the hint is not being passed.

### The place list

Candidates are radios. Each should speak its label, its time zone, and whether it is selected.
Selection is shown with a gold dot, so the spoken "selected" is the only way a VoiceOver user has
it.

### The date and time pickers

`DateTimePicker` in `compact` mode is the roughest control in the flow with VoiceOver. Confirm a
date and a time can actually be set without sight. If they cannot, that is worth knowing even if
the fix is large.

## 2. Largest text

Settings → Accessibility → Display & Text Size → Larger Text, accessibility sizes on, slider at
maximum (AX5).

Walk the same flow. Looking for:

- Text clipped, truncated, or running under another element.
- Rows that no longer fit their content — the 48pt minimum is a floor, not a ceiling, and they
  have to grow.
- The email ask screen, whose lede is three lines at default size.
- Buttons whose labels wrap badly or shrink below legible.
- Anything that stops being tappable because it has been pushed off screen. Scroll to the bottom
  of every screen.

## 3. Reduce Motion

Settings → Accessibility → Motion → Reduce Motion, on.

- Screen entrances should appear, not slide.
- The calculating view and the reveal should still make sense with the movement gone — the
  composition stays, only the motion goes.
- Nothing should still be animating. Watch the reveal for a few seconds.

## 4. The quick ones

- **Bold Text** (Display & Text Size): nothing breaks its layout.
- **Increase Contrast**: nothing becomes invisible. The palette already measures AAA, so this is
  a check for surprises, not a likely failure.
- **An iPhone SE**, or the smallest simulator to hand: the wizard is three steps of stacked
  fields and the SE is where they run out of room.
- **Landscape**, if the app allows it.

## What to do with a failure

Write down the screen, the setting, and what happened, then decide whether it is a fix or a known
limit. A known limit written down is worth more than a fix that never gets made — especially for
the pickers, where the honest answer may be that the platform control is what it is.
