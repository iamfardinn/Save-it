import { useEffect, useState, useCallback, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Gamepad2, History, Minus, Square, X, Plus, Search, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import GameCard from "./components/GameCard";
import GameDetail from "./components/GameDetail";
import AddGameModal from "./components/AddGameModal";
import StatsPanel from "./components/StatsPanel";
import NowPlayingBanner from "./components/NowPlayingBanner";
import SavePointsList from "./components/SavePointsList";
import DetectedGameToast from "./components/DetectedGameToast";

import type { Game, VaultBackup, SavePoint } from "./types";
import { loadGames, saveGames, loadVault, saveVault, loadSavePoints, storeSavePoints, generateId } from "./store";
import { lookupGame } from "./gamedb";
import "./App.css";

let appWindow: any = null;
try { appWindow = getCurrentWindow(); } catch {}

const STATUS_FILTERS = ["All", "Playing", "Completed", "On Hold", "Dropped", "Backlog"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

// Payload emitted by Rust when a save file is detected
interface SaveDetectedPayload {
  game_id:    string;
  file_name:  string;
  file_path:  string;
  timestamp:  string;
}

function App() {
  const [view,           setView]          = useState<"library" | "vault">("library");
  const [vaultTab,       setVaultTab]      = useState<"saves" | "milestones">("saves");
  const [games,          setGames]         = useState<Game[]>(loadGames);
  const [vault,          setVault]         = useState<VaultBackup[]>(loadVault);
  const [savePoints,     setSavePoints]    = useState<SavePoint[]>(loadSavePoints);
  const [selectedGame,   setSelectedGame]  = useState<Game | null>(null);
  const [showAddModal,   setShowAddModal]  = useState(false);
  const [nowPlaying,     setNowPlaying]    = useState<Game | null>(null);
  const [search,         setSearch]        = useState("");
  const [statusFilter,   setStatusFilter]  = useState<StatusFilter>("All");
  // Auto-detected game (not yet in library)
  const [detectedGame,   setDetectedGame]  = useState<{ name: string; exe: string } | null>(null);
  const ignoredExes      = useRef<Set<string>>(new Set()); // dismissed by user

  // Persist on change
  useEffect(() => { saveGames(games); }, [games]);
  useEffect(() => { saveVault(vault); }, [vault]);
  useEffect(() => { storeSavePoints(savePoints); }, [savePoints]);

  // Keep selectedGame in sync when games update
  useEffect(() => {
    if (selectedGame) {
      const updated = games.find(g => g.id === selectedGame.id);
      if (updated) setSelectedGame(updated);
    }
  }, [games]);

  // ── Start watching save folders for all games that have one ─────────────────
  const watchedGames = useRef<Set<string>>(new Set());
  useEffect(() => {
    games.forEach(async (game) => {
      if (game.saveFolderPath && !watchedGames.current.has(game.id)) {
        try {
          await invoke("start_watching_game", {
            gameId:      game.id,
            saveFolder:  game.saveFolderPath,
          });
          watchedGames.current.add(game.id);
          console.log(`Watching saves for ${game.name}`);
        } catch (err) {
          console.warn(`Could not watch ${game.name}:`, err);
        }
      }
    });
  }, [games]);

  // ── Listen for save-detected events from Rust watcher ──────────────────────
  useEffect(() => {
    let unlisten: any;
    const setup = async () => {
      try {
        unlisten = await listen<SaveDetectedPayload>("save-detected", (event) => {
          const { game_id, file_name, file_path, timestamp } = event.payload;
          const game = games.find(g => g.id === game_id);
          if (!game) return;

          const point: SavePoint = {
            id:          generateId(),
            gameId:      game_id,
            gameName:    game.name,
            fileName:    file_name,
            filePath:    file_path,
            timestamp,
            accentColor: game.accentColor,
          };

          setSavePoints(prev => [point, ...prev]);
          // Also update game's lastPlayed
          setGames(prev => prev.map(g =>
            g.id === game_id ? { ...g, lastPlayed: timestamp.split(" ")[0] } : g
          ));
        });
      } catch {}
    };
    setup();
    return () => { if (unlisten) unlisten(); };
  }, [games]);

  // ── Poll every 5 s: detect tracked games + auto-detect new ones ───────────
  useEffect(() => {
    const poll = async () => {
      try {
        // ① Scan ALL running processes from Rust
        const allRunning = await invoke<string[]>("scan_all_processes");

        // ② Check tracked games first (fast O(n) match)
        const tracked = games.filter(g => (g.exeName ?? "").trim() !== "");
        const runningIds: string[] = [];
        tracked.forEach(g => {
          const stem = g.exeName.toLowerCase().replace(/\.exe$/i, "");
          if (allRunning.includes(stem)) runningIds.push(g.id);
        });

        if (runningIds.length > 0) {
          const running = games.find(g => g.id === runningIds[0]) ?? null;
          setNowPlaying(running);
          setDetectedGame(null); // tracked game → no toast
          setGames(prev => prev.map(g => ({ ...g, isActive: runningIds.includes(g.id) })));
        } else {
          setNowPlaying(null);
          setGames(prev => prev.map(g => ({ ...g, isActive: false })));

          // ③ Auto-detect: scan allRunning against game database
          let found: { name: string; exe: string } | null = null;
          for (const exe of allRunning) {
            if (ignoredExes.current.has(exe)) continue;
            const name = lookupGame(exe);
            if (!name) continue;
            // Don't show toast for games already in library (even without exe configured)
            const alreadyTracked = games.some(
              g => g.name.toLowerCase() === name.toLowerCase()
                || (g.exeName ?? "").toLowerCase().replace(/\.exe$/i, "") === exe
            );
            if (alreadyTracked) continue;
            found = { name, exe };
            break;
          }
          setDetectedGame(found);
        }
      } catch {
        // Not in Tauri — no-op
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [games.map(g => g.id + (g.exeName ?? "")).join(",")]);

  useEffect(() => { document.body.className = `bg-${view}`; }, [view]);

  const minimize  = () => { try { appWindow?.minimize();       } catch {} };
  const toggleMax = () => { try { appWindow?.toggleMaximize(); } catch {} };
  const close     = () => { try { appWindow?.close();          } catch {} };

  const handleAddGame = useCallback((game: Game) => {
    setGames(prev => [game, ...prev]);
  }, []);

  const handleUpdateGame = useCallback((updated: Game) => {
    setGames(prev => prev.map(g => g.id === updated.id ? updated : g));
  }, []);

  const handleDeleteSavePoint = (id: string) => {
    setSavePoints(prev => prev.filter(sp => sp.id !== id));
  };

  const filteredGames = games.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All"
      || g.status === statusFilter.toLowerCase().replace(" ", "-") as Game["status"];
    return matchSearch && matchStatus;
  });

  return (
    <>
      {/* ── Titlebar ── */}
      <div data-tauri-drag-region className="titlebar">
        <div style={{ marginRight: "auto", display: "flex", alignItems: "center", paddingLeft: 12, pointerEvents: "none" }}>
          <Gamepad2 size={15} color="var(--border-neon-cyan)" style={{ marginRight: 7 }} />
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2 }} className="text-gradient">SAVEIT</span>
        </div>
        <div className="titlebar-button" onClick={minimize}><Minus size={15} /></div>
        <div className="titlebar-button" onClick={toggleMax}><Square size={13} /></div>
        <div className="titlebar-button" id="titlebar-close" onClick={close}><X size={15} /></div>
      </div>

      {/* Now Playing Banner */}
      <NowPlayingBanner game={nowPlaying} />

      <div className="layout-container">
        {/* ── Sidebar ── */}
        <div className="sidebar">
          <h3 style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18 }}>Library</h3>

          {([
            { key: "library" as const, label: "All Games",          Icon: Gamepad2, accent: "var(--border-neon-cyan)"   },
            { key: "vault"   as const, label: "Saves & Milestones", Icon: History,  accent: "var(--border-neon-purple)" },
          ]).map(({ key, label, Icon, accent }) => (
            <motion.div
              key={key}
              onClick={() => { setView(key); setSelectedGame(null); }}
              whileHover={{ x: 4 }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                background: view === key ? "rgba(255,255,255,0.05)" : "transparent",
                borderRadius: 8, marginBottom: 8, cursor: "pointer",
                borderLeft: view === key ? `3px solid ${accent}` : "3px solid transparent",
                color: view === key ? "var(--text-main)" : "var(--text-muted)",
              }}
            >
              <Icon size={17} color={view === key ? accent : "var(--text-muted)"} />
              <span style={{ fontSize: 14 }}>{label}</span>
              {key === "vault" && savePoints.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 11, background: "var(--border-neon-purple)", color: "#000", borderRadius: 50, padding: "1px 7px", fontWeight: 700 }}>
                  {savePoints.length}
                </span>
              )}
            </motion.div>
          ))}

          {/* Recent games quick-nav */}
          {games.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Recent</h3>
              {games.slice(0, 6).map(g => (
                <motion.div
                  key={g.id}
                  whileHover={{ x: 4 }}
                  onClick={() => { setView("library"); setSelectedGame(g); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    borderRadius: 6, cursor: "pointer", marginBottom: 3,
                    background: selectedGame?.id === g.id ? `${g.accentColor}18` : "transparent",
                    color: selectedGame?.id === g.id ? g.accentColor : "var(--text-muted)",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{g.coverEmoji}</span>
                  <span style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{g.name}</span>
                  {g.isActive && (
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: g.accentColor, flexShrink: 0 }} />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <StatsPanel games={games} />
        </div>

        {/* ── Main Content ── */}
        <motion.div
          key={view + (selectedGame?.id ?? "")}
          className="main-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Library ── */}
          {view === "library" && !selectedGame && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h1 style={{ margin: "0 0 4px 0", fontSize: 34, fontWeight: 800 }}>Library</h1>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
                    {games.length === 0
                      ? "No games yet — click \"Track Game\" to add your first"
                      : `${games.length} game${games.length !== 1 ? "s" : ""} · ${games.filter(g => g.isActive).length} running now`}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, background: "rgba(0,245,255,0.15)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddModal(true)}
                  className="glass-panel"
                  style={{ padding: "0 18px", height: 42, display: "flex", alignItems: "center", gap: 8, color: "var(--border-neon-cyan)", border: "1px solid rgba(0,245,255,0.35)", background: "rgba(0,0,0,0.3)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                >
                  <Plus size={16} /> Track Game
                </motion.button>
              </div>

              {/* Search + filter */}
              <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, position: "relative", minWidth: 160 }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px 10px 36px", color: "var(--text-main)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                    placeholder="Search games…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {STATUS_FILTERS.map(f => (
                    <motion.button key={f} whileTap={{ scale: 0.95 }} onClick={() => setStatusFilter(f)}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === f ? "var(--border-neon-cyan)" : "rgba(255,255,255,0.08)", background: statusFilter === f ? "rgba(0,245,255,0.12)" : "rgba(255,255,255,0.03)", color: statusFilter === f ? "var(--border-neon-cyan)" : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                      {f}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              {filteredGames.length === 0 ? (
                <div className="glass-panel" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
                  <Gamepad2 size={40} style={{ marginBottom: 14, opacity: 0.25 }} />
                  <p style={{ margin: 0, fontSize: 16 }}>
                    {games.length === 0
                      ? 'No games tracked yet. Click "Track Game" to get started!'
                      : "No games match your filter."}
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 18 }}>
                  <AnimatePresence>
                    {filteredGames.map((game, i) => (
                      <GameCard key={game.id} game={game} index={i} onClick={() => setSelectedGame(game)} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* ── Game Detail ── */}
          {view === "library" && selectedGame && (
            <GameDetail game={selectedGame} onBack={() => setSelectedGame(null)} onUpdate={handleUpdateGame} />
          )}

          {/* ── Vault / Saves ── */}
          {view === "vault" && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ margin: "0 0 4px 0", fontSize: 34, fontWeight: 800 }}>Saves & Milestones</h1>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
                  Auto-detected save files and your captured milestone moments
                </p>
              </div>

              {/* Tab bar */}
              <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 4 }}>
                {([
                  { key: "saves"      as const, label: `Auto-Detected Saves (${savePoints.length})`, Icon: HardDrive },
                  { key: "milestones" as const, label: `Vault Milestones (${vault.length})`,          Icon: History   },
                ]).map(({ key, label, Icon }) => (
                  <motion.button key={key} whileTap={{ scale: 0.97 }} onClick={() => setVaultTab(key)}
                    style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: vaultTab === key ? "rgba(155,93,229,0.15)" : "transparent", color: vaultTab === key ? "var(--border-neon-purple)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, fontWeight: vaultTab === key ? 700 : 400, borderBottom: vaultTab === key ? "2px solid var(--border-neon-purple)" : "2px solid transparent" }}>
                    <Icon size={15} /> {label}
                  </motion.button>
                ))}
              </div>

              {vaultTab === "saves" && (
                <SavePointsList savePoints={savePoints} onDelete={handleDeleteSavePoint} />
              )}

              {vaultTab === "milestones" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {vault.length === 0 ? (
                    <div className="glass-panel" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                      <History size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
                      <p style={{ margin: 0 }}>No milestones yet. Open a game's detail view to capture one.</p>
                    </div>
                  ) : vault.map((item, i) => {
                    const game = games.find(g => g.id === item.gameId);
                    const accent = game?.accentColor ?? "#9b5de5";
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="glass-panel" style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: `3px solid ${accent}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{ background: `${accent}18`, padding: 14, borderRadius: 10 }}>
                            <History size={22} color={accent} />
                          </div>
                          <div>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>{item.gameName}</span>
                            <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: 13 }}>{item.timestamp} · {item.note}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Add Game Modal */}
      <AnimatePresence>
        {showAddModal && <AddGameModal onAdd={handleAddGame} onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>

      {/* Auto-Detected Game Toast */}
      <AnimatePresence>
        {detectedGame && (
          <DetectedGameToast
            gameName={detectedGame.name}
            exeName={detectedGame.exe}
            onDismiss={() => {
              ignoredExes.current.add(detectedGame.exe);
              setDetectedGame(null);
            }}
            onAdd={() => {
              // Quick-add the game with exe pre-filled; user can set save folder later
              const newGame: Game = {
                id:              generateId(),
                name:            detectedGame.name,
                genre:           "Unknown",
                platform:        "PC",
                accentColor:     "#00f5ff",
                coverEmoji:      "🎮",
                playtime:        0,
                lastPlayed:      "Just detected",
                saveSize:        "—",
                isActive:        true,
                completionPercent: 0,
                status:          "playing",
                sessions:        [],
                milestones:      [],
                exeName:         detectedGame.exe + ".exe",
                saveFolderPath:  "",
              };
              handleAddGame(newGame);
              setDetectedGame(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
