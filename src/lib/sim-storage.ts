/**
 * Historical Simulation storage utilities - save/restore sim state to/from cookies
 */

const SIM_COOKIE_KEY = "historical_sim_state";
const COOKIE_EXPIRATION_DAYS = 7; // Cookie expires after 7 days

export function getSimStateFromCookie(): any {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === SIM_COOKIE_KEY) {
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (e) {
        console.error("Failed to parse sim state cookie:", e);
        return null;
      }
    }
  }
  return null;
}

export function saveSimStateToCookie(state: any): void {
  if (typeof document === "undefined") return;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + COOKIE_EXPIRATION_DAYS);

  const serialized = JSON.stringify(state);
  document.cookie = `${SIM_COOKIE_KEY}=${encodeURIComponent(
    serialized
  )}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
}

export function clearSimStateFromCookie(): void {
  if (typeof document === "undefined") return;

  document.cookie = `${SIM_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}
