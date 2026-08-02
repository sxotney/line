import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Result } from "../domain/evaluate";
import type { Setup } from "../domain/types";
import { stepLine, verdictHeadline } from "./revealCopy";

export interface RevealProps {
  setup: Setup;
  result: Result;
  onTryAgain: () => void;
  onNext: () => void;
}

export function Reveal({ setup, result, onTryAgain, onNext }: RevealProps) {
  const nameOf = (id: string) => {
    const ball = setup.balls.find((b) => b.id === id);
    if (!ball) return id;
    return ball.kind === "colour" ? ball.colour! : "red";
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.headline}>{verdictHeadline(result)}</Text>
      <ScrollView>
        {result.steps.map((stepResult, i) => {
          const step = setup.coachedLine[i];
          const isTeachingMoment = result.firstDivergence === i;
          return (
            <View
              key={i}
              style={[styles.step, isTeachingMoment && styles.teachingMoment]}
            >
              <Text style={styles.stepText}>
                {stepLine(i + 1, nameOf(step.ball), stepResult.verdict)}
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
        <Pressable style={styles.button} onPress={onNext}>
          <Text style={styles.buttonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flex: 1, padding: 16, backgroundColor: "#12241a" },
  headline: { color: "#f7f4ec", fontSize: 20, fontWeight: "700", marginBottom: 12 },
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
