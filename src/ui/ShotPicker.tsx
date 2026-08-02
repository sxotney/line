import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SPINS, STRENGTHS, type Spin, type Strength,
} from "../domain/types";

export interface ShotPickerProps {
  ballName: string;
  onCommit: (strength: Strength, spin: Spin) => void;
  onCancel: () => void;
}

// Shown after a ball is tapped: pick how the shot is played. Committing
// happens the moment both a strength and a spin are chosen — no extra
// confirm tap for a 10-year-old to forget.
export function ShotPicker({ ballName, onCommit, onCancel }: ShotPickerProps) {
  const [strength, setStrength] = useState<Strength | null>(null);
  const [spin, setSpin] = useState<Spin | null>(null);

  const pickStrength = (s: Strength) => {
    if (spin !== null) {
      onCommit(s, spin);
      return;
    }
    setStrength(s);
  };

  const pickSpin = (s: Spin) => {
    if (strength !== null) {
      onCommit(strength, s);
      return;
    }
    setSpin(s);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{ballName} — how do you play it?</Text>
      <View style={styles.row}>
        {STRENGTHS.map((s) => (
          <Pressable
            key={s}
            style={[styles.option, strength === s && styles.selected]}
            onPress={() => pickStrength(s)}
          >
            <Text style={styles.optionText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {SPINS.map((s) => (
          <Pressable
            key={s}
            style={[styles.option, spin === s && styles.selected]}
            onPress={() => pickSpin(s)}
          >
            <Text style={styles.optionText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.cancel} onPress={onCancel}>
        <Text style={styles.cancelText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 12, gap: 8 },
  title: { color: "#f7f4ec", fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", gap: 8 },
  option: {
    flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center",
    borderWidth: 1, borderColor: "#6f8579",
  },
  selected: { backgroundColor: "#1d5fa8", borderColor: "#1d5fa8" },
  optionText: { color: "#f7f4ec", fontSize: 16 },
  cancel: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 4 },
  cancelText: { color: "#b9cbbf", fontSize: 14 },
});
