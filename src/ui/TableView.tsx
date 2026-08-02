import React from "react";
import Svg, { Circle, Rect, Text as SvgText } from "react-native-svg";
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
}

export function TableView({
  balls, sequence, tappable, onTapBall, highlight,
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
        const order = sequence.indexOf(ball.id);
        const isTappable = tappable.includes(ball.id);
        const fill = ball.kind === "colour"
          ? (ball.colour ? BALL_FILL[ball.colour] : MISSING_COLOUR_FILL)
          : BALL_FILL[ball.kind];
        return (
          <React.Fragment key={ball.id}>
            <Circle
              cx={ball.x} cy={ball.y} r={BALL_RADIUS}
              fill={fill}
              stroke={highlight === ball.id ? "#ffffff" : isTappable ? "#ffffff" : "none"}
              strokeWidth={highlight === ball.id ? 10 : isTappable ? 4 : 0}
              opacity={
                isTappable || order !== -1 || ball.kind === "cue" || highlight === ball.id
                  ? 1
                  : 0.55
              }
              onPress={() => onTapBall(ball.id)}
            />
            {order !== -1 && (
              <SvgText
                x={ball.x} y={ball.y + BALL_RADIUS * 0.35}
                fontSize={BALL_RADIUS * 1.1} fontWeight="bold"
                fill="#ffffff" textAnchor="middle"
              >
                {order + 1}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
