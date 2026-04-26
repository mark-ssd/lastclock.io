# lastclock.io

A single-page memento-mori web app. Enter your date of birth, watch a slot-reel
draw a fictional "death date" from the registry, then sit with the result: a
life-tiles grid, a live ticking countdown, and a list of things you can still
do in the time you have left.

There is no algorithm. There is no science. The death date is a triangular-
distributed pick from a bounded range. The point is the reminder, not the
prediction.

## Stack

- React 19 + Vite 8
- pnpm
- Plain CSS (no UI framework, no design system)
- Stateless: result is persisted only in a first-party cookie until the user
  hits reset

## Local development

```sh
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Production build

```sh
pnpm build
pnpm start
```

`pnpm build` outputs static files to `dist/`. `pnpm start` runs `vite preview`
bound to `0.0.0.0` on `$PORT` (default `4173`), suitable for Railway and other
container-based hosts.

## Deploy to Railway

The repo includes `railway.json` so a freshly imported project on Railway
builds and runs without manual configuration:

1. New Project → Deploy from GitHub repo → pick this repo.
2. Railway auto-detects Node.js + pnpm via Railpack, runs `pnpm install` and
   `pnpm build`, then `pnpm start`.
3. Add a public domain to the service from the Railway dashboard.

If Railway picks the wrong Node version, set `RAILPACK_NODE_VERSION=22` as a
service variable.

## Design

The original design handoff lives in `design/` for reference (README,
prototype source, design tokens, copy).
