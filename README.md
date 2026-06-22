# Fan-Made Stranger Things AI App

A fan-made *Stranger Things* AI app, styled as a retro **Heathkit H-89**
green-phosphor terminal, that lets kids and adults explore the show's
lore safely and at the right depth — powered by Google Gemini 2.5 Flash.
Styled after a real 1980s Heathkit H-89 all-in-one computer: charcoal
plastic chassis, recessed CRT bezel, scanlines, slow vertical-hold roll,
blinking cursor, and a branded orange/blue Heathkit badge. Built with
TanStack Start, React 19, Vite 7, and Tailwind v4.

## Why this exists

My nephew Noah is a young kid who desperately wanted to watch Netflix's
*Stranger Things*. My sister (Noah's mom) started Season 1 with him to
gauge what he could handle, and they hit a wall: Noah kept pausing the
show to ask questions, and she was often at a loss for the right words.

Noah is too little for the unpredictable nature of open-ended AI — he
needs a tool where he (or his mom) can get age-appropriate answers.
Meanwhile his mom wanted her *own* device to explore deep lore and the
origin story without risking spoilers for either of them.

So I opened Google's Vertex AI and built this — a fan-made application
on Gemini 2.5 Flash, dressed up like an 80s Heathkit terminal to drop
them straight into the world of the show.

## Summary

Hawkins Frequency boots like a period-correct terminal ("PROPERTY OF
HAWKINS MIDDLE SCHOOL — HEATHKIT TERMINAL H-89"), asks you to pick a
companion (Eleven for kids, Dustin for adults), confirms your spoiler
clearance by season (1–5 or *The First Shadow*), then streams
in-character lore answers character-by-character like an old CRT. The
whole experience runs client-side: there is no backend, no database, and
no analytics. You bring your own Google Gemini API key and it stays in
your browser tab.

## Capabilities

### 🧇 Child Mode — persona inspired by Eleven (for Noah)

A strict safety layer overrides standard model behavior:

- **Reality Check Protocol** — hard-coded logic that clarifies monsters
  are "real in the show" but explicitly cannot enter his house.
- **Safety Filter** — zero-tolerance for disturbing descriptions. Scary
  requests are redirected and graphic imagery is replaced with safe,
  elementary observations.
- **Heroism Framing** — pivots scary answers to focus on how the friends
  protect each other rather than on the danger itself.
- **Syntactic Alignment** — vocabulary is constrained to Eleven's
  simple, fragmented Season 1 speech patterns.
- **Total Topic Lock** — refuses real-world discussion (news, cast,
  creators) to keep 100% immersion in the story. (Adult Mode shares
  this lock.)

### 🧢 Adult Mode — persona inspired by Dustin (for Noah's mom)

Built for logic and depth:

- **Spoiler Firewall** — a dynamic "Season State" check verifies the
  user's watch progress before every session and blocks future plot
  leaks. (Child Mode shares this strict firewall.)
- **History Recall** — selecting Season 5 unlocks the complete archive
  of every previous season, so an adult mid-Volume 1 can ask "wait, who
  was that guy again?" and get instant Seasons 1–4 context without
  leaving the interface. (Eleven also has this encyclopedic memory.)
- **Deep Lore Integration** — discussion of the stage play *The First
  Shadow* is unlocked for theory-crafting toward the final season.
  (Child Mode can access this too, age-appropriately.)
- **Tonal Shift** — high-detail responses with scientific analogies and
  D&D metaphors tuned to an adult fan.

### 🔄 Mode switching

A **RESET** protocol allows seamless hand-offs between Noah (Child Mode)
and his mom (Adult Mode) on the same device. Type `reset` in the input
to return to the boot screen.

### 🔦 80s terminal experience

- Authentic **Heathkit H-89** charcoal-plastic chassis with realistic
  shading, recessed CRT bezel, and a period-correct orange/blue Heathkit
  H-89 brand badge.
- **CRT scanline overlay**, slow vertical-hold roll, subtle flicker, and
  green-phosphor glow.
- **Slim, era-appropriate blinking cursor** (replaced the original
  block cursor).
- **Character-by-character output rendering** so responses appear one
  character at a time like an old Heathkit terminal.
- **Clearer input placeholder text** for more intuitive onboarding.
- Persistent **IP / legal footer** on every screen.

## Bring Your Own Key (BYOK) — session-only security model

This project never ships an API key and never proxies your traffic. You
supply your own Google Gemini key through the in-app **SETTINGS** modal
and it is used to call Google's API directly from your browser.

The key handling is deliberately strict and **isolated per visitor**:

- **Stored in `sessionStorage` only.** It lives in a single browser tab
  and is wiped the moment that tab is closed.
- **Never written to `localStorage`.** No "remember me", no long-lived
  persistence.
- **Never sent to any Hawkins Frequency server or database.** There is
  no server component that sees the key — requests go browser → Google
  directly.
- **Never hardcoded in the source.** Search the repo; you will not find one.
- **Not shared across tabs, visitors, or devices.** Every person who
  opens the app gets their own empty session and must paste their own
  key. One visitor cannot see, reuse, or trigger billing on another
  visitor's key.
- **Not visible to other users of the app.** There is no shared state.
  Your key cannot be exfiltrated by someone else loading the site.

If no key is present, the terminal posts a non-blocking system notice
pointing you to the SETTINGS modal instead of failing silently.

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Cost — what to expect

Hawkins Frequency does not bill you. Google bills you (or doesn't, if
you stay in the free tier) for the model calls your key makes.

- **Free tier (recommended for almost everyone).** Google AI Studio
  offers a free tier on `gemini-2.5-flash` with per-minute and per-day
  rate limits and no credit card required. Casual chatting — a few
  questions here and there — comfortably fits inside the free tier.
- **Paid tier (if you exceed the free limits).** At current Gemini 2.5
  Flash pricing, a typical chat turn (a short question + a few
  paragraphs of answer) costs a small fraction of a cent. A long
  evening of heavy back-and-forth is usually well under $1. Pricing
  changes — always check Google's current rates at
  <https://ai.google.dev/pricing>.

The cost note is also surfaced inside the app's SETTINGS modal so
visitors see it before they paste a key.

## Safety, supervision, and trademarks

- **Adult supervision recommended.** Child Mode's safety rules are a
  best-effort prompt layer on a third-party LLM (Google Gemini). They
  are strong, but no LLM safety layer is perfect. An adult should sit
  with a young child the first few times they use it.
- **Fan project, not affiliated.** Not endorsed by or connected to
  Netflix, the Stranger Things production team, or Heathkit. All
  trademarks belong to their respective owners. See `LICENSE` and the
  in-app footer.

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
- `src/hooks/useGeminiChat.ts` — reads the key from `sessionStorage`,
  instantiates `@google/genai` per session, and applies the Child/Adult
  persona + safety/spoiler system prompts
- `src/lib/apiKeyStorage.ts` — the only place that touches storage; the
  single source of truth for the session-only policy
- `src/constants.ts` — Eleven/Dustin personas, safety layer, and
  per-season spoiler firewall (including Season 5 History Recall)
- `src/styles.css` — Heathkit H-89 chassis, CRT bezel, scanlines,
  blinking cursor, and the `.crt-footer` IP notice styling

## License

See [`LICENSE`](./LICENSE). Fan project for non-commercial, educational
use only.
