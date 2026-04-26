# Handoff: lastclock.io

## Overview

**lastclock.io** is a single-page memento-mori web app. The user enters their date of birth, the page generates a fictional "death date" via an animated slot-reel sequence, and then displays:

1. A life-tiles grid (one tile per week of life — filled tiles are weeks lived, hollow tiles are weeks remaining, the current week pulses).
2. A live ticking countdown to the death date (years / months / days / hours / minutes / seconds).
3. A list of 10 "things you can still do" — each labeled with a count derived from `hours_remaining ÷ average_hours_per_thing`. The user can reroll for another 10 or expand to view the full ledger of ~50 items.

The tone is solemn and meditative — paper-toned palette, classical serif type, no emoji, lower-case microcopy that does not soften the subject.

## About the Design Files

The files in `source/` are a **design reference**, not production code. They are an HTML + Babel-in-the-browser prototype meant to communicate intended look, feel, copy, and behavior — not to be shipped as-is.

Your task is to **recreate this design in the target codebase's existing environment** (React/Next.js, Vue, SvelteKit, etc.) using its established patterns, component primitives, and routing. If the project does not yet have a frontend stack, choose the most appropriate one (a React + Vite SPA is a perfectly reasonable default for this scope) and implement there.

The visual + behavioural spec in this README is authoritative. The HTML prototype is supplementary — open it side-by-side to see motion, spacing, and interactions in action.

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and interactions are all locked in this prototype. Recreate pixel-faithfully using the codebase's existing libraries and patterns where possible (e.g. the codebase's `<Button>` primitive, its motion library, its layout utilities). Where the target codebase lacks a needed primitive, build it to match these specs exactly.

There is **no real algorithm** behind the "death date" — it is intentionally a random pick from a bounded distribution. Treat this as a piece of conceptual art / public-good reflection, not a prediction tool. If the target product wants to add a real life-expectancy model later, that is a separate concern.

---

## Screens / Views

There are three sequential phases inside one page (no routing). State drives which is rendered.

### Phase 1 — Entry / DOB

**Purpose:** Collect the user's date of birth. Activate the CTA only when DOB is valid.

**Layout:**
- Outer page: max-width `1280px`, centered, padding `56px 64px 96px` (mobile: `40px 28px 80px`).
- Masthead: top + bottom `1px` ink rules, `10px` vertical padding. Left: wordmark "lastclock<span color=faded>.io</span>" (serif, 22px, weight 500). Right: meta row (mono, 11px, uppercase, `0.18em` letter-spacing) — "vol. i · the registry of last days · {today date in DD mmm YYYY}". Margin-bottom `80px`.
- Hero: 2-column grid, `1fr 1fr`, gap `64px`, min-height `540px`. Below 900px viewport collapses to single column.
  - **Left column (copy):**
    - `<h1>` — serif, weight 400, size `clamp(56px, 8vw, 112px)`, line-height `0.95`, letter-spacing `-0.02em`. Copy: `everyone you know will die.` — the words "will die" are italic.
    - First lede paragraph (max-width `32ch`, size `19px`, color `#2b241a`): `you do not know the day. the registry does. enter your date of birth and it will be drawn from the ledger.`
    - Second lede paragraph (same styling but color `#6b6357`): `there is no algorithm. there is no science. there is only an honest reminder that the time you have is finite, and you are spending it now, reading this.`
  - **Right column (form):** Border-left `1px` rule color, padding-left `56px` (collapses to top border on mobile).
    - Eyebrow label (mono, 11px, uppercase, `0.22em` letter-spacing, color `#6b6357`): `date of birth`
    - Three numeric inputs in a row (mono, 22px, transparent bg, 1px ink bottom border, no top/side borders, centered text):
      - Day input — placeholder `dd`, max 2 chars, width `4ch`
      - Separator `/` (mono, color faded)
      - Month input — placeholder `mm`, max 2 chars, width `4ch`
      - Separator `/`
      - Year input — placeholder `yyyy`, max 4 chars, width `6ch`
    - Auto-advance: when an input fills to its max, focus jumps to the next.
    - Hint line (mono, 11px, uppercase, `0.18em`, faded): default text `day · month · year`. On validation error, swap to the error message and color `#8a2a1a`.
    - CTA button: text `find my death date` — uppercase, `0.2em` letter-spacing, padding `18px 32px`. Style: 1px ink border, transparent bg, ink text. Hover: bg ink, text paper. Disabled when DOB invalid: opacity `0.28`, faded border + text, not-allowed cursor.
