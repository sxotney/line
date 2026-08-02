# Line — Design Spec (MVP)

> A snooker break-building trainer for Alex (10). He taps the order he'd clear a table;
> the app reveals the coached line and *why*. Goal: move him from "see ball, pot ball"
> to planning a break before touching a ball.
>
> Terms in **bold** are defined in [`CONTEXT.md`](../CONTEXT.md). Load-bearing decisions
> are recorded in [`docs/adr/`](./adr/).

## 1. Purpose & the gap it targets

Alex is talented but sees-and-shoots. He doesn't plan a break — he pots whatever's
nearest or always goes for the black. **Line** trains the one decision that fixes this:
*given the whole table, what order do you take the balls, and which colour do you go to
after each red?* It teaches by showing him the **Coached line** and the reasoning after
he commits his own.

## 2. Scope

### In scope (MVP)
- **Sequencing** mechanic, red-then-colour interleave: `red → colour → red → colour …`.
- Small **Setups**: 3–4 reds + the six colours on their spots + cue ball shown as context.
- **Commit-then-reveal** (ADR 0002): plan the whole line, hit Done, then the **Reveal**.
- **Acceptable set** flexibility (see §5): valid alternatives are "even better",
  not mistakes.
- **Teacher-first Reveal** with per-Step reasoning; **score hidden** (ADR 0004).
- **Ladder**: curated easy→hard order, walked in sequence, never gated.
- **Landscape** full snooker table, snooker palette, `react-native-svg`.
- Content as typed JSON, bundled, validated at load (ADR 0003).
- Delivered as **Expo web export on GitHub Pages** (ADR 0001).

### Added in M2 (2026-08-02)
- **Shots**: each line entry is now a Shot — ball + Strength (`soft/medium/firm`) +
  Spin (`low/centre/top`). Kid-sized 3×3 deliberately (no side, no 13-cell grid).
- The ShotPicker appears after each ball tap; committing happens when both a strength
  and a spin are chosen. Undo cancels the pending pick first, then removes shots.
- Steps author coached `strength`/`spin` with optional `acceptableStrength`/
  `acceptableSpin` — judged per axis in the Reveal with the same
  matched / alternative / divergence treatment as the ball.
- The Reveal shows the table with the coached order badged on the balls and the
  teaching-moment ball highlighted.

### Added in M3 (2026-08-02) — the Leave and the strength slider

- **The Leave**: after each committed Shot during Planning, the white slides to where
  that shot would probably leave it, so Alex plans every next ball from the updated
  position — real position-play thinking. Computed by a kid-plausible heuristic
  (`predictLeave`, pure, in `src/domain/`):
  - The pot **always succeeds** — every ball Alex chooses is treated as potted. The
    natural pocket is the one with the straightest cut angle from the white (ties →
    nearest).
  - The white arrives at the ghost-ball contact point and leaves along the tangent line
    (`centre`), bent forward toward the pot line (`top`) or pulled back (`low`).
    Dead-straight pots: stun stops at contact, top follows through, low screws back.
  - Travel distance scales continuously with the raw Strength value; at most one cushion
    reflection, then stop, always clamped inside the cushions.
  - `simulateLine(setup, shots)` replays the whole line from the start — the **Simulated
    table**: potted reds ghost (sequence badges stay readable), colours re-spot, white at
    the latest Leave. Derived state — undo and Try again just re-fold a shorter line.
