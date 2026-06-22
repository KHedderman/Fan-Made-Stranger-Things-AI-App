# Hawkins Frequency

A fan-made retro Heathkit-H19-style green-phosphor terminal that chats
Stranger Things lore, powered by Google Gemini. Built with TanStack Start,
React 19, Vite 7, and Tailwind v4.

## Bring Your Own Key (BYOK) — session-only security model

This project never ships an API key and never proxies your traffic. You
supply your own Google Gemini key through the in-app **SETTINGS** modal and
it is used to call Google's API directly from your browser.

The key handling is deliberately strict:

- **Stored in `sessionStorage` only.** It lives in a single browser tab and
  is wiped the moment that tab is closed.
- **Never written to `localStorage`.** No "remember me", no long-lived
  persistence.
- **Never sent to any backend or database.** There is no server component
  that sees the key — requests go browser → Google.
- **Never hardcoded in the source.** Search the repo; you will not find one.
- **Not shared across tabs.** Each tab is its own session.

If no key is present, the terminal posts a non-blocking system notice
pointing you to the SETTINGS modal instead of failing silently.

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

## Model

Chat uses `gemini-3.5-flash` for a good balance of latency and quality.

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

## License

Fan project, not affiliated with Netflix or the Duffer Brothers.
