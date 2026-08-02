import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Result } from "../domain/evaluate";
import type { Setup } from "../domain/types";
import { stepLine, verdictHeadline } from "./revealCopy";

export interface RevealProps {
  setup: Setup;
  result: Result;
  onTryAgain: () => void;
  // Omitted when this is the last setup in the ladder — Reveal then shows
  // only "Try again", which signals the ladder's end without a banned
  // "session complete" surface (ADR 0004).
  onNext?: () => void;
}

export function Reveal({ setup, result, onTryAgain, onNext }: RevealProps) {
  // Number the reds by their order of appearance in setup.balls, so the
  // coached line can say "red 1", "red 2", ... instead of the ambiguous
  // "red" that every red ball would otherwise share.
  const redNumbers = new Map<string, number>();
  let redCount = 0;
  for (const ball of setup.balls) {
    if (ball.kind === "red") {
      redCount += 1;
      redNumbers.set(ball.id, redCount);
    }
  }

  const nameOf = (id: string) => {
    const ball = setup.balls.find((b) => b.id === id);
    if (!ball) return id;
    if (ball.kind === "colour") {
      // colour balls always have a colour for data that passed through
      // parseSetup, but that invariant is only enforced at runtime — fall
      // back to a visible, non-throwing label rather than asserting it.
      return ball.colour ?? "colour";
    }
    return `red ${redNumbers.get(ball.id) ?? "?"}`;
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.headline}>{verdictHeadline(result)}</Text>
      <ScrollView style={styles.steps}>
        {result.steps.map((stepResult, i) => {
          const step = setup.coachedLine[i];
          const isTeachingMoment = result.firstDivergence === i;
          const chosenName = stepResult.chosen ? nameOf(stepResult.chosen) : null;
          return (
            <View
              key={i}
              style={[styles.step, isTeachingMoment && styles.teachingMoment]}
            >
              <Text style={styles.stepText}>
                {stepLine(i + 1, nameOf(step.ball), chosenName, stepResult.verdict)}
              </Text>
              {step.why && <Text style={styles.why}>{step.why}</Text>}
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={onTryAgain}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        {onNext && (
          <Pressable style={styles.button} onPress={onNext}>
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, padding: 16, backgroundColor: "#12241a" },
  headline: { color: "#f7f4ec", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  steps: { flex: 1 },
  step: { paddingVertical: 6 },
  teachingMoment: {
    borderLeftWidth: 3, borderLeftColor: "#f2c31b", paddingLeft: 8,
  },
  stepText: { color: "#f7f4ec", fontSize: 16 },
  why: { color: "#b9cbbf", fontSize: 14, fontStyle: "italic", marginTop: 2 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 16 },
  button: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: "#1d5fa8", alignItems: "center",
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
});
