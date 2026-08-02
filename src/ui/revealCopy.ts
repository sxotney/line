import type { Result } from "../domain/evaluate";
import type { Lesson } from "../domain/types";

// The Reveal opens by naming what the position was for — the coach
// framing the lesson, never a category label (ADR 0004). The enum's
// kebab-case must never surface.
const LESSON_LINE: Record<Lesson, string> = {
  "positional-play":
    "This one was about position — leaving the white somewhere the next shot is easy.",
  cluster:
    "This one was about the cluster — when to open it, and when to leave it alone.",
  "cushion-work":
    "This one was about the cushions — letting the white run off them to where you need it.",
  "awkward-ball-first":
    "This one was about the awkward ball — taking it early, while you still have the angle.",
  "colour-choice":
    "This one was about choosing the right colour after each red.",
};

export function lessonLine(lesson: Lesson): string {
  return LESSON_LINE[lesson];
}

export function verdictHeadline(result: Result): string {
  if (result.firstDivergence !== null) {
    return "Good thinking. Here's the cleaner line.";
  }
  if (result.steps.some((s) => s.verdict === "alternative")) {
    return "Even better — that's a line Brian would like.";
  }
  return "That's the line.";
}

// Everything the copy needs to describe one shot, already in words —
// the ball name comes from ballNamer, strength/spin/pocket are their own
// words. Pocket words are set only when the Step authored a pocket (so
// the axis was judged); unauthored steps never mention one.
export interface ShotWords {
  ball: string;
  strength: string;
  spin: string;
  pocket?: string;
}

const describe = (shot: ShotWords) =>
  `${shot.ball} · ${shot.strength} · ${shot.spin}`;

const pocketDiffers = (coached: ShotWords, chosen: ShotWords | null) =>
  Boolean(coached.pocket && chosen?.pocket && coached.pocket !== chosen.pocket);

// " into the top right" — appended only where the pocket carries teaching.
const into = (shot: ShotWords) => (shot.pocket ? ` into the ${shot.pocket}` : "");

// The parts of the coached shot the chosen shot differs on — so the
// reference in brackets stays short: "(coached: soft)" not the full triple.
function differingParts(coached: ShotWords, chosen: ShotWords): string {
  const parts: string[] = [];
  if (chosen.ball !== coached.ball) parts.push(coached.ball);
  if (chosen.strength !== coached.strength) parts.push(coached.strength);
  if (chosen.spin !== coached.spin) parts.push(coached.spin);
  if (pocketDiffers(coached, chosen)) parts.push(coached.pocket!);
  return parts.join(" · ");
}

export function stepLine(
  position: number,
  coached: ShotWords,
  chosen: ShotWords | null,
  verdict: Result["steps"][number]["verdict"],
  ballVerdict: Result["steps"][number]["ballVerdict"],
): string {
  if (verdict === "matched") return `${position}. ${describe(coached)}`;

  const differ = pocketDiffers(coached, chosen);

  if (verdict === "alternative") {
    // Alex's own choice is the whole point of this branch (ADR 0004) — lead
    // with what he picked, keep the coached reference short.
    const picked = chosen ?? coached;
    return `${position}. ${describe(picked)}${differ ? into(picked) : ""} — also fine (coached: ${
      differingParts(coached, picked) || describe(coached)
    })`;
  }

  // divergence: the coached shot is the subject. "Take this one instead"
  // only makes sense when the BALL diverged; when the ball was right and
  // the strength/spin/pocket let it down, say so instead.
  const subject = `${position}. ${describe(coached)}${differ ? into(coached) : ""}`;
  const went = chosen
    ? ` (you went for ${describe(chosen)}${differ ? into(chosen) : ""})`
    : "";
  if (ballVerdict === "divergence" && chosen) {
    return `${subject} — take this one instead${went}`;
  }
  if (chosen) {
    return `${subject} — right ball, play it like this${went}`;
  }
  return subject;
}
