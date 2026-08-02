# The simulated Leave during Planning is not feedback

From M3 the table reacts during Planning: each committed Shot pots its ball and slides
the white to its predicted Leave, so Alex plans the next ball from the updated position.
This is the first time anything on the table changes in response to his choices before
Done — which looks, at a glance, like a breach of ADR 0002 (no feedback before commit).

It isn't, and this ADR records the line we're holding.

## The distinction

ADR 0002 bans **correctness signals**: anything that tells Alex whether a choice was
good before he commits the whole line. The Leave is a **consequence signal**: it shows
what his choice *does*, not whether it was *right*.

- The white moves identically whatever he picks — a poor shot and a coached shot are
  rendered with exactly the same mechanics, tone, and visual treatment.
- Nothing during Planning ever references the Coached line: no comparison, no highlight,
  no nudge toward the coached ball, strength, or spin.
- The pot always succeeds, deliberately. If pots could miss, the simulation would start
  scoring his choices ("that one's too thin") — that is feedback, and it's out.

At a real table this information is free: you hit the shot and watch where the white
goes. Hiding it made sense when a line entry was just a ball; now that a Shot carries
strength and spin, position play *is* the lesson, and planning blind would train
guesswork rather than break-building.

## Consequences

- `evaluate()`, the Reveal, and judging are untouched by the simulation. The Leave is
  computed by a pure display-side fold (`simulateLine`) and never feeds the Result.
- The heuristic must stay deterministic and neutral. Any future "wobble", miss chance,
  or quality-of-shot rendering during Planning must come back through this ADR.
- If a future Setup's teaching depends on *not* seeing the Leave (e.g. a visualisation
  exercise), that Setup needs a new mechanism — do not weaken this one.
