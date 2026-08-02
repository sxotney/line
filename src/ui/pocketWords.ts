import type { Pocket } from "../domain/types";

// The UI speaks plain words — "top right", never kebab-case ids.
export const POCKET_WORD: Record<Pocket, string> = {
  "top-left": "top left",
  "top-middle": "top middle",
  "top-right": "top right",
  "bottom-left": "bottom left",
  "bottom-middle": "bottom middle",
  "bottom-right": "bottom right",
};
