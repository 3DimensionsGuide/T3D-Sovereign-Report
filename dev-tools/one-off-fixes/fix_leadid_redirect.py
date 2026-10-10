#!/usr/bin/env python3
"""
T3D Fix — leadId Lost Across Stripe Redirect
================================================
Stripe's confirmPayment() performs a full browser redirect through
Stripe's own domain and back to your return_url. That's a genuine page
reload — any client-side-only state (Zustand store, React state) that
isn't persisted somewhere durable is wiped out by the time the browser
lands back on your site.

Fix: pass leadId through the return_url itself as a query parameter,
which Stripe preserves through the redirect intact. The /report page
then reads it directly from the URL rather than depending on client
state having survived.

Run from project root:
  python3 fix_leadid_redirect.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(PROJECT_ROOT, 'src', 'app', 'checkout', 'page.tsx')

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── 1. Add leadId prop to CheckoutForm's signature ────────────────────────────
old1 = "function CheckoutForm({ email }: { email: string }) {"
new1 = "function CheckoutForm({ email, leadId }: { email: string; leadId: number | null }) {"

if old1 in content:
    content = content.replace(old1, new1)
    print('✓ CheckoutForm now accepts leadId prop')
    changes += 1
else:
    print('✗ CheckoutForm signature not matched')

# ── 2. Include leadId in the return_url ───────────────────────────────────────
old2 = "    const returnUrl = window.location.origin + '/report';"
new2 = "    const returnUrl = `${window.location.origin}/report?leadId=${leadId ?? ''}`;"

if old2 in content:
    content = content.replace(old2, new2)
    print('✓ return_url now carries leadId through the redirect')
    changes += 1
else:
    print('✗ returnUrl line not matched')

# ── 3. Pass leadId down when rendering CheckoutForm ───────────────────────────
old3 = "<CheckoutForm email={email} />"
new3 = "<CheckoutForm email={email} leadId={leadId} />"

if old3 in content:
    content = content.replace(old3, new3)
    print('✓ leadId passed down to CheckoutForm')
    changes += 1
else:
    print('✗ CheckoutForm render call not matched')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print(f'✓ checkout/page.tsx updated ({changes}/3 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