- Footer: top 1px ink rule, 18px padding-top, mono 11px uppercase faded. Left: `lastclock.io`. Right: `memento mori`.

**DOB validation rules** (inline, no submit until all pass):
- All three fields required.
- Day, month, year must parse as integers.
- Month in `1..12`.
- Year in `1900..currentYear`.
- Day must be valid for the given month/year (leap-year aware: 29 Feb only if `(y%4===0 && y%100!==0) || y%400===0`).
- Computed age must be `0..119` years; future DOB rejected with `you cannot be born in the future.`; ages > 119 rejected with `you have outlived the registry.`.

### Phase 2 — Slot-reel roll

**Purpose:** Theatrical reveal of the death date. Three independent reels spin and decelerate in a stagger.

**Layout:**
- Replaces the hero section. Container: `min-height: 70vh`, flex-column, centered, gap `56px`.
- Top caption (mono, 11px, uppercase, `0.3em`, faded): `consulting the registry` while spinning, swaps to `recorded` once all three reels land.
- Three reels in a row, gap `32px`, with serif `·` separators (36px, faded) between them.
- Bottom caption (mono, 11px, uppercase, `0.3em`, faded): `the registry returns one date.` — opacity `0.4` while spinning, `0.7` after.

**Reel construction (per reel):**
- Frame: width per kind (day=120px, month=260px, year=150px), height `180px`, top + bottom 1px ink borders, no side borders. Overflow hidden.
- Inside the frame, top + bottom paper-color gradient masks (each `70px` tall, z-index 2) fade the cells at the edges so only the centre cell reads cleanly.
- Two short tick marks (`reel-pointer`) protrude into the frame at the vertical centre, left and right — `10px` wide × `1px` ink lines, `-22px` outside the frame on each side. They mark the readout row.
- The track is a vertical flex column of cells, each `60px` tall, transformed via `translateY` to position the target cell at the centre.

**Cell styling per kind:**
- Day cells: serif, weight 400, size `44px`, letter-spacing `-0.01em`. Values: `01..31` (zero-padded).
- Month cells: serif italic, size `38px`. Values: full month names, capitalized first letter (`January`, `February`, …, `December`).
- Year cells: mono (JetBrains Mono), size `36px`. Values: `currentYear..currentYear+105` as strings.

**Animation:**
- Build the cell sequence by repeating the items list 24 times, then appending one final landing copy (so we always have a copy of every value to land on at the bottom).
- On spin start: snap the track to position `startIdx = items.length * 2` (centre that cell at row centre, no transition), force a reflow, then in a 30ms `setTimeout` apply a `transform` transition to the final position `finalIdx = items.length * 24 + targetIndex`.
- Centre offset = `(180/2) - (60/2) = 60px`. End Y = `60 - finalIdx * 60`.
- Duration = `2600ms + delay` per reel, where `delay` is `0` (day), `500` (month), `1100` (year). So month finishes ~500ms after day, year ~600ms after month.
- Easing: `cubic-bezier(0.16, 0.84, 0.24, 1)` — fast start, long graceful tail, no bounce.
- After the spin completes (duration + 80ms), each reel fires its `onLanded` callback. When all three have landed, wait `600ms` and transition to phase 3.

### Phase 3 — Result

**Purpose:** Show the death date, the life-tiles grid, the live countdown, and the things-you-can-still-do module.

**Layout (top of section):**
- Result-head row: flex justify-between, baseline-aligned. Left: eyebrow `the registry returns` (mono 11px uppercase `0.22em` faded). Right: `reset` button (mono 11px uppercase faded, underlined `text-underline-offset: 4px`, transparent bg, no border, hover ink).
- Headline (serif, weight 400, `clamp(48px, 6.5vw, 84px)`, line-height 1, letter-spacing `-0.02em`, margin `6px 0 8px`): `a {dayOfWeek}, {dd month yyyy}.` — the day of week is italic. Date format example: `a wednesday, 12 march 2071.`
- Sub-headline (mono, 12px, uppercase, `0.22em`, faded, margin-bottom `56px`): `you will be {ageAtDeath} years old. this is the last day you are entitled to.`

