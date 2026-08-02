import AsyncStorage from "@react-native-async-storage/async-storage";

export const LADDER_KEY = "line.ladderIndex.v1";

export async function loadLadderIndex(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(LADDER_KEY);
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export async function saveLadderIndex(index: number): Promise<void> {
  try {
    await AsyncStorage.setItem(LADDER_KEY, String(index));
  } catch {
    // Storage is a convenience, not a requirement — never block play.
  }
}