- **Strength slider** (replaces M2's three buttons): a continuous 0–100 slider with the
  three bands marked on the track. Steps still coach a band (`soft`/`medium`/`firm` +
  `acceptableStrength`); judging buckets Alex's value via `strengthBand()` and compares
  band-to-band as in M2. The raw value drives the Leave, so the same shot at 40 vs 55
  visibly changes where the white ends up.
- The Leave is **display only** (ADR 0005): it reflects Alex's plan identically whatever
  he picks, is never compared to the Coached line during Planning, and `evaluate()` and
  the Reveal are unchanged by it.

### Out of scope — deliberately deferred
- In-app editor (ADR 0003) · cue-ball position / "where you leave it" · side spin ·
  the final colour clearance (yellow→black, a fixed order — a position exercise, not
  sequencing) · procedural generation · difficulty picker / levels UI ·
  streaks/points/badges/% · accounts/backend · native Android build (one command away).

## 3. The break-building model (rules fidelity)

- A Setup's table = N reds (3–4), the six colours **on their own spots**, one cue ball.
- The line alternates **red then colour**: after a red, Alex chooses a colour; after a
  colour, a red; and so on until the reds run out. The final Step is the last red's colour.
- Potted colours **re-spot** — the same colour can be taken again later in the line.
- The tap flow **enforces alternation**: in a red-Step only reds are tappable; in a
  colour-Step only colours are tappable. (This removes an entire class of invalid input
  and keeps the mechanic honest.)
- Colours are always on-spot in MVP (no off-spot colours). Cue ball is drawn for context
  only; Alex never places it.

## 4. Architecture — four pieces

```
Content (data + schema + validator)
        │  loads a Setup
        ▼
Play screen (state machine: Planning → Committed → Reveal)
        │  hands (Setup, Alex's line) to ──▶ Evaluator (pure)
        │  ◀── Result
        ▼
Table renderer (react-native-svg)  +  Reveal component
        │
        ▼
Ladder navigation (walk in order, Next / Try again; position stored internally)
```

### 4.1 Content
- `Setup` shape (see §5). Setups live in a bundled data module (e.g. `content/setups.ts`
  or JSON + types).
- A **runtime validator** (e.g. Zod, or hand-rolled) checks each Setup on load: alternation
  well-formed, every Step's ball exists on the table, ball ids unique, colours on valid
  spots. Invalid content fails loudly in dev, never renders a broken table.

### 4.2 Evaluator — the deep module (built first, TDD)
- Signature: `evaluate(setup: Setup, alexLine: BallId[]): Result`.
- **Pure. No UI, no state, no storage.** This is the heart of the app and where the TDD
  flow earns its keep — a small function with a rich truth table.
- `Result` = for each Step: `matched` (coached ball) | `alternative` (in the Acceptable
  set, not the coached ball) | `divergence` (outside the set); plus the index of the
  **first Divergence** (or none), and a `complete` flag.
- Only the *first* Divergence is the teaching focus; Steps after it are still reported but
  the Reveal centres the first one.

### 4.3 Table renderer
- Ports Paths' geometry (12×6 play area, pockets, cushions, spots, the D) but **landscape**
  (long axis horizontal) to fit the Chromebook.
- Renders reds, colours-on-spots, cue ball (snooker palette, flat discs — Settle/Paths
  lineage), tap targets, sequence badges (1,2,3… on tapped balls), and Reveal overlays.
- Only the currently-tappable balls are active during Planning (per §3 alternation).

### 4.4 Play screen (state machine)
- **Planning** — table live; tapping appends to Alex's line under the alternation rule;
  an undo (remove last tap) and a **Done** (enabled once the line is complete). No feedback.
- **Committed → Reveal** — call `evaluate`, transition to Reveal.
- **Reveal** — see §6. Buttons: **Try again** (same Setup, clears Alex's line) and
  **Next** (advance the Ladder).

### 4.5 Ladder navigation
- Setups ordered by an authored `ladderIndex`. "Next" walks the order; wraps or stops at
  the end (TBD trivial). Current position persisted (AsyncStorage / localStorage on web).
  **No visible stats or "X of N".**

## 5. Data model

```ts
type BallId = string;              // unique within a Setup, e.g. "r1", "black"
type Colour = "yellow" | "green" | "brown" | "blue" | "pink" | "black";

interface Ball {
  id: BallId;
  kind: "red" | "colour" | "cue";
  colour?: Colour;                 // required when kind === "colour"
  x: number; y: number;            // mm on the play area (Paths coordinate system)
}

interface Step {
  ball: BallId;                    // the coached choice at this step
  acceptable?: BallId[];           // also-valid choices (coached ball implicitly included)
  why?: string;                    // shown in the Reveal for key decisions
}

interface Setup {
  id: string;
  ladderIndex: number;             // position in the easy→hard Ladder
  title?: string;                  // internal label, not shown to Alex
  balls: Ball[];                   // reds + 6 colours on spots + 1 cue
  coachedLine: Step[];             // alternating red/colour, length = 2 * (#reds)
}
```

Notes:
- The coached ball is always a valid choice even if `acceptable` is omitted.
- `coachedLine` alternates kinds starting with a red; the validator enforces this.
- Colours re-spot, so the same colour id may appear in multiple colour-Steps.

## 6. The Reveal (the product)

After Done, the Reveal steps through the Coached line:
- For each Step, show the coached ball and, on key Steps, its **why** ("take the awkward
  red first while you've got the angle", "don't touch the pack until you're on the blue").
- Mark each of Alex's choices as **matched**, **alternative** ("even better — that's a
  line Brian would like"), or the **Divergence** ("here's the cleaner line, and why").
- Tone is teacher, warm, never a buzzer (ADR 0002, 0004). The **alternative** branch is
  the app's whole reward mechanism — praise the *thinking*.
- No score, %, streak, or "complete" surface.

## 7. Testing strategy

- **Evaluator first, TDD** (Matt Pocock red-green-refactor): exhaustive truth table —
  exact match; a valid alternative mid-line; a Divergence at step k; alternation edge
  cases; re-spotted colour reused; short/long lines.
- **Validator**: rejects malformed Setups (bad alternation, missing ball, dup id).
- **Renderer / screens**: lighter — smoke/interaction tests that a full line can be tapped
  and Done triggers a Reveal. UI is deliberately thin over the Evaluator.

## 8. Delivery & project shape

- Expo RN + TypeScript in `~/code/puzzles`. `react-native-svg` for the table.
- Dev: `expo start` → `w` (browser) or Expo Go on Carl's phone.
- Ship: `expo export --platform web` → GitHub Pages → Alex's bookmarked URL. `git push`
  → live in ~1 min (Settle/Paths loop preserved).
- Content authored with Claude in the vault, reviewed in-app by loading the Setup.

## 9. Open / deferred calibration
- Exact landscape table proportions and tap-target sizes for a Chromebook screen.
- Whether "Next" wraps at the end of the Ladder or stops.
- The name **Line** (vs Runout / Clearance / Sequence) — provisionally **Line**.
- Whether `~/code/puzzles` stays a single-app root or later becomes a container for
  multiple puzzle apps (revisit only if a second puzzle app appears).
