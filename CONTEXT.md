# Line — Break-Building Trainer

A snooker break-building puzzle for Alex (10). Given a table position, he taps the
order he'd clear the balls; the app reveals the coached line and *why*. The point is
to move him from "see ball, pot ball" to planning a break before touching a ball.

## Language

**Setup**:
One puzzle — a table position (some reds, the six colours on their spots, and the cue
ball) together with its authored answer.
_Avoid_: puzzle, level, position, drill

**Coached line**:
The authored answer for a Setup: the ordered sequence `red → colour → red → colour …`
that we'd teach for this position.
_Avoid_: solution, correct order, the answer

**Step**:
One link in the Coached line — a target ball, an optional set of *also-acceptable*
balls, and an optional *why*.
_Avoid_: move, turn, node

**Alex's line**:
The order Alex actually taps for a Setup.
_Avoid_: attempt, guess, answer

**Acceptable set**:
The balls that count as a valid choice at a given Step — the coached ball plus any
alternatives judged genuinely fine. Choosing one that isn't the coached ball is an
_alternative_, not a mistake.
_Avoid_: alternatives list, options

**Divergence**:
The first Step where Alex chooses a ball outside that Step's Acceptable set. The single
teaching moment the Reveal centres on.
_Avoid_: error, wrong move, mistake, fail

**Reveal**:
The post-commit teaching screen: the Coached line stepped through with its reasoning,
Alex's line shown against it, the Divergence highlighted.
_Avoid_: results, feedback, answer screen

**Ladder**:
The catalogue of Setups held in a deliberate easy→hard order. Walked in sequence, never
gated — Alex can always move on.
_Avoid_: levels, difficulty, stages

**Re-spot**:
A potted colour returns to its own spot before the next red, so the same colour can be
taken again later in the same line. (Standard snooker; modelled faithfully.)

**Shot**:
One entry in Alex's line: the ball he taps plus the Strength and Spin he'd play it
with. (M2 — before M2 a line entry was just the ball.)

**Strength**:
How hard the shot is played. Alex sets it on a continuous slider (0–100); coaching and
judging happen in three named bands — `soft`, `medium`, `firm` — marked on the track.
(M3 — in M2 it was three buttons.)
_Avoid_: pace, power

**Strength band**:
The named zone a slider value falls in: `soft` [0–33], `medium` (33–66], `firm` (66–100].
Steps coach a band; the Reveal judges Alex's band against it. The raw value drives the
Leave.
_Avoid_: bucket, zone, level

**Spin**:
Where the cue strikes vertically: `low`, `centre`, or `top`. The UI displays the real
snooker words — screw, stun, top — but they stay display language only. Kid-sized
deliberately — no side spin, no 13-cell grid.
_Avoid_: tip, screw/stun/follow as field values

**Leave**:
Where a Shot leaves the white — the predicted resting spot of the cue ball, computed by
a kid-plausible heuristic (pot always succeeds; tangent line bent by Spin; distance from
Strength). Standard snooker usage: "a good leave".
_Avoid_: cue position, prediction, outcome

**Simulated table**:
The table state during Planning after replaying Alex's shots so far: every chosen ball
is potted (reds ghost, colours re-spot), and the white sits at the latest Leave. Display
only — never judged, never compared to the Coached line before Done.
_Avoid_: preview, feedback
