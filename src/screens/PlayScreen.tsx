import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SETUPS } from "../content/setups";
import { evaluate, type Result } from "../domain/evaluate";
import {
  appendShot, isLineComplete, tappableBalls, undoTap,
} from "../domain/planning";
import type { BallId, Shot, Spin } from "../domain/types";
import { nextIndex } from "../domain/ladder";
import { loadLadderIndex, saveLadderIndex } from "../state/ladderStorage";
import { ballNamer } from "../ui/ballNames";
import { Reveal } from "../ui/Reveal";
import { ShotPicker } from "../ui/ShotPicker";
import { TableView } from "../ui/TableView";

// Clamp a stored ladder index into the valid range for the current
// catalogue. A stored index can outlive the catalogue it was written
// against (setups removed, catalogue trimmed) — without this, SETUPS[index]
// is undefined and the screen renders blank with no way for the child to
// recover.
function clampToCatalogue(index: number): number {
  if (SETUPS.length === 0) return 0;
  return Math.min(Math.max(index, 0), SETUPS.length - 1);
}

export function PlayScreen() {
  const [index, setIndex] = useState(0);
  const [line, setLine] = useState<Shot[]>([]);
  // The ball just tapped, awaiting its strength + spin in the ShotPicker.
  const [pendingBall, setPendingBall] = useState<BallId | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    loadLadderIndex().then((loaded) => setIndex(clampToCatalogue(loaded)));
  }, []);

  const setup = SETUPS[index];
  if (!setup) return null;

  const done = isLineComplete(setup, line);
  const isLast = index >= SETUPS.length - 1;

  const restart = (nextSetupIndex: number) => {
    const clamped = clampToCatalogue(nextSetupIndex);
    setIndex(clamped);
    setLine([]);
    setPendingBall(null);
    setResult(null);
    void saveLadderIndex(clamped);
  };

  if (result) {
    return (
      <Reveal
        setup={setup}
        result={result}
        onTryAgain={() => { setLine([]); setPendingBall(null); setResult(null); }}
        onNext={
          isLast ? undefined : () => restart(nextIndex(index, SETUPS.length))
        }
      />
    );
  }

  const commitShot = (strength: number, spin: Spin) => {
    if (pendingBall === null) return;
    const shot: Shot = { ball: pendingBall, strength, spin };
    setLine((current) => appendShot(setup, current, shot));
    setPendingBall(null);
  };

  // TableView reports taps on every ball; only a legally tappable one opens
  // the picker. An illegal tap is ignored, matching appendShot's contract.
  const onTapBall = (ball: BallId) => {
    if (pendingBall === null && tappableBalls(setup, line).includes(ball)) {
      setPendingBall(ball);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.table}>
        <TableView
          balls={setup.balls}
          sequence={line.map((shot) => shot.ball)}
          tappable={pendingBall === null ? tappableBalls(setup, line) : []}
          onTapBall={onTapBall}
          highlight={pendingBall}
        />
      </View>
      {pendingBall !== null ? (
        <ShotPicker
          ballName={ballNamer(setup)(pendingBall)}
          onCommit={commitShot}
          onCancel={() => setPendingBall(null)}
        />
      ) : (
        <View style={styles.bar}>
          <Pressable
            style={styles.secondary}
            onPress={() => setLine(undoTap)}
            disabled={line.length === 0}
          >
            <Text style={styles.secondaryText}>Undo</Text>
          </Pressable>
          <Pressable
            style={[styles.primary, !done && styles.disabled]}
            onPress={() => setResult(evaluate(setup, line))}
            disabled={!done}
          >
            <Text style={styles.primaryText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0a1710" },
  table: { flex: 1 },
  bar: { flexDirection: "row", gap: 12, padding: 12 },
  secondary: {
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8,
    borderWidth: 1, borderColor: "#6f8579",
  },
  secondaryText: { color: "#d6e2da", fontSize: 16 },
  primary: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: "#1d5fa8", alignItems: "center",
  },
  disabled: { opacity: 0.4 },
  primaryText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