**Layout (result-grid):** 2-column, `minmax(0, 1.55fr) minmax(280px, 1fr)`, gap `64px`. Below 980px viewport collapses to single column.

**Left column — life tiles:**
- Section label row (mono 11px uppercase `0.22em` faded, flex justify-between): left `life · one tile per week`, right `{livedWeeks} / {totalWeeks}`.
- Tiles grid: `display: grid; grid-template-columns: repeat(52, 1fr); gap: 2px;` with top + bottom 1px rule lines and `16px` vertical padding.
- Total tiles = `ceil((deathDate - dob) / 7 days)`. Lived tiles = `floor((now - dob) / 7 days)`, capped to total.
- Tile states (each tile is `aspect-ratio: 1/1`):
  - **Lived:** background `#15110c`, border same. Solid filled.
  - **Current week:** transparent background, 1px ink border + inset 1px ink box-shadow. Pulses via 1.6s ease-in-out infinite animation that toggles between transparent and solid ink.
  - **Remaining:** transparent background, 1px border `#d8ccb1`.
  - **Beyond total:** rendered with `visibility: hidden` to keep the grid rectangular when total weeks is not a multiple of 52.
- Legend row (mono 11px uppercase `0.18em` faded, gap `28px`, margin-top `14px`): four entries — swatch + label for `lived` (filled ink), `this week` (ink border), `remaining` (faded border), and right-aligned `{pct}% spent` (2 decimals).

**Right column — countdown:**
- Border-left 1px rule, padding-left `40px` (collapses on mobile).
- Section label row: left `time remaining`, right `· live`.
- Countdown grid: 2 columns, gap `20px 24px`. Six cells in this order: years, months, days, hours, minutes, seconds.
  - Number: mono, weight 300, size `48px`, line-height 1, `tabular-nums`. Comma-separated thousands. Seconds zero-padded to 2 digits, others not.
  - Label: mono 10px uppercase `0.22em` faded, margin-top `8px`.
- Compute breakdown via a calendar-aware approximation: `years = floor(totalDays / 365.25)`, then months from remainder using `30.4375` days/month, then days, then h/m/s from the millisecond remainder. Tick the clock with a 1s interval.
- Lived summary block below countdown: top 1px rule, padding-top `24px`, mono 12px, three rows (flex justify-between, key in uppercase mono 10px `0.18em` faded, value tabular-nums):
  - `days lived` → `{n.toLocaleString()}`
  - `days remaining` → `{(total - lived).toLocaleString()}`
  - `heartbeats spent (est.)` → `{round(livedSeconds * 72/60).toLocaleString()}` (assumes 72 bpm resting heart rate)

**Things you can still do (full-width, below the result-grid):**
- Top 1px ink border, padding-top `32px`.
- Header row (flex justify-between, end-aligned, wraps below 760px):
  - Title (serif, weight 400, `clamp(32px, 4vw, 48px)`, letter-spacing `-0.01em`, max-width `32ch`): `things you can still do, in the time you have left.` — the word "do" is italic.
  - Action buttons (gap `12px`): `another ten` and `show the other {n}` / `collapse`. Both are uppercase 12px `0.2em` `12px 18px` padding.
- List: 2-column CSS grid. Each row is 3 sub-cells: number (right-aligned mono 11px `0.18em` faded, 56px wide), centre block (count + label), trailing spacer.
  - Number: `{i+1}` zero-padded to 2 digits.
  - Count: serif, weight 500, size `36px`, line-height 1, letter-spacing `-0.01em`. If count < 1: faded color, italic.
  - Label: serif italic, 18px, color `#2b241a`, margin-top `6px`.
- Row borders: 1px rule color, bottom border on every row. Odd rows (1st column) also get a right border + `24px` right padding to act as the column divider.
- Below 760px viewport, list collapses to single column and the right border on odd rows is removed.
- "show the other N" expands a second list with the remaining ~41 items, fades in, has its own top 1px rule and `32px` margin-top.

**Footer:** Same as phase 1.

---

## Interactions & Behavior

