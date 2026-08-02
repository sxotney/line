import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
import type { Point } from "../domain/leave";
import type { Ball, BallId } from "../domain/types";
import { TABLE } from "../domain/types";
import { BALL_RADIUS, CUSHION, POCKET_RADIUS, pocketCentres, viewBox } from "./geometry";
import { BALL_FILL, CLOTH, CUSHION_COLOUR, MISSING_COLOUR_FILL, POCKET } from "./palette";

export interface TableViewProps {
  balls: Ball[];
  sequence: BallId[];
  tappable: BallId[];
  onTapBall: (id: BallId) => void;
  highlight?: BallId | null;
  // Balls already down in the Simulated table (potted reds during
  // Planning). Ghosted, badge still readable. Colours never appear here —
  // they re-spot.
  potted?: BallId[];
  // The white's route for its latest move — animated when present, an
  // instant reposition when null (undo, Try again, a fresh Setup).
  cuePath?: Point[] | null;
}

const GHOST_OPACITY = 0.25;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The white travels its actual route to each new Leave — up to the contact
// point, off along the tangent/follow/screw line, off the cushion if hit —
// because following the move is half the teaching. With no path (undo, Try
// again, reload) it repositions instantly. Everything else on the table
// stays still, so only the cue ball pays for an animated wrapper.
function SlidingCueBall({
  x, y, fill, path,
}: { x: number; y: number; fill: string; path: Point[] | null }) {
  const position = useRef(new Animated.ValueXY({ x, y })).current;

  useEffect(() => {
    if (!path || path.length < 2) {
      position.setValue({ x, y });
      return;
    }
    position.setValue({ x: path[0]!.x, y: path[0]!.y });
    const segments = path.slice(1).map((point, i) => {
      const from = path[i]!;
      const distance = Math.hypot(point.x - from.x, point.y - from.y);
      return Animated.timing(position, {
        toValue: { x: point.x, y: point.y },
        // Pace by distance so a long run reads slower than a nudge.
        duration: Math.max(120, (distance / 2000) * 700),
        easing: Easing.linear,
        // SVG attributes can't ride the native driver.
        useNativeDriver: false,
      });
    });
    const run = Animated.sequence(segments);
    run.start();
    return () => run.stop();
  }, [position, x, y, path]);

  return (
    <AnimatedCircle cx={position.x} cy={position.y} r={BALL_RADIUS} fill={fill} />
  );
}

export function TableView({
  balls, sequence, tappable, onTapBall, highlight, potted = [], cuePath = null,
}: TableViewProps) {
  return (
    <Svg viewBox={viewBox()} width="100%" height="100%">
      <Rect
        x={-CUSHION} y={-CUSHION}
        width={TABLE.width + CUSHION * 2} height={TABLE.height + CUSHION * 2}
        fill={CUSHION_COLOUR}
      />
      <Rect x={0} y={0} width={TABLE.width} height={TABLE.height} fill={CLOTH} />

      {pocketCentres().map((p, i) => (
        <Circle key={`pocket-${i}`} cx={p.x} cy={p.y} r={POCKET_RADIUS} fill={POCKET} />
      ))}

      {balls.map((ball) => {
        // A re-spotted colour can appear more than once in the sequence
        // (e.g. black taken at positions 2, 4, 6) — show every position it
        // was tapped at, not just the first, so Alex can review his full
        // committed plan before pressing Done.
        const positions = sequence.reduce<number[]>((acc, id, i) => {
          if (id === ball.id) acc.push(i + 1);
          return acc;
        }, []);
        const isTappable = tappable.includes(ball.id);
        const isPotted = potted.includes(ball.id);
        const fill = ball.kind === "colour"
          ? (ball.colour ? BALL_FILL[ball.colour] : MISSING_COLOUR_FILL)
          : BALL_FILL[ball.kind];
        if (ball.kind === "cue") {
          return (
            <SlidingCueBall
              key={ball.id} x={ball.x} y={ball.y} fill={fill} path={cuePath}
            />
          );
        }
        return (
          <React.Fragment key={ball.id}>
            <Circle
              cx={ball.x} cy={ball.y} r={BALL_RADIUS}
              fill={fill}
              stroke={highlight === ball.id ? "#ffffff" : isTappable ? "#ffffff" : "none"}
              strokeWidth={highlight === ball.id ? 10 : isTappable ? 4 : 0}
              opacity={
                isPotted
                  ? GHOST_OPACITY
                  : isTappable || positions.length > 0 || highlight === ball.id
                    ? 1
                    : 0.55
              }
              onPress={() => onTapBall(ball.id)}
            />
            {positions.length > 0 && (
              <SvgText
                x={ball.x} y={ball.y + BALL_RADIUS * 0.35}
                fontSize={BALL_RADIUS * (positions.length > 1 ? 0.75 : 1.1)}
                fontWeight="bold"
                fill="#ffffff" textAnchor="middle"
                pointerEvents="none"
              >
                {positions.join("·")}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
