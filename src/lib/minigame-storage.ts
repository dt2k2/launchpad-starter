/**
 * Minigame storage utilities - save/restore game state to/from cookies
 */

const MINIGAME_COOKIE_KEY = "minigame_state";
const COOKIE_EXPIRATION_DAYS = 7; // Cookie expires after 7 days

interface SerializedGameState {
  currentStageIdx: number;
  currentQ: number;
  answered: boolean;
  lastCorrect: boolean | null;
  selected: unknown;
  hintUsed: boolean;
  contradiction: number;
  progress: number;
  stageScore: number;
  totalScore: number;
  status: Record<string, string>;
  stageResults: Record<string, { score: number; max: number } | null>;
  achievements: string[];
  phase: string;
}

export function getGameStateFromCookie(): SerializedGameState | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === MINIGAME_COOKIE_KEY) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error("Failed to parse minigame cookie:", e);
        return null;
      }
    }
  }
  return null;
}

export function saveGameStateToCookie(state: SerializedGameState): void {
  if (typeof document === "undefined") return;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + COOKIE_EXPIRATION_DAYS);

  const serialized = JSON.stringify(state);
  document.cookie = `${MINIGAME_COOKIE_KEY}=${encodeURIComponent(
    serialized
  )}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearGameStateFromCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${MINIGAME_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function serializeGameState(state: any): SerializedGameState {
  return {
    currentStageIdx: state.currentStageIdx,
    currentQ: state.currentQ,
    answered: state.answered,
    lastCorrect: state.lastCorrect,
    selected: state.selected,
    hintUsed: state.hintUsed,
    contradiction: state.contradiction,
    progress: state.progress,
    stageScore: state.stageScore,
    totalScore: state.totalScore,
    status: state.status,
    stageResults: state.stageResults,
    achievements: state.achievements,
    phase: state.phase,
  };
}