- **DOB auto-advance:** When day field reaches 2 chars, focus moves to month. Same for month → year. Backspace does not auto-jump backwards.
- **CTA enable:** The button is disabled until DOB validates. On disabled click, nothing happens.
- **Submit:** On valid DOB submit, compute death date and transition `phase = 'rolling'`.
- **Death date generation:**
  - Lower bound: tomorrow (`now + 86400000ms`).
  - Upper bound: `min(dob + 120 years, now + 100 years)`.
  - If upper ≤ lower (already past 120 lifespan): give them between 6 and 36 months from now.
  - Otherwise pick a triangular-distributed time between bounds: `t = lo + (hi - lo) * (Math.random() + Math.random()) / 2`. This biases toward the middle of the remaining range so most rolls feel "natural" rather than always landing at age 119.
- **Reel sequencing:** All three reels start spinning together. They land at +2.6s, +3.1s, +3.7s respectively. After all three land, wait 600ms, then `phase = 'result'`.
- **Reel callback safety (important implementation note):** Each reel's effect must NOT depend on its `onLanded` callback. When one reel's landing triggers a parent state update, the parent re-creates callback refs; if the effect's deps include the callback, all sibling effects re-run mid-spin and snap their tracks back to start. Use a ref (`onLandedRef.current = onLanded`) and read through the ref inside the timeout. Only `[spinning, targetIndex, items, delay]` belong in the dep array.
- **Countdown ticker:** `setInterval(() => setNow(new Date()), 1000)` at the result level. Cleanup on unmount.
- **"Another ten":** Bumps a seed counter that triggers a fresh `shuffle().slice(0, 10)` of the things ledger. Collapses the "show the other N" panel if open.
- **"Show the other N":** Toggles a second list of all non-picked items.
- **Reset:** Clears DOB fields, error, dob/deathDate state, returns to phase `entry`.

## State Management

```ts
type Phase = 'entry' | 'rolling' | 'result';

interface AppState {
  phase: Phase;
  d: string;          // DD input
  m: string;          // MM input
  y: string;          // YYYY input
  error: string;      // empty when valid
  dob: Date | null;
  deathDate: Date | null;
}

interface ResultState {
  now: Date;          // ticked every 1s
}

interface ThingsState {
  seed: number;       // bump to reshuffle
  showAll: boolean;
}
```

No data fetching. No server. No persistence (intentional — the experience is meant to be ephemeral).

## Design Tokens

### Colors
| Token | Value | Use |
|---|---|---|
| `--paper`     | `#f3ede3` | Page background |
| `--paper-2`   | `#ebe3d4` | Reserved (deeper paper) |
| `--ink`       | `#15110c` | Primary text, borders, filled tiles |
| `--ink-2`     | `#2b241a` | Body copy, secondary text |
| `--faded`     | `#6b6357` | Eyebrow labels, mono captions, disabled |
| `--rule`      | `#cbc0a8` | Section dividers |
| `--rule-soft` | `#ddd2bc` | Lighter dividers |
| `--tile-empty`  | `#d8ccb1` | Empty-tile borders |
| `--tile-filled` | `#15110c` | Filled-tile fill |
| Error red     | `#8a2a1a` | DOB error message |

The body has two very subtle radial-gradient overlays (paper grain): `radial-gradient(circle at 20% 10%, rgba(20,15,10,0.025) 0%, transparent 50%)` and `radial-gradient(circle at 80% 70%, rgba(20,15,10,0.02) 0%, transparent 60%)`. Don't skip these — they're a big part of the "paper" feel.

### Typography
- **Serif:** EB Garamond (Google Fonts, weights 400 + 500 + 600, plus 400 italic). Used for everything except mono cases.
- **Mono:** JetBrains Mono (Google Fonts, weights 300 + 400 + 500). Used for: numerals (countdown, tabular data, dates in display strings only when explicitly mono), eyebrow labels, button microcopy in the "things" actions, year reel cells, all-uppercase tracked labels.
- Body base: 18px / 1.5.
- Selection: `::selection { background: ink; color: paper; }`.
- Letter-spacing convention: tight (`-0.01em` to `-0.02em`) on display serifs, loose (`0.18em` to `0.3em`) on uppercase mono labels.

