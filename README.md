# Hamilton Kenfack — Portfolio (Next.js 16 · TypeScript)

A Next.js 16 (App Router, React 19, TypeScript) port of the cinematic WebGL portfolio.

Scaffold options: **TypeScript**, **ESLint**, **No React Compiler**, **src/ directory**, **App Router** (no Tailwind — the project ships its own design system).

## Requirements

- Node.js 20.9+ (Next.js 16 requirement)
- npm (or pnpm / yarn / bun)

## Run

    npm install
    npm run dev

Open http://localhost:3000  (the archive is at /projects).

Production build:

    npm run build
    npm run start

Lint:

    npm run lint

## Project structure

    src/
      app/
        layout.tsx           Root layout + fonts (Space Grotesk / JetBrains Mono)
        globals.css          Full design system (from the original styles.css)
        ClientPage.tsx       Client wrapper: injects page markup + boots scripts in order
        page.tsx             Home route  (/)
        home-markup.ts       Home markup (generated from index.html body)
        projects/page.tsx    Archive route (/projects)
        projects-markup.ts   Archive markup (generated from projects.html body)
        api/ask/route.ts     Optional Anthropic proxy for the AI chatbot
      types/global.d.ts      Window typings for the bootstrap globals
    public/js/               Vanilla engines (Three.js scene, i18n, interactions, AI, lab…)

## How it works

The original site is hand-authored HTML/CSS + vanilla TS-free JS (Three.js,
an i18n layer, a custom cursor, scroll-driven 3D, the Lab case-study reader and
the AI chat). To preserve it 1:1, each route renders the original markup and
then loads the engine scripts in order. They run after hydration and drive the
DOM exactly as before. Internal links were rewritten to Next routes (/ and /projects).

## Language

EN/FR is auto-detected from the browser on first visit and remembered in
localStorage; the EN|FR switch in the header overrides it.

## "Ask Hamilton AI" chatbot

By default the chatbot shows a graceful "not available" message. To enable real answers:

1. Copy .env.local.example to .env.local and set ANTHROPIC_API_KEY.
2. In src/app/page.tsx, add "/js/claude-shim.js" as the FIRST entry of the scripts array.

The shim routes window.claude.complete() to src/app/api/ask/route.ts, which
proxies to the Anthropic Messages API. The bot is grounded only on the knowledge
base in public/js/ai.js.

## Notes

- The in-app Tweaks panel was an authoring-host feature and stays hidden here;
  the default theme values are still applied on load.
- The 3D centerpiece is centered on phones/portrait and shifts right on wide desktops.
