# Hawkins Frequency

A fan-made retro **Heathkit H-89** green-phosphor terminal that chats
Stranger Things lore, powered by Google Gemini. Styled after a real 1980s
Heathkit H-89 all-in-one computer — charcoal plastic chassis, recessed CRT
bezel, scanlines, slow vertical-hold roll, and a branded orange/blue
Heathkit badge. Built with TanStack Start, React 19, Vite 7, and
Tailwind v4.

## Summary

Hawkins Frequency boots like a period-correct terminal ("PROPERTY OF
HAWKINS MIDDLE SCHOOL — HEATHKIT TERMINAL H-89"), asks you to pick a
companion (Eleven or Dustin), confirms your spoiler clearance by season
(1–5 or *The First Shadow*), and then streams in-character lore answers
from Gemini. The whole experience runs client-side: there is no backend,
no database, and no analytics. You bring your own Google Gemini API key
and it stays in your browser tab.

Highlights:

- Period-accurate Heathkit H-89 chassis and CRT styling
- Two in-character guides — Eleven (kid-safe) and Dustin (full lore)
- Per-season spoiler gating with a clearance prompt
- Streaming responses with a typewriter cadence
- Strict BYOK security model (see below)
- Footer IP / legal notice rendered on every screen

## IP / Legal Footer

Every screen of the app renders a persistent footer disclaiming any
affiliation with the rights holders. The exact text is:

> This is an unofficial, fan-made application and is not affiliated with,
> endorsed by, or connected to Netflix, Inc. or the Stranger Things
> production team. All Stranger Things characters, logos, and related
> marks are the property of their respective owners. This project is
> provided for educational and non-commercial purposes only.

The footer lives in `src/routes/index.tsx` inside the `<footer
className="crt-footer">` element and is styled by the `.crt-footer` rule
in `src/styles.css`. It must remain visible — do not remove or hide it.
Heathkit and the H-89 chassis design are likewise referenced for
historical/aesthetic homage only; all trademarks belong to their
respective owners.

## Bring Your Own Key (BYOK) — session-only security model

This project never ships an API key and never proxies your traffic. You
supply your own Google Gemini key through the in-app **SETTINGS** modal
and it is used to call Google's API directly from your browser.

The key handling is deliberately strict:

- **Stored in `sessionStorage` only.** It lives in a single browser tab
  and is wiped the moment that tab is closed.
- **Never written to `localStorage`.** No "remember me", no long-lived
  persistence.
- **Never sent to any backend or database.** There is no server
  component that sees the key — requests go browser → Google.
- **Never hardcoded in the source.** Search the repo; you will not find one.
- **Not shared across tabs.** Each tab is its own session.

If no key is present, the terminal posts a non-blocking system notice
pointing you to the SETTINGS modal instead of failing silently.

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Model

Chat uses `gemini-2.5-flash` for a good balance of latency and quality.

## Run locally

Requirements: [Bun](https://bun.sh) (or npm/pnpm).

```bash
bun install
bun run dev
```

The app starts on `http://localhost:8080`. Open SETTINGS in the top-right
status strip, paste your Gemini key, and start a session.

## Build

```bash
bun run build
```

## Project layout

- `src/routes/` — TanStack Start file-based routes (`__root.tsx`, `index.tsx`)
- `src/components/` — `BootSequence`, `ChatInterface`, `SettingsModal`, `SpoilerCheck`
- `src/hooks/useGeminiChat.ts` — reads the key from `sessionStorage` and
  instantiates `@google/genai` per session
- `src/lib/apiKeyStorage.ts` — the only place that touches storage; the
  single source of truth for the session-only policy
- `src/styles.css` — Heathkit H-89 chassis, CRT bezel, scanlines, and the
  `.crt-footer` IP notice styling

## License

Fan project, not affiliated with Netflix or the Duffer Brothers. See the
in-app footer above for the full IP notice.
