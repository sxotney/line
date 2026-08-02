import { z } from "zod";
import {
  COLOURS, LESSONS, POCKETS, SPINS, STRENGTHS, type Setup,
} from "../domain/types";

const ballSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["red", "colour", "cue"]),
    colour: z.enum(COLOURS).optional(),
    x: z.number().finite(),
    y: z.number().finite(),
  })
  .refine((b) => b.kind !== "colour" || b.colour !== undefined, {
    message: "a colour ball must declare its colour",
  });

const stepSchema = z.object({
  ball: z.string().min(1),
  acceptable: z.array(z.string().min(1)).optional(),
  strength: z.enum(STRENGTHS),
  acceptableStrength: z.array(z.enum(STRENGTHS)).optional(),
  spin: z.enum(SPINS),
  acceptableSpin: z.array(z.enum(SPINS)).optional(),
  pocket: z.enum(POCKETS).optional(),
  acceptablePocket: z.array(z.enum(POCKETS)).optional(),
  why: z.string().optional(),
});

export const setupSchema = z
  .object({
    id: z.string().min(1),
    ladderIndex: z.number().int().nonnegative(),
    lesson: z.enum(LESSONS),
    title: z.string().optional(),
    balls: z.array(ballSchema).min(2),
    coachedLine: z.array(stepSchema).min(1),
  })
  .superRefine((setup, ctx) => {
    const ids = setup.balls.map((b) => b.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `duplicate ball ids: ${[...new Set(duplicates)].join(", ")}`,
      });
    }

    if (setup.balls.filter((b) => b.kind === "cue").length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "a setup must have exactly one cue ball",
      });
    }

    const byId = new Map(setup.balls.map((b) => [b.id, b]));

    setup.coachedLine.forEach((step, index) => {
      const referenced = [step.ball, ...(step.acceptable ?? [])];
      for (const ref of referenced) {
        if (!byId.has(ref)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `step ${index} references "${ref}", which is not on the table`,
          });
        }
      }

      const expected = index % 2 === 0 ? "red" : "colour";
      const ball = byId.get(step.ball);
      if (ball && ball.kind !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `step ${index} must alternate red then colour (expected a ${expected})`,
        });
      }
    });
  });

export function parseSetup(input: unknown): Setup {
  return setupSchema.parse(input);
}

export function parseSetups(input: unknown): Setup[] {
  return z.array(setupSchema).parse(input);
}
