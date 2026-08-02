import React, { useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { SPINS, STRENGTHS, type Spin } from "../domain/types";

export interface ShotPickerProps {
  ballName: string;
  onCommit: (strength: number, spin: Spin) => void;
  onCancel: () => void;
}

const clamp = (value: number) => Math.min(100, Math.max(0, value));

// The strength slider: a continuous 0–100 track with the three Strength
// bands marked on it. Dragging (or tapping) moves the thumb; releasing
// counts as "strength chosen". The raw value drives the Leave; judging
// happens band-to-band (CONTEXT.md, "Strength band").
function StrengthSlider({
  value,
  chosen,
  onChange,
  onChosen,
}: {
  value: number;
  chosen: boolean;
  onChange: (value: number) => void;
  onChosen: (value: number) => void;
}) {
  const trackWidth = useRef(0);
  const grabValue = useRef(0);
  const currentValue = useRef(value);

  // The responder is created once, so its handlers must read the latest
  // callbacks through refs — capturing them directly would freeze the
  // first render's closures (and, e.g., never commit in the spin-first
  // flow because that closure still sees spin === null).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onChosenRef = useRef(onChosen);
  onChosenRef.current = onChosen;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const width = trackWidth.current;
        if (width <= 0) return;
        const next = clamp((evt.nativeEvent.locationX / width) * 100);
        grabValue.current = next;
        currentValue.current = next;
        onChangeRef.current(next);
      },
      onPanResponderMove: (_evt, gesture) => {
        const width = trackWidth.current;
        if (width <= 0) return;
        const next = clamp(grabValue.current + (gesture.dx / width) * 100);
        currentValue.current = next;
        onChangeRef.current(next);
      },
      onPanResponderRelease: () => onChosenRef.current(currentValue.current),
      onPanResponderTerminate: () => onChosenRef.current(currentValue.current),
    }),
  ).current;

  return (
    <View>
      <View
        style={styles.track}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
        {...pan.panHandlers}
      >
        {/* Band dividers at the soft/medium and medium/firm boundaries. */}
        <View style={[styles.divider, { left: "33%" }]} />
        <View style={[styles.divider, { left: "66%" }]} />
        <View
          style={[
            styles.thumb,
            { left: `${value}%` },
            !chosen && styles.thumbUnchosen,
          ]}
        />
      </View>
      <View style={styles.bandLabels}>
        {STRENGTHS.map((band) => (
          <Text key={band} style={styles.bandLabel}>{band}</Text>
        ))}
      </View>
    </View>
  );
}

// Shown after a ball is tapped: pick how the shot is played. Committing
// happens the moment both a strength and a spin are chosen — no extra
// confirm tap for a 10-year-old to forget.
export function ShotPicker({ ballName, onCommit, onCancel }: ShotPickerProps) {
  const [strength, setStrength] = useState(50);
  const [strengthChosen, setStrengthChosen] = useState(false);
  const [spin, setSpin] = useState<Spin | null>(null);

  // Receives the released slider value directly rather than reading state,
  // so a fast tap-and-release can't commit a value one render behind.
  const chooseStrength = (value: number) => {
    if (spin !== null) {
      onCommit(value, spin);
      return;
    }
    setStrength(value);
    setStrengthChosen(true);
  };

  const pickSpin = (s: Spin) => {
    if (strengthChosen) {
      onCommit(strength, s);
      return;
    }
    setSpin(s);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{ballName} — how do you play it?</Text>
      <StrengthSlider
        value={strength}
        chosen={strengthChosen}
        onChange={setStrength}
        onChosen={chooseStrength}
      />
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
  track: {
    height: 44, borderRadius: 8, justifyContent: "center",
    backgroundColor: "#1c3527",
  },
  divider: {
    position: "absolute", top: 8, bottom: 8, width: 1,
    backgroundColor: "#6f8579",
  },
  thumb: {
    position: "absolute", top: 4, width: 36, height: 36, borderRadius: 18,
    marginLeft: -18, backgroundColor: "#1d5fa8",
    borderWidth: 2, borderColor: "#f7f4ec",
  },
  thumbUnchosen: { opacity: 0.5 },
  bandLabels: { flexDirection: "row", marginTop: 2 },
  bandLabel: { flex: 1, textAlign: "center", color: "#b9cbbf", fontSize: 13 },
  option: {
    flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: "center",
    borderWidth: 1, borderColor: "#6f8579",
  },
  selected: { backgroundColor: "#1d5fa8", borderColor: "#1d5fa8" },
  optionText: { color: "#f7f4ec", fontSize: 16 },
  cancel: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 4 },
  cancelText: { color: "#b9cbbf", fontSize: 14 },
});
