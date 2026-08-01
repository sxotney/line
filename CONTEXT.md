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
