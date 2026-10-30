# scroll-craft engine (vendored)

`scrollcraft.js` and `scrollcraft.css` are copied unmodified from the scroll-craft
skill. Do not edit them. The engine reads `data-sc-*` attributes off our own markup
and drives them from one scroll value; it never generates DOM.

Theming is done by overriding the `--sc-*` tokens, which we do in `globals.css`.
Bespoke behaviour is written in our own components off `--sc-p`, never by patching
the engine.

`scrollcraft.css` carries a small global reset (body background, font, colour).
`globals.css` is imported after it in `app/layout.tsx`, so our design system wins.
