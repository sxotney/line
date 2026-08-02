import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Result } from "../domain/evaluate";
import { strengthBand } from "../domain/leave";
import type { Setup } from "../domain/types";
import { ballNamer } from "./ballNames";
import { stepLine, verdictHeadline, type ShotWords } from "./revealCopy";
import { SPIN_WORD } from "./spinWords";
import { TableView } from "./TableView";

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
  const nameOf = ballNamer(setup);

  // Show the table with the COACHED order badged onto the balls, so every
  // "red 2" / "step 5" in the text has a visible referent. The ball at the
  // first divergence is highlighted — that is where to look.
  const coachedSequence = setup.coachedLine.map((step) => step.ball);
  const teachingBall =
    result.firstDivergence === null
      ? undefined
      : setup.coachedLine[result.firstDivergence]?.ball;

  return (
    <View style={styles.panel}>
      <View style={styles.table}>
        <TableView
          balls={setup.balls}
          sequence={coachedSequence}
          tappable={[]}
          onTapBall={() => {}}
          highlight={teachingBall}
        />
      </View>
      <Text style={styles.headline}>{verdictHeadline(result)}</Text>
      <ScrollView style={styles.steps}>
        {result.steps.map((stepResult, i) => {
          const step = setup.coachedLine[i];
          const isTeachingMoment = result.firstDivergence === i;
          const coached: ShotWords = {
            ball: nameOf(step.ball),
            strength: step.strength,
            spin: SPIN_WORD[step.spin],
          };
          const chosen: ShotWords | null = stepResult.chosen
            ? {
                ball: nameOf(stepResult.chosen.ball),
                // The copy speaks in bands, not raw slider values.
                strength: strengthBand(stepResult.chosen.strength),
                spin: SPIN_WORD[stepResult.chosen.spin],
              }
            : null;
          return (
            <View
              key={i}
              style={[styles.step, isTeachingMoment && styles.teachingMoment]}
            >
              <Text style={styles.stepText}>
                {stepLine(
                  i + 1, coached, chosen,
                  stepResult.verdict, stepResult.ballVerdict,
                )}
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
  table: { flex: 5, minHeight: 160 },
  headline: {
    color: "#f7f4ec", fontSize: 20, fontWeight: "700",
    marginTop: 8, marginBottom: 12,
  },
  steps: { flex: 4 },
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