### Spacing
- Page horizontal padding: `64px` desktop, `28px` mobile.
- Major section gap: `64px`.
- Between hero and masthead: `80px` margin-bottom.
- Result-grid gap: `64px` (`48px` mobile).
- Tile gap: `2px`. Reel cell height: `60px`. Frame height: `180px` (3 cells visible).
- Countdown grid gap: `20px 24px`.

### Borders / Radii / Shadows
- All borders: `1px solid` of the relevant token.
- Border-radius: **none anywhere.** The aesthetic is paper + ink — sharp edges everywhere. Inputs, buttons, tiles, frames, all square.
- Shadows: only `inset 0 0 0 1px var(--ink)` on the current-week tile (effectively a thicker border). No drop shadows anywhere.

### Animations
| Element | Duration | Easing |
|---|---|---|
| Reel spin | 2600ms + per-reel delay (0/500/1100) | `cubic-bezier(0.16, 0.84, 0.24, 1)` |
| Current-week tile pulse | 1.6s, infinite | `ease-in-out` |
| Phase fade-in (`.fade-in`) | 600ms | `ease`, with `translateY(6px) → 0` |
| Button hover | 180ms | `ease` (background, color, opacity) |

## Assets

- **Fonts:** EB Garamond + JetBrains Mono, both via Google Fonts. The prototype uses `@import url('https://fonts.googleapis.com/...')` at the top of `styles.css`. In a production codebase, prefer self-hosting via `next/font`, `@fontsource/...`, or whatever the codebase's font pipeline is.
- **Icons / images:** None. Intentional. Do not add any.

## The Things Ledger

The "things you can still do" data is in `source/things.js` as `window.LASTCLOCK_THINGS = [{ label, hoursEach }, ...]`. Port the array verbatim into a typed module (e.g. `things.ts`):

```ts
export interface Thing { label: string; hoursEach: number }
export const THINGS: Thing[] = [ /* 50+ entries — copy from things.js */ ];
```

Each entry's `hoursEach` is the **average total hours from zero to done** for one occurrence. Examples: `nights of sleep` = 8, `marathons run` = 600 (training + race), `businesses built` = 12,000, `summits of Everest` = 1,800. The display count is `hoursRemaining / hoursEach`.

**Number formatting:**
- `< 0.5` → `0`
- `0.5..1` → `< 1`
- `1..1000` → `floor(n).toLocaleString()`
- `1000..1e6` → same with thousands separators
- `1e6..1e9` → `(n/1e6).toFixed(1 or 2)` + `M`
- `≥ 1e9` → `(n/1e9).toFixed(2)` + `B`
- When count `< 1`, render in faded italic instead of full ink.

## Files in This Bundle

- `source/index.html` — entry HTML, script loading order
- `source/styles.css` — all styling, design tokens, layout
- `source/app.jsx` — top-level App, phase state machine, DOB validation, death-date picker, ResultView wrapper
- `source/reels.jsx` — `Reel` and `DateReels` components
- `source/tiles.jsx` — `TilesAndCountdown` (life-tiles grid + live countdown), duration-breakdown helpers
- `source/things-component.jsx` — `Things` component (10-pick + reroll + show-the-rest)
- `source/things.js` — the ledger data

Open `source/index.html` directly in a browser to see the prototype run.

## Implementation Tips

1. **Componentize matching the source split** — the four files (`reels`, `tiles`, `things`, `app`) each map to a clean component boundary. Don't merge them.
2. **Reel callbacks must use refs** — see "Reel callback safety" above. This is the one non-obvious bug to avoid.
3. **The countdown should not re-render the tiles every second.** Either memoize the tile grid on `[dob, deathDate, currentWeek]` (recompute only when the week changes), or split tiles + countdown into siblings each owning their own `now` if your framework's render cost makes this matter. The prototype does the simple thing (single `now`) and it's fine on modern hardware.
4. **Type the dates carefully.** All Date math here uses local time. The `startOfDay(d)` helper sets `setHours(0,0,0,0)` — use the same convention to avoid off-by-one on day counts across DST.
5. **Don't add a "share" or "save" feature** unless the user asks for one. The design is intentionally ephemeral.
6. **Don't soften the copy.** "everyone you know will die." is the headline. It is supposed to land hard. If a stakeholder pushes back, push back — the whole design is built around that single line.
