import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Cpu, FolderOpen } from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import type { Game } from "../types";
import { generateId } from "../store";

const GENRES   = ["RPG","Action RPG","Soulslike","FPS","Strategy","Metroidvania","Platformer","Simulation","Horror","Adventure","Sports","Other"];
const PLATFORMS = ["PC","PlayStation 5","Xbox Series X","Nintendo Switch","PlayStation 4","Xbox One","Mobile"];
const EMOJIS   = ["🎮","⚔️","🌆","🐉","🦋","🔫","🏰","🌌","🚀","🌊","🧙","🐒","🔮","🌸","🧊","🔥","⚡","🌿","🦊","🐺"];
const ACCENTS  = ["#00f5ff","#9b5de5","#f5c518","#ff6b35","#22c55e","#f43f5e","#3b82f6","#a855f7","#ec4899","#14b8a6"];

interface Props {
  onAdd: (game: Game) => void;
  onClose: () => void;
}

export default function AddGameModal({ onAdd, onClose }: Props) {
  const [name,           setName]          = useState("");
  const [genre,          setGenre]         = useState("RPG");
  const [platform,       setPlatform]      = useState("PC");
  const [emoji,          setEmoji]         = useState("🎮");
  const [accent,         setAccent]        = useState("#00f5ff");
  const [status,         setStatus]        = useState<Game["status"]>("playing");
  const [exeName,        setExeName]       = useState("");
  const [saveFolderPath, setSaveFolderPath] = useState("");

  const pickSaveFolder = async () => {
    try {
      const selected = await openDialog({ directory: true, multiple: false, title: "Select the game's save folder" });
      if (selected) setSaveFolderPath(selected as string);
    } catch {
      // not in Tauri env (browser preview) — let user type it
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const game: Game = {
      id: generateId(),
      name: name.trim(),
      genre,
      platform,
      accentColor: accent,
      coverEmoji: emoji,
      playtime: 0,
      lastPlayed: "Never",
      saveSize: "—",
      isActive: false,
      completionPercent: 0,
      status,
      sessions: [],
      milestones: [],
      exeName: exeName.trim(),
      saveFolderPath: saveFolderPath.trim(),
    };
    onAdd(game);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    padding: "10px 14px", color: "var(--text-main)", fontSize: 14,
    outline: "none", boxSizing: "border-box",
  };
  const label: React.CSSProperties = {
    fontSize: 12, color: "var(--text-muted)", marginBottom: 6,
    display: "block", textTransform: "uppercase", letterSpacing: 0.5,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="glass-panel"
          style={{ width: 520, maxHeight: "90vh", overflowY: "auto", padding: 32, position: "relative" }}
        >
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26 }}>
            <Gamepad2 size={22} color="var(--border-neon-cyan)" />
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Track New Game</h2>
          </div>

          {/* Cover preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
            <div style={{ width: 76, height: 76, borderRadius: 16, background: `${accent}22`, border: `2px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>
              {emoji}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Name */}
            <div>
              <label style={label}>Game Name *</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Elden Ring" autoFocus onKeyDown={e => e.key === "Enter" && handleSubmit()} />
            </div>

            {/* Genre + Platform */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={label}>Genre</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={genre} onChange={e => setGenre(e.target.value)}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Platform</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={platform} onChange={e => setPlatform(e.target.value)}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* ── Tracking section ── */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
              <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <Cpu size={14} color="var(--border-neon-cyan)" /> Auto-tracking (optional but recommended)
              </p>

              {/* Exe name */}
              <div style={{ marginBottom: 14 }}>
                <label style={label}>Game Executable Filename</label>
                <input
                  style={inputStyle}
                  value={exeName}
                  onChange={e => setExeName(e.target.value)}
                  placeholder="e.g.  eldenring.exe  or  witcher3.exe"
                />
                <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                  Used to detect when the game is running — shows "Playing {name || "…"}" live
                </p>
              </div>

              {/* Save folder */}
              <div>
                <label style={label}>Save Folder Path</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={saveFolderPath}
                    onChange={e => setSaveFolderPath(e.target.value)}
                    placeholder="C:\Users\You\Documents\EldenRing"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={pickSaveFolder}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "var(--text-main)", cursor: "pointer", flexShrink: 0 }}
                  >
                    <FolderOpen size={16} />
                  </motion.button>
                </div>
                <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                  SaveIt will watch this folder and capture the save filename whenever you save in-game
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={label}>Status</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["playing","backlog","on-hold","completed","dropped"] as Game["status"][]).map(s => (
                  <motion.button key={s} whileTap={{ scale: 0.95 }} onClick={() => setStatus(s)} style={{ padding: "6px 14px", borderRadius: 50, border: "1px solid", borderColor: status === s ? accent : "rgba(255,255,255,0.1)", background: status === s ? `${accent}22` : "transparent", color: status === s ? accent : "var(--text-muted)", cursor: "pointer", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Emoji */}
            <div>
              <label style={label}>Cover Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {EMOJIS.map(e => (
                  <motion.button key={e} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setEmoji(e)} style={{ fontSize: 22, background: emoji === e ? `${accent}33` : "rgba(255,255,255,0.05)", border: `1px solid ${emoji === e ? accent : "transparent"}`, borderRadius: 8, width: 40, height: 40, cursor: "pointer" }}>
                    {e}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Accent */}
            <div>
              <label style={label}>Accent Color</label>
              <div style={{ display: "flex", gap: 10 }}>
                {ACCENTS.map(c => (
                  <motion.button key={c} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setAccent(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${accent === c ? "white" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!name.trim()}
              style={{ width: "100%", padding: "14px", borderRadius: 10, background: name.trim() ? `${accent}20` : "rgba(255,255,255,0.05)", border: `1px solid ${name.trim() ? accent : "rgba(255,255,255,0.1)"}`, color: name.trim() ? accent : "var(--text-muted)", fontSize: 15, fontWeight: 700, cursor: name.trim() ? "pointer" : "default", transition: "all 0.2s" }}
            >
              Add to Library
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
