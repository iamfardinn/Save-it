import type { Game, VaultBackup, SavePoint } from "./types";

const GAMES_KEY    = "saveit_games";
const VAULT_KEY    = "saveit_vault";
const SAVES_KEY    = "saveit_savepoints";

// ─── Empty start ──────────────────────────────────────────────────────────────
const EMPTY_GAMES: Game[] = [];
const EMPTY_VAULT: VaultBackup[] = [];
const EMPTY_SAVES: SavePoint[] = [];

// ─── Games ───────────────────────────────────────────────────────────────────
export function loadGames(): Game[] {
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    if (!raw) return EMPTY_GAMES;
    const parsed: Game[] = JSON.parse(raw);
    // Migrate old records that lack new fields
    return parsed.map(g => ({
      exeName: "",
      saveFolderPath: "",
      ...g,
    }));
  } catch { return EMPTY_GAMES; }
}
export function saveGames(games: Game[]) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

// ─── Vault ───────────────────────────────────────────────────────────────────
export function loadVault(): VaultBackup[] {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : EMPTY_VAULT;
  } catch { return EMPTY_VAULT; }
}
export function saveVault(vault: VaultBackup[]) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
}

// ─── Save Points (auto-detected) ─────────────────────────────────────────────
export function loadSavePoints(): SavePoint[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    return raw ? JSON.parse(raw) : EMPTY_SAVES;
  } catch { return EMPTY_SAVES; }
}
export function storeSavePoints(points: SavePoint[]) {
  localStorage.setItem(SAVES_KEY, JSON.stringify(points));
}

// ─── Util ─────────────────────────────────────────────────────────────────────
export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
