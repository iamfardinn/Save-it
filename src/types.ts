export interface Session {
  id: string;
  date: string;
  duration: number; // minutes
  notes: string;
  completionBefore: number;
  completionAfter: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  note: string;
  completionAt: number;
}

export interface VaultBackup {
  id: string;
  gameId: string;
  gameName: string;
  timestamp: string;
  isMilestone: boolean;
  note: string;
  completionAt: number;
}

export interface Game {
  id: string;
  name: string;
  genre: string;
  platform: string;
  accentColor: string;
  coverEmoji: string;
  playtime: number;
  lastPlayed: string;
  saveSize: string;
  isActive: boolean;
  completionPercent: number;
  status: "playing" | "completed" | "on-hold" | "dropped" | "backlog";
  sessions: Session[];
  milestones: Milestone[];
  exeName: string;        // e.g. "eldenring.exe"
  saveFolderPath: string; // e.g. "C:\Users\...\Documents\EldenRing"
}

// Auto-captured when a save file change is detected on disk
export interface SavePoint {
  id: string;
  gameId: string;
  gameName: string;
  fileName: string;   // exact save filename from disk
  filePath: string;
  timestamp: string;
  accentColor: string;
}
